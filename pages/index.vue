<template>
  <v-app>
    <v-main>
      <TargetInfo
        v-if="currentComponent === 'targetInfo'"
        :venue="userInfo.venue"
      />
      <TargetMap
        v-if="currentComponent === 'targetMap'"
        :venue="userInfo.venue"
        :userInfo="userInfo"
        :usersGps="usersGps"
      />
      <TargetScan
        v-if="currentComponent === 'targetScan'"
        :venue="userInfo.venue"
        @nextTarget="nextTarget"
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
        currentComponent="logout"
        @click="
          showConfirmDialog(
            true,
            'ログアウト',
            'ログアウトします。よろしいですか？',
            changeComponent,
            'login'
          )
        "
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
          <v-card-title class="text-h5">
            {{ confirmDialog.title }}
          </v-card-title>
          <v-card-text>{{ confirmDialog.msg }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green-darken-1"
              variant="text"
              @click="
                closeConfirmDialog();
                confirmDialog.func(confirmDialog.params);
              "
            >
              はい
            </v-btn>
            <v-btn
              color="green-darken-1"
              variant="text"
              @click="closeConfirmDialog"
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
const { $socket } = useNuxtApp();
const currentComponent = ref("login");
const userInfo = reactive({
  userId: "",
  userName: "",
  comments: "",
  venue: {
    venueName: "",
    comments: "",
    pos: 0,
    targets: [],
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

let usersGps = ref([]);

const changeComponent = async (componentName: string) => {
  if (currentComponent.value === "login" && componentName === "targetInfo") {
    await initGeolocation();
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

const showConfirmDialog = (
  show: boolean,
  title: string,
  msg: string,
  func: any,
  params: any
) => {
  confirmDialog.show = show;
  confirmDialog.title = title;
  confirmDialog.msg = msg;
  confirmDialog.func = func;
  confirmDialog.params = params;
};

const closeConfirmDialog = () => {
  confirmDialog.show = false;
};

const setUserInfo = async (user: any) => {
  userInfo.userId = user.userId;
  userInfo.userName = user.userName;
  userInfo.comments = user.comments;
  userInfo.venue = user.venue;
  changeComponent("targetInfo");
};

const nextTarget = () => {
  if (userInfo.venue.pos < userInfo.venue.targets.length - 1) {
    userInfo.venue.targets[userInfo.venue.pos].status = 2;
    userInfo.venue.pos++;
    userInfo.venue.targets[userInfo.venue.pos].status = 1;
    changeComponent("targetInfo");
  } else {
    alert("おめでとう");
    userInfo.venue.targets[userInfo.venue.pos].status = 2;
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

  const position: any = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const userGps = usersGps.value.filter(
    (user: any) => user.userId === userInfo.userId
  );
  getCurrentPos(userGps, position);

  navigator.geolocation.watchPosition(
    (position) => {
      const userGps = usersGps.value.filter(
        (user: any) => user.userId === userInfo.userId
      );
      getCurrentPos(userGps, position);
      $socket.emit("userGps", userGps);
    },
    (e: any) => {
      setSnackbar(true, 2000, "warning", e);
      return;
    }
  );
};

const getCurrentPos = (userGps: any, position: any) => {
  console.log("getCurrentPos");
  if (userGps.length === 0) {
    usersGps.value = [
      ...usersGps.value,
      {
        userId: userInfo.userId,
        userName: userInfo.userName,
        gps: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        self: true,
        marker: null,
      },
    ];
  } else if (userGps.length === 1) {
    usersGps.value = usersGps.value.map((user) =>
      user.userId === userInfo.userId
        ? {
            userId: user.userId,
            userName: user.userName,
            gps: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
            self: user.self,
            marker: user.marker,
          }
        : user
    );
  } else {
    setSnackbar(true, 2000, "warning", "userGps has many");
    return;
  }
};

onMounted(() => {
  $socket.on("userGps", (userGps: any) => {
    if (usersGps.value.some((user: any) => user.userId === userGps.userId)) {
      usersGps.value = usersGps.value.map((user) =>
        user.userId === userGps.userId
          ? {
              userId: user.userId,
              userName: user.userName,
              gps: {
                lat: userGps.latitude,
                lng: userGps.longitude,
                accuracy: userGps.accuracy,
              },
              self: false,
              marker: user.marker,
            }
          : user
      );
    } else {
      usersGps.value = [
        ...usersGps.value,
        {
          userId: userGps.userId,
          userName: userGps.userName,
          gps: {
            lat: userGps.latitude,
            lng: userGps.longitude,
            accuracy: userGps.accuracy,
          },
          self: false,
          marker: null,
        },
      ];
    }
  });
});

onBeforeUnmount(() => {
  if ($socket) {
    console.log("disconnest");
    $socket.close();
  }
});

// debug ------------------------
var aaa = setInterval(() => {
  if (usersGps.value.length < 1) return;
  const position = {
    coords: {
      latitude: 36.25 + Math.random() / 100,
      longitude: 138.25 + Math.random() / 100,
      accuracy: 1,
    },
  };

  const userGps = usersGps.value.filter(
    (user: any) => user.userId === userInfo.userId
  );
  getCurrentPos(userGps, position);
}, 2000);
// debug ------------------------
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
