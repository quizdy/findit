<template>
  <v-app>
    <v-main
      ><v-btn
        @click="showMissionDialog('#2')"
        style="position: absolute; z-index: 999"
        >aaa</v-btn
      >
      <TargetInfo
        v-if="currentComponent === 'targetInfo'"
        :user="userInfo"
        @setSnackbar="setSnackbar"
        @openMsgDialog="openMsgDialog"
        @onSlideChange="onSlideChange"
        ref="refTargetInfo"
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
        @login="login"
      />
      <Finish v-if="currentComponent === 'finish'" />
      <v-progress-circular
        v-show="loading"
        class="loading"
        indeterminate
        color="light-blue"
        :size="70"
        :width="7"
      ></v-progress-circular>
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
      <v-btn @click="logoutDialog = true">
        <v-icon>mdi-door</v-icon>
        <span>Exit</span>
      </v-btn>
    </v-bottom-navigation>
    <client-only>
      <v-snackbar
        v-model="snackbar.show"
        :timeout="snackbar.timeout"
        :color="snackbar.color"
        :location="snackbar.location"
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
      <v-dialog
        v-model="missionDialog"
        persistent
        style="background: rgba(0, 0, 0, 0.5)"
      >
        <MissionDialog
          :user="userInfo"
          :mission="mission"
          @setSnackbar="setSnackbar"
          @closeMissionDialog="closeMissionDialog"
        />
      </v-dialog>
      <v-dialog v-model="logoutDialog" persistent>
        <LogoutDialog
          @closeLogoutDialog="closeLogoutDialog"
          @changeComponent="changeComponent"
          @clearPos="clearPos"
        />
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
  },
});
const snackbar = reactive({
  show: false,
  timeout: 2000,
  color: "",
  location: "top",
  msg: "",
});

const loading = ref(false);

const attendee = ref([]);
const mission = ref();

const msgDialog = ref(false);
const missionDialog = ref(false);
const logoutDialog = ref(false);

const refTargetInfo = ref();
const refTargetMap = ref();
const refTargetScan = ref();
const pollingMsgId = ref();

const stream = ref();

const changeComponent = (componentName: string) => {
  if (currentComponent.value === "login") {
    init();
  }

  currentComponent.value = componentName;
};

const init = async () => {
  await initAttendee();
  await initGeolocation();
  await initMedia();
  initGetMsg();
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

const closeMissionDialog = (no: number) => {
  missionDialog.value = false;

  const pos = userInfo.venue.targets.findIndex(
    (_target: any) => _target.no === no
  );
  refTargetInfo.value.slideTo(pos);
};

const closeLogoutDialog = () => {
  logoutDialog.value = false;
};

const login = async (userId: string) => {
  loading.value = true;

  if (!userId) {
    setSnackbar(true, 2000, "warning", "top", "ユーザＩＤを入力して下さい");
    return;
  }

  const { data: resGetUser } = await useFetch("/api/GetUser", {
    method: "GET",
    params: { userId: userId },
  });

  if (!resGetUser.value.userId) {
    setSnackbar(true, 2000, "warning", "top", "ユーザが見つかりませんでした");
    return;
  }

  const user = resGetUser.value;

  if (user.venue.targets.length === 0) {
    setSnackbar(true, 2000, "warning", "top", "ターゲットが登録されていません");
    return;
  }

  userInfo.userId = user.userId;
  userInfo.userName = user.userName;
  userInfo.image = user.image;
  userInfo.comments = user.comments;
  userInfo.venue = user.venue;

  if (!userInfo.venue.targets.some((_target) => _target.targetStatus === 1)) {
    userInfo.venue.targets[0].targetStatus = 1;
  }

  changeComponent("targetInfo");

  loading.value = false;
};

const onSlideChange = (activeIndex: number) => {
  userInfo.venue.pos = activeIndex;
};

const nextTarget = async () => {
  changeComponent("targetInfo");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  checkedMp3.value.play();
  const target = userInfo.venue.targets[userInfo.venue.pos];
  target.targetStatus = 2;
  broadMsg("「" + target.title + "」を発見しました。");
  updateStatus(target.no, 2);

  userInfo.venue.pos = userInfo.venue.targets.findIndex(
    (_target: any) => _target.type === "" || _target.targetStatus === 0
  );

  if (userInfo.venue.pos < 0) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    broadMsg("すべてのターゲットを発見しました。");
    changeComponent("finish");
  } else {
    const target = userInfo.venue.targets[userInfo.venue.pos];
    target.targetStatus = 1;
    updateStatus(target.no, 2);
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

const updateStatus = async (targetNo: number, targetStatus: number) => {
  await useFetch("/api/UpdateStatus", {
    method: "POST",
    body: {
      userId: userInfo.userId,
      no: targetNo,
      targetStatus: targetStatus,
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

  // const pos = {
  //   // Kosaka
  //   // coords: {
  //   //   latitude: 35.18936160259076,
  //   //   longitude: 136.98873472643598,
  //   // },
  //   // Nit
  //   coords: {
  //     latitude: 35.157010833329714,
  //     longitude: 136.92591221034223,
  //   },
  // };

  // const pollingTestId = setInterval(async () => {
  //   pos.coords.latitude =
  //     pos.coords.latitude +
  //     (Math.random() < 0.5
  //       ? Math.floor(Math.random() * -11) / 100000
  //       : Math.floor(Math.random() * 11) / 100000);
  //   pos.coords.longitude =
  //     pos.coords.longitude +
  //     (Math.random() < 0.5
  //       ? Math.floor(Math.random() * -11) / 100000
  //       : Math.floor(Math.random() * 11) / 100000);
  //   const userPos = getUserPos(pos);
  //   await useFetch("/api/UpdatePos", {
  //     method: "POST",
  //     body: { userPos: userPos },
  //   });
  // }, 2500);
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
      if (message.startsWith("#")) {
        showMissionDialog(message);
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

  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (device) => device.kind === "videoinput"
  );

  if (devices.length === 0) {
    setSnackbar(
      true,
      2000,
      "warning",
      "bottom",
      "カメラデバイスが見つかりませんでした"
    );
    return;
  }

  const constraints = {
    audio: false,
    video: {},
  };

  if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) !== null) {
    (constraints.video as any) = {
      facingMode: {
        exact: "environment",
      },
    };
  } else {
    (constraints.video as any) = true;
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((st) => {
      stream.value = st;
    })
    .catch((e) => {
      setSnackbar(true, 2000, "warning", "top", e.name);
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

const showMissionDialog = (message: string) => {
  const no = message.substring(1).trim();
  const pos = userInfo.venue.targets.findIndex(
    (_target: any) => _target.no === Number(no)
  );
  userInfo.venue.targets[pos].targetStatus = 1;
  mission.value = userInfo.venue.targets[pos];
  missionDialog.value = true;
  changeComponent("targetInfo");
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
.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  opacity: 0.8;
  z-index: 999;
}
.admin-icon {
  position: fixed;
  bottom: 0.5rem;
  right: 0.5rem;
  opacity: 0.5;
  font-size: 0.9rem;
}
</style>
