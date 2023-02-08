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
        :user="userInfo"
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
        :venue="venueInfo"
        @setSnackbar="setSnackbar"
        @changeComponent="changeComponent"
      />
      <VenueEdit
        v-if="currentComponent === 'venueEdit'"
        :venue="venueInfo"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @changeComponent="changeComponent"
      />
      <TargetList
        v-if="currentComponent === 'targetList'"
        :venue="venueInfo"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setVenueInfo="setVenueInfo"
        @setTargetInfo="setTargetInfo"
        @changeComponent="changeComponent"
      />
      <TargetEdit
        v-if="currentComponent === 'targetEdit'"
        :venue="venueInfo"
        :target="targetInfo"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setVenueInfo="setVenueInfo"
        @changeComponent="changeComponent"
        ref="refTargetEdit"
      />
    </v-main>
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
  image: "",
  comments: "",
  venue: {},
});
const venueInfo = reactive({
  venueName: "",
  lat: 0.0,
  lng: 0.0,
  comments: "",
  image: "",
  pos: 0,
  targets: [],
});
const targetInfo = reactive({
  no: 0,
  title: "",
  lat: 0.0,
  lng: 0.0,
  gap: 0,
  icon: "",
  image: "",
  mission: false,
  comments: "",
  targetStatus: 0,
});
const snackbar = reactive({
  show: false,
  timeout: 2000,
  color: "",
  location: "bottom",
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
  location: string,
  msg: string
) => {
  snackbar.show = show;
  snackbar.timeout = timeout;
  snackbar.color = color;
  snackbar.location = location;
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
  userInfo.image = user.image;
  userInfo.comments = user.comments;
  userInfo.venue = user.venue;
};

const setVenueInfo = async (venue: any) => {
  venueInfo.venueName = venue.venueName;
  venueInfo.lat = venue.lat;
  venueInfo.lng = venue.lng;
  venueInfo.comments = venue.comments;
  venueInfo.image = venue.image;
  venueInfo.pos = venue.pos;

  const { data: resGetVenue } = await useFetch("/api/GetVenue", {
    method: "GET",
    params: { venueName: venue.venueName },
  });

  venueInfo.targets = (resGetVenue.value as any).venue.targets;
};

const setTargetInfo = (target: any) => {
  targetInfo.no = target.no;
  targetInfo.title = target.title;
  targetInfo.lat = target.lat;
  targetInfo.lng = target.lng;
  targetInfo.gap = target.gap;
  targetInfo.icon = target.icon;
  targetInfo.image = target.image;
  targetInfo.mission = target.mission;
  targetInfo.comments = target.comments;
  targetInfo.targetStatus = target.targetStatus;
};
</script>

<style scoped lang="scss"></style>
