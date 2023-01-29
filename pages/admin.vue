<template>
  <v-app>
    <v-main>
      <UserList
        v-if="currentComponent === 'userList'"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setUserInfo="setUserInfo"
        @changeComponent="changeComponent"
      />
      <UserEdit
        v-if="currentComponent === 'userEdit'"
        :userInfo="userInfo"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @changeComponent="changeComponent"
      />
      <VenueList
        v-if="currentComponent === 'venueList'"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setVenueInfo="setVenueInfo"
        @changeComponent="changeComponent"
      />
      <AdminMap
        v-if="currentComponent === 'adminMap'"
        :venueInfo="venueInfo"
        @setSnackbar="setSnackbar"
        @changeComponent="changeComponent"
      />
      <VenueEdit
        v-if="currentComponent === 'venueEdit'"
        :venueInfo="venueInfo"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @changeComponent="changeComponent"
      />
      <TargetList
        v-if="currentComponent === 'targetList'"
        :venueInfo="venueInfo"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setTargetInfo="setTargetInfo"
        @changeComponent="changeComponent"
      />
      <TargetEdit
        v-if="currentComponent === 'targetEdit'"
        :venueName="venueInfo.venueName"
        :targetInfo="targetInfo"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @changeComponent="changeComponent"
        ref="refTargetEdit"
      />
    </v-main>
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
  </v-app>
</template>

<script setup lang="ts">
const currentComponent = ref("venueList");
const userInfo = reactive({
  userId: "",
  userName: "",
  comments: "",
  venue: {},
});
const venueInfo = reactive({
  venueName: "",
  comments: "",
  pos: 0,
  targets: [],
});
const targetInfo = reactive({
  no: 0,
  title: "",
  lat: 0.0,
  lng: 0.0,
  gap: 0,
  image: "",
  comments: "",
  targetStatus: 0,
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

const refTargetEdit = ref();

const changeComponent = (componentName: string) => {
  if (
    currentComponent.value !== "targetScan" &&
    typeof refTargetEdit.value !== "undefined" &&
    refTargetEdit.value !== null
  ) {
    refTargetEdit.value.stopVideo();
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

const setUserInfo = (user: any) => {
  userInfo.userId = user.userId;
  userInfo.userName = user.userName;
  userInfo.comments = user.comments;
  userInfo.venue = user.venue;
};

const setVenueInfo = (venue: any) => {
  venueInfo.venueName = venue.venueName;
  venueInfo.comments = venue.comments;
  venueInfo.pos = venue.pos;
};

const setTargetInfo = (target: any) => {
  targetInfo.no = target.no;
  targetInfo.title = target.title;
  targetInfo.lat = target.lat;
  targetInfo.lng = target.lng;
  targetInfo.gap = target.gap;
  targetInfo.image = target.image;
  targetInfo.comments = target.comments;
  targetInfo.targetStatus = target.targetStatus;
};
</script>

<style scoped lang="scss"></style>
