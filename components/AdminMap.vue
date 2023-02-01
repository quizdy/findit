<template>
  <v-card max-width="600" class="mx-auto">
    <v-toolbar color="light-blue" dark>
      <p class="ml-4">会場マップ</p>
      <v-spacer></v-spacer>
      <v-btn class="ml-1" @click="venueList"
        ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
      >
      <v-btn class="ml-1" @click="msgDialog = true"
        ><v-icon>mdi-email-fast-outline</v-icon></v-btn
      >
      <v-btn class="ml-1" @click="reset"
        ><v-icon>mdi-rotate-left</v-icon></v-btn
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
    <v-dialog v-model="msgDialog" persistent>
      <v-card max-width="800" class="mx-auto">
        <v-card-title class="text-h5">
          <span class="text-h6">メッセージ送信</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="msg"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green-darken-1"
            variant="text"
            @click="
              closeMsgDialog();
              sendMsg();
            "
          >
            メッセージ送信
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="closeMsgDialog">
            キャンセル
          </v-btn>
        </v-card-actions>
      </v-card>
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
    msg: string
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
const loading = ref(false);
const msgDialog = ref(false);
const userId = ref("");
const msg = ref("");

const closeMsgDialog = () => {
  msgDialog.value = false;
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
    const latLng = new google.maps.LatLng(target.lat, target.lng);
    target.icon = "/images/treasure1.png";
    setTargetMarker(target.title, target.icon, latLng);
  });

  loading.value = false;

  watchUserPos();

  google.maps.event.addListener($gmap.value, "zoom_changed", () => {
    zoom.value = $gmap.value?.getZoom();
  });
});

const setUserPos = (userGps: any) => {
  setUserMarker(userGps);
  // if (userGps.self) {
  //   const latLng = new google.maps.LatLng(userGps.gps.lat, userGps.gps.lng);
  //   $gmap.value?.panTo(latLng);
  //   new google.maps.Circle({
  //     map: $gmap.value,
  //     center: latLng,
  //     radius: userGps.gps.accuracy,
  //     strokeColor: "#0081C9",
  //     strokeOpacity: 0.5,
  //     strokeWeight: 0.75,
  //     fillColor: "#0081C9",
  //     fillOpacity: 0.18,
  //   });
  //   if (typeof google.maps.geometry !== "undefined") {
  //     const distance = google.maps.geometry.spherical.computeDistanceBetween(
  //       latLng,
  //       targetLatLng
  //     )
  //   };
  // }
};

const watchUserPos = () => {
  pollingPosId.value = setInterval(async () => {
    const { data: res } = await useFetch("/api/GetPos", {
      method: "GET",
    });
    const usersGps = (res.value as any)?.usersGps;

    if (0 < usersGps.length) {
      usersGps.forEach((_userGps: any) => {
        if (_userGps) setUserPos(_userGps);
      });
    }
  }, 3000);
};

const setTargetMarker = (title: string, icon: string, latLng: any) => {
  const targetMarker = new google.maps.Marker({
    position: latLng,
    icon: {
      url: icon,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
  });
  targetMarker.setMap($gmap.value);
};

let userMarkers = ref(<any[]>[]);

const setUserMarker = (userGps: any) => {
  const latLng = new google.maps.LatLng(userGps.gps.lat, userGps.gps.lng);

  const markers = userMarkers.value.filter(
    (_marker) => _marker.userId === userGps.userId
  );

  if (0 < markers.length) {
    markers[0].userMarker.setPosition(latLng);
    return;
  }

  const userMarker = new google.maps.Marker({
    position: latLng,
    title: userGps.userName,
    icon: {
      url: userGps.image,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
  });

  userMarker.setMap($gmap.value);

  userMarkers.value = [
    ...userMarkers.value,
    {
      userId: userGps.userId,
      userMarker: userMarker,
    },
  ];
};

const stopDrawMap = () => {
  clearInterval(pollingPosId.value);
};

const venueList = () => {
  emitsAdminMap("changeComponent", "venueList");
};

const reset = async () => {
  await useFetch("/api/ClearPos", {
    method: "POST",
    body: { userId: userId, msg: msg.value },
  });
};

const sendMsg = async () => {
  await useFetch("/api/SendMsg", {
    method: "POST",
  });
};

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
