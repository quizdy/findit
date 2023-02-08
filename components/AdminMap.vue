<template>
  <v-card class="mx-auto">
    <v-toolbar color="light-blue" dark>
      <p class="ml-4">会場マップ</p>
      <v-spacer></v-spacer>
      <v-btn class="ml-1" @click="venueList"
        ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
      >
      <v-btn class="ml-1" @click="msgDialog = true"
        ><v-icon>mdi-email-fast-outline</v-icon></v-btn
      >
      <v-btn class="ml-1" @click="missionDialog = true"
        ><v-icon>mdi-alert-box</v-icon></v-btn
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
    <v-dialog v-model="msgDialog">
      <v-card width="100%" max-width="800" class="mx-auto">
        <v-card-title class="text-h6 justify-center mt-4">
          メッセージ送信
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  solo
                  v-model="adminMsg"
                  label="メッセージ"
                  variant="solo"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-select
                  label="参加者"
                  :items="attendee"
                  item-title="userName"
                  item-value="userId"
                  v-model="selectedUsers"
                  variant="solo"
                  multiple
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="
              closeMsgDialog();
              sendMsg();
            "
          >
            メッセージ送信
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeMsgDialog">
            キャンセル
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="missionDialog">
      <MissionDialog
        :venue="propsAdminMap.venue"
        @closeMissionDialog="closeMissionDialog"
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

const msgDialog = ref(false);
const missionDialog = ref(false);
const attendee = ref();
const selectedUsers = ref(<any[]>[]);
const adminMsg = ref("");

let targetMarkers = ref(<any[]>[]);
let userMarkers = ref(<any[]>[]);

const { data: resGetUsers } = await useFetch("/api/GetUsers", {
  method: "GET",
  params: {
    venueName: propsAdminMap.venue.venueName,
  },
});

attendee.value = resGetUsers.value?.users;

const closeMsgDialog = () => {
  msgDialog.value = false;
};

const closeMissionDialog = () => {
  missionDialog.value = false;
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

const reset = async () => {
  await useFetch("/api/ClearPos", {
    method: "POST",
    params: {
      userId: "",
    },
  });
};

const sendMsg = async () => {
  if (!adminMsg.value) {
    emitsAdminMap(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "メッセージを入力して下さい"
    );
    return;
  }

  if (Object.values(selectedUsers.value).length < 1) {
    emitsAdminMap(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "参加者を指定してください"
    );
    return;
  }

  await useFetch("/api/SendMsg", {
    method: "POST",
    body: {
      venueName: propsAdminMap.venue.venueName,
      sender: "admin",
      users: Object.values(selectedUsers.value),
      msg: adminMsg.value,
    },
  });

  emitsAdminMap(
    "setSnackbar",
    true,
    2000,
    "info",
    "bottom",
    "メッセージを送信しました"
  );

  adminMsg.value = "";
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
