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
      <v-btn currentComponent="logout" @click="changeComponent('login')">
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
    </client-only>
  </v-app>
</template>

<script setup lang="ts">
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
</script>

<style scoped lang="scss"></style>
