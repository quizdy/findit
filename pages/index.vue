<template>
  <v-app>
    <v-main>
      <TargetInfo
        v-if="currentComponent === 'targetInfo'"
        :user="userInfo"
        @setSnackbar="setSnackbar"
        @openMsgDialog="openMsgDialog"
      />
      <TargetMap
        v-if="currentComponent === 'targetMap'"
        :user="userInfo"
        @setSnackbar="setSnackbar"
        ref="refTargetMap"
      />
      <TargetScan
        v-if="currentComponent === 'targetScan'"
        :venue="userInfo.venue"
        :stream="stream"
        @setSnackbar="setSnackbar"
        @nextTarget="nextTarget"
        ref="refTargetScan"
      />
      <Login
        v-if="currentComponent === 'login'"
        @setSnackbar="setSnackbar"
        @setUserInfo="setUserInfo"
      />
      <Finish v-if="currentComponent === 'finish'" />
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
      <v-btn @click="confirmDialog = true">
        <v-icon>mdi-door</v-icon>
        <span>Exit</span>
      </v-btn>
    </v-bottom-navigation>
    <client-only>
      <v-snackbar
        v-model="snackbar.show"
        :timeout="snackbar.timeout"
        :color="snackbar.color"
        location="top"
        @click="snackbar.show = false"
      >
        {{ snackbar.msg }}
      </v-snackbar>
      <v-dialog v-model="msgDialog">
        <MsgDialog
          :user="userInfo"
          @setSnackbar="setSnackbar"
          @closeMsgDialog="closeMsgDialog"
        />
      </v-dialog>
      <v-dialog v-model="confirmDialog" persistent>
        <v-card max-width="600" class="mx-auto">
          <v-card-title class="text-h5"> 終了 </v-card-title>
          <v-card-text>終了します。よろしいですか？</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green-darken-1"
              variant="text"
              @click="
                closeConfirmDialog();
                clearPos();
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
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

const checkedMp3 = ref();

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
    missions: <any[]>[],
  },
});
const snackbar = reactive({
  show: false,
  timeout: 2000,
  color: "",
  location: "top",
  msg: "",
});

const attendee = ref([]);

const msgDialog = ref(false);
const confirmDialog = ref(false);

const refTargetMap = ref();
const refTargetScan = ref();
const pollingMsgId = ref();

const stream = ref();

