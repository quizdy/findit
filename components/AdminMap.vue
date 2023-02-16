<template>
  <v-card class="mx-auto">
    <v-toolbar color="light-blue" dark>
      <p class="ml-4">会場マップ</p>
      <v-spacer></v-spacer>
      <v-btn class="ml-1" @click="venueList"
        ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
      >
      <v-btn class="ml-1" @click="openAdminMsgDialog"
        ><v-icon>mdi-email-fast-outline</v-icon></v-btn
      >
    </v-toolbar>
    <div id="map" v-show="!loading"></div>
    <v-progress-circular
      v-show="loading"
      indeterminate
      color="light-blue"
      :size="70"
      :width="7"
      style="margin: 50% calc(50% - 2rem)"
    ></v-progress-circular>
  </v-card>
  <client-only>
    <v-dialog v-model="adminMsgDialog">
      <AdminMsgDialog
        :venue="propsAdminMap.venue"
        @setSnackbar="setSnackbar"
        @closeAdminMsgDialog="closeAdminMsgDialog"
      />
    </v-dialog>
  </client-only>
</template>

<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader";

const emitsAdminMap = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    adminMsg: string
  ): void;
  (e: "changeComponent", componentName: string): void;
}>();

const propsAdminMap = defineProps<{
  venue: any;
}>();

const $config = useRuntimeConfig();
const $gmap = ref<google.maps.Map>();
const zoom = ref(18);
const pollingPosId = ref();
const pollingMsgId = ref();
const loading = ref(false);

let targetMarkers = ref(<any[]>[]);
let userMarkers = ref(<any[]>[]);

const adminMsgDialog = ref(false);

const setSnackbar = (
  show: boolean,
  timeout: number,
  color: string,
  location: string,
  msg: string
) => {
  emitsAdminMap("setSnackbar", show, timeout, color, location, msg);
};

const openAdminMsgDialog = () => {
  adminMsgDialog.value = true;
};

const closeAdminMsgDialog = () => {
  adminMsgDialog.value = false;
};

onMounted(async () => {
  loading.value = true;
  const loader = new Loader({
    apiKey: $config.GMAP_API_KEY,
    version: "weekly",
    libraries: ["places"],
  });

  const google = await loader.load();
  const mapId = document.getElementById("map") as HTMLElement;

  $gmap.value = new google.maps.Map(mapId, {
    center: new google.maps.LatLng(
      propsAdminMap.venue.lat,
      propsAdminMap.venue.lng
    ),
    zoom: zoom.value,
    disableDefaultUI: true,
    zoomControl: true,
  });

  propsAdminMap.venue.targets.forEach((target: any) => {
    setTargetMarker(target);
  });

  loading.value = false;

  watchUserPos();

  google.maps.event.addListener($gmap.value, "zoom_changed", () => {
    zoom.value = $gmap.value?.getZoom();
  });
});

const watchUserPos = () => {
  pollingPosId.value = setInterval(async () => {
    const { data: res } = await useFetch("/api/GetPos", {
      method: "GET",
    });
    const usersPos = (res.value as any)?.usersPos;

    if (0 < usersPos.length) {
      usersPos.forEach((_userPos: any) => {
        if (_userPos) setUserMarker(_userPos);
      });
    }
  }, 3000);
};

const setUserMarker = (userPos: any) => {
  const latLng = new google.maps.LatLng(userPos.gps.lat, userPos.gps.lng);

  const markers = userMarkers.value.filter(
    (_marker) => _marker.userId === userPos.userId
  );

  if (0 < markers.length) {
    markers[0].userMarker.setPosition(latLng);
    return;
  }

  const userMarker = new google.maps.Marker({
    position: latLng,
    title: userPos.userName,
    icon: {
      url: userPos.image,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
  });

  userMarker.setMap($gmap.value);

  const infoWindow = new google.maps.InfoWindow({
    content: "<div class='mx-2'><h3>" + userPos.userName + "</h3></div>",
  });

  userMarker.addListener("click", () => {
    infoWindow.open($gmap.value, userMarker);
  });

  userMarkers.value = [
    ...userMarkers.value,
    {
      userId: userPos.userId,
      userMarker: userMarker,
    },
  ];
};

const setTargetMarker = (target: any) => {
  const latLng = new google.maps.LatLng(target.lat, target.lng);

  const markers = targetMarkers.value.filter(
    (_marker) => _marker.no === target.no
  );

  if (0 < markers.length) {
    return;
  }

  const targetMarker = new google.maps.Marker({
    position: latLng,
    icon: {
      url: target.icon,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
    visible: true,
    zIndex: 1,
  });

  targetMarker.setMap($gmap.value);

  const infoWindow = new google.maps.InfoWindow({
    content: "<div class='mx-2'><h3>" + target.title + "</h3></div>",
  });

  targetMarker.addListener("click", () => {
    infoWindow.open($gmap.value, targetMarker);
  });

  targetMarkers.value = [
    ...targetMarkers.value,
    {
      no: target.no,
      targetMarker: targetMarker,
    },
  ];
};

const stopDrawMap = () => {
  clearInterval(pollingPosId.value);
};

const venueList = () => {
  emitsAdminMap("changeComponent", "venueList");
};

onMounted(() => {
  pollingMsgId.value = setInterval(async () => {
    const { data: res } = await useFetch("/api/GetMsg", {
      method: "GET",
      params: {
        venueName: propsAdminMap.venue.venueName,
        userId: "admin",
      },
    });
    const message = (res.value as any)?.message;
    const sender = (res.value as any)?.sender;
    if (message) {
      emitsAdminMap(
        "setSnackbar",
        true,
        -1,
        "info",
        "bottom left",
        sender + ":" + message
      );
    }
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(pollingMsgId.value);
});

defineExpose({
  stopDrawMap,
});
</script>

<style scoped lang="scss">
#map {
  height: 90dvh;
  width: 100%;
}
</style>
