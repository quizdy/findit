<template>
  <v-app>
    <v-main>
      <TargetInfo
        v-if="currentComponent === 'targetInfo'"
        :venue="user.venue"
      />
      <TargetMap v-if="currentComponent === 'targetMap'" :venue="user.venue" />
      <TargetScan
        v-if="currentComponent === 'targetScan'"
        :venue="user.venue"
        @nextTarget="nextTarget"
      />
      <Login
        v-if="currentComponent === 'login'"
        @setSnackbar="setSnackbar"
        @setUser="setUser"
        @changeComponent="changeComponent"
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
const user = reactive({
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
const other = ref([]);

const changeComponent = (componentName: string) => {
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

const setUser = async (paramUser: any) => {
  user.userId = paramUser.userId;
  user.userName = paramUser.userName;
  user.comments = paramUser.comments;
  user.venue = paramUser.venue;
};

const nextTarget = () => {
  if (user.venue.pos < user.venue.targets.length - 1) {
    user.venue.targets[user.venue.pos].status = 2;
    user.venue.pos++;
    user.venue.targets[user.venue.pos].status = 1;
    changeComponent("targetInfo");
  } else {
    alert("おめでとう");
    user.venue.targets[user.venue.pos].status = 2;
    user.venue.pos = 0;
    changeComponent("targetInfo");
  }
};

const openAdmin = () => {
  window.open("/admin", "_blank");
};

onMounted(async () => {
  if (
    !navigator.geolocation ||
    !navigator.geolocation.getCurrentPosition ||
    !navigator.geolocation.watchPosition
  )
    return;

  const position: any = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const gps = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };

  $socket.emit("gps", gps);

  $socket.on("gps", (recieve: any) => {
    console.info(recieve);
    other.push(recieve);
  });
});

onBeforeUnmount(() => {
  if ($socket) {
    console.log("disconnest");
    $socket.close();
  }
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