const changeComponent = async (componentName: string) => {
  if (currentComponent.value === "login" && componentName === "targetInfo") {
    await initAttendee();
    await initGeolocation();
    await initMedia();
    initGetMsg();
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
  location: string,
  msg: string
) => {
  snackbar.show = show;
  snackbar.timeout = timeout;
  snackbar.color = color;
  snackbar.location = location;
  snackbar.msg = msg;
};

const openMsgDialog = () => {
  msgDialog.value = true;
};

const closeMsgDialog = () => {
  msgDialog.value = false;
};

const closeConfirmDialog = () => {
  confirmDialog.value = false;
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

  userInfo.venue.missions = user.venue.targets.filter(
    (_target: any) => _target.mission
  );

  userInfo.venue.targets = user.venue.targets.filter(
    (_target: any) => !_target.mission
  );

  changeComponent("targetInfo");
};

const nextTarget = async () => {
  changeComponent("targetInfo");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  checkedMp3.value.play();
  userInfo.venue.targets[userInfo.venue.pos].targetStatus = 2;

  if (userInfo.venue.pos < userInfo.venue.targets.length - 1) {
    broadMsg(
      "「" +
        userInfo.venue.targets[userInfo.venue.pos].title +
        "」を発見しました。"
    );
    userInfo.venue.pos++;
    userInfo.venue.targets[userInfo.venue.pos].targetStatus = 1;
  } else {
    broadMsg("ゴールしました。");
    userInfo.venue.pos = 0;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    changeComponent("finish");
  }
};

const broadMsg = async (msg: string) => {
  await useFetch("/api/SendMsg", {
    method: "POST",
    body: {
      venueName: userInfo.venue.venueName,
      sender: userInfo.userName,
      users: attendee.value,
      msg: msg,
    },
  });
};

const openAdmin = () => {
  window.open("/admin", "_blank");
};

const initAttendee = async () => {
  const { data: resGetUsers } = await useFetch("/api/GetUsers", {
    method: "GET",
    params: {
      venueName: userInfo.venue.venueName,
    },
  });

  resGetUsers.value?.users.forEach((_user) => {
    if (_user.userId !== userInfo.userId) {
      attendee.value.push(_user.userId);
    }
  });

  attendee.value.push("admin");
};

const initGeolocation = () => {
  if (!navigator.geolocation || !navigator.geolocation.watchPosition) {
    setSnackbar(true, 2000, "warning", "top", "geolocation is invalid");
    return;
  }

  clearPos();

  // navigator.geolocation.getCurrentPosition(
  //   (position) => {
  //     const userPos = getUserPos(position);
  //     setUserPos(userPos);
  //   },
  //   (e: any) => {
  //     setSnackbar(true, 2000, "warning", "top", e.message);
  //     return;
  //   },
  //   {
  //     enableHighAccuracy: true,
  //     timeout: 2000,
  //   }
  // );

  navigator.geolocation.watchPosition(
    (position) => {
      const userPos = getUserPos(position);
      setUserPos(userPos);
    },
    (e: any) => {
      setSnackbar(true, 2000, "warning", "top", e.message);
      return;
    },
    {
      enableHighAccuracy: true,
      timeout: 2000,
    }
  );

  // debug ------------------------

  const pos = {
    // Kosaka
    // coords: {
    //   latitude: 35.18936160259076,
    //   longitude: 136.98873472643598,
    // },
    // Nit
    coords: {
      latitude: 35.157010833329714,
      longitude: 136.92591221034223,
    },
  };

  const pollingTestId = setInterval(async () => {
    pos.coords.latitude =
      pos.coords.latitude +
      (Math.random() < 0.5
        ? Math.floor(Math.random() * -11) / 100000
        : Math.floor(Math.random() * 11) / 100000);
    pos.coords.longitude =
      pos.coords.longitude +
      (Math.random() < 0.5
        ? Math.floor(Math.random() * -11) / 100000
        : Math.floor(Math.random() * 11) / 100000);
    const userPos = getUserPos(pos);
    await useFetch("/api/UpdatePos", {
      method: "POST",
      body: { userPos: userPos },
    });
  }, 2500);
  // debug ------------------------
};

const getUserPos = (position: any) => {
  return {
    userId: userInfo.userId,
    userName: userInfo.userName,
    image: userInfo.image,
    gps: {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    },
  };
};

const setUserPos = async (userPos: any) => {
  await useFetch("/api/UpdatePos", {
    method: "POST",
    body: { userPos: userPos },
  });
};

const initGetMsg = () => {
  pollingMsgId.value = setInterval(async () => {
    const { data: res } = await useFetch("/api/GetMsg", {
      method: "GET",
      params: {
        venueName: userInfo.venue.venueName,
        userId: userInfo.userId,
      },
    });
    const message = (res.value as any)?.message;
    if (message) {
      if (message === "mission") {
        alert("mission");
      } else {
        setSnackbar(true, -1, "info", "top", message);
      }
    }
  }, 1000);
};

const initMedia = async () => {
  if (typeof window !== "object") {
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setSnackbar(true, 2000, "warning", "top", "カメラデバイスが無効です");
    return;
  }

  const constraints = {
    audio: false,
    video: { facingMode: { exact: "environment" } },
  };

  const requestPermission = (
    DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
  ).requestPermission;

  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (device) =>
      device.kind === "videoinput" &&
      (device.label.includes("USB") || device.label.includes("Webcam"))
  );

  if (0 < devices.length) {
    (constraints.video as any) = true;
  }

  if (typeof requestPermission === "function") {
    (constraints.video as any) = { facingMode: { exact: "environment" } };
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((st) => {
      stream.value = st;
    })
    .catch((e) => {
      setSnackbar(true, 2000, "warning", "top", e.message);
    });
};

const clearPos = async () => {
  await useFetch("/api/ClearPos", {
    method: "POST",
    params: {
      userId: userInfo.userId,
    },
  });
};

onMounted(() => {
  checkedMp3.value = new Audio("/sounds/checked.mp3");
});

onBeforeUnmount(() => {
  clearInterval(pollingMsgId.value);
  clearPos();
  // if (stream.value) {
  //   stream.value.getTracks().forEach((track: any) => {
  //     track.stop();
  //   });
  // }
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
