<template>
  <v-app>
    <v-main>
      <TargetInfo
        v-if="currentComponent === 'targetInfo'"
        :venue="userInfo.venue"
        @setSnackbar="setSnackbar"
      />
      <TargetMap
        v-if="currentComponent === 'targetMap'"
        :venue="userInfo.venue"
        @setSnackbar="setSnackbar"
        ref="refTargetMap"
      />
      <TargetScan
        v-if="currentComponent === 'targetScan'"
        :venue="userInfo.venue"
        @setSnackbar="setSnackbar"
        @nextTarget="nextTarget"
        ref="refTargetScan"
      />
      <Login
        v-if="currentComponent === 'login'"
        @setSnackbar="setSnackbar"
        @setUserInfo="setUserInfo"
      />
    </v-main>
    <v-bottom-navigation
      v-model="currentComponent"
      v-if="currentComponent !== 'login'"
    >
      <v-btn
        currentComponent="targetInfo"
        @click="changeComponent('targetInfo')"
      >
        <v-icon>mdi-information</v-icon>
        <span>Info</span>
      </v-btn>
      <v-btn currentComponent="targetMap" @click="changeComponent('targetMap')">
        <v-icon>mdi-map-marker</v-icon>
        <span>Map</span>
      </v-btn>
      <v-btn
        currentComponent="targetScan"
        @click="changeComponent('targetScan')"
      >
        <v-icon>mdi-magnify-scan</v-icon>
        <span>Scan</span>
      </v-btn>
      <v-btn
        currentComponent="confirmLogout"
        @click="confirmDialog.show = true"
      >
        <v-icon>mdi-door</v-icon>
        <span>Logout</span>
      </v-btn>
    </v-bottom-navigation>
    <client-only>
      <v-snackbar
        v-model="snackbar.show"
        :timeout="snackbar.timeout"
        :color="snackbar.color"
      >
        {{ snackbar.msg }}
      </v-snackbar>
      <v-dialog v-model="confirmDialog.show" persistent>
        <v-card max-width="600" class="mx-auto">
          <v-card-title class="text-h5"> ログアウト </v-card-title>
          <v-card-text>ログアウトします。よろしいですか？</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green-darken-1"
              variant="text"
              @click="
                closeConfirmDialog();
                reload();
              "
            >
              はい
            </v-btn>
            <v-btn
              color="green-darken-1"
              variant="text"
              @click="
                closeConfirmDialog();
                changeComponent('targetInfo');
              "
            >
              いいえ
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </client-only>
    <!-- admin link -->
    <div class="admin-icon" @click="openAdmin">
      <v-icon>mdi-star-shooting</v-icon>
    </div>
  </v-app>
</template>

<script setup lang="ts">
const currentComponent = ref("login");
const userInfo = reactive({
  userId: "",
  userName: "",
  image: "",
  comments: "",
  venue: {
    venueName: "",
    comments: "",
    pos: 0,
    targets: <any[]>[],
  },
});
const snackbar = reactive({
  show: false,
  timeout: 2000,
  color: "",
  msg: "",
});
const confirmDialog = reactive({
  show: false,
  title: "",
  msg: "",
  func: null,
  params: null,
});

const refTargetMap = ref();
const refTargetScan = ref();
const pollingMsgId = ref();

const changeComponent = async (componentName: string) => {
  if (currentComponent.value === "login" && componentName === "targetInfo") {
    await initGeolocation();
  }
  if (
    currentComponent.value !== "targetMap" &&
    typeof refTargetMap.value !== "undefined" &&
    refTargetMap.value !== null
  ) {
    refTargetMap.value.stopDrawMap();
  }
  if (
    currentComponent.value !== "targetScan" &&
    typeof refTargetScan.value !== "undefined" &&
    refTargetScan.value !== null
  ) {
    refTargetScan.value.stopVideo();
  }
  currentComponent.value = componentName;
};

const setSnackbar = (
  show: boolean,
  timeout: number,
  color: string,
  msg: string
) => {
  snackbar.show = show;
  snackbar.timeout = timeout;
  snackbar.color = color;
  snackbar.msg = msg;
};

const closeConfirmDialog = () => {
  confirmDialog.show = false;
};

const reload = () => {
  location.reload();
};

const setUserInfo = (user: any) => {
  userInfo.userId = user.userId;
  userInfo.userName = user.userName;
  userInfo.image = user.image;
  userInfo.comments = user.comments;
  userInfo.venue = user.venue;
  changeComponent("targetInfo");
};

const nextTarget = () => {
  if (userInfo.venue.pos < userInfo.venue.targets.length - 1) {
    userInfo.venue.targets[userInfo.venue.pos].targetStatus = 2;
    userInfo.venue.pos++;
    userInfo.venue.targets[userInfo.venue.pos].targetStatus = 1;
    changeComponent("targetInfo");
  } else {
    setSnackbar(true, 5000, "success", "おめでとう");
    userInfo.venue.targets[userInfo.venue.pos].targetStatus = 2;
    userInfo.venue.pos = 0;
    changeComponent("targetInfo");
  }
};

const openAdmin = () => {
  window.open("/admin", "_blank");
};

const initGeolocation = async () => {
  if (!navigator.geolocation || !navigator.geolocation.watchPosition) {
    setSnackbar(true, 2000, "warning", "geolocation is invalid");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const userGps = getUserGps(position);
      await useFetch("/api/UpdatePos", {
        method: "POST",
        body: { userGps: userGps },
      });
    },
    (e: any) => {
      // setSnackbar(true, 2000, "warning", e.message);
      return;
    },
    {
      enableHighAccuracy: true,
      timeout: 2000,
    }
  );

  navigator.geolocation.watchPosition(
    async (position) => {
      const userGps = getUserGps(position);
      await useFetch("/api/UpdatePos", {
        method: "POST",
        body: { userGps: userGps },
      });
    },
    (e: any) => {
      // setSnackbar(true, 2000, "warning", e.message);
      return;
    },
    {
      enableHighAccuracy: true,
      timeout: 2000,
    }
  );

  // debug ------------------------
  const pollingTestId = setInterval(async () => {
    const position = {
      coords: {
        latitude: 35.15700033 + Math.random() / 1000,
        longitude: 136.9259228 + Math.random() / 1000,
        accuracy: 1,
      },
    };

    const userGps = getUserGps(position);
    await useFetch("/api/UpdatePos", {
      method: "POST",
      body: { userGps: userGps },
    });
  }, 3500);
  // debug ------------------------
};

const getUserGps = (position: any) => {
  return {
    userId: userInfo.userId,
    userName: userInfo.userName,
    image: userInfo.image,
    gps: {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    },
    self: true,
  };
};

onMounted(() => {
  pollingMsgId.value = setInterval(async () => {
    const { data: res } = await useFetch("/api/GetMsg", {
      method: "GET",
    });
    const msg = (res.value as any)?.msg;
    if (msg) {
    }
  }, 3000);
});

onBeforeUnmount(() => {
  clearInterval(pollingMsgId.value);
});
</script>

<style scoped lang="scss">
.admin-icon {
  position: fixed;
  bottom: 0.5rem;
  right: 0.5rem;
  opacity: 0.5;
  font-size: 0.9rem;
}
</style>
