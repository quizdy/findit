<template>
  <v-app>
    <v-main>
      <UserList
        v-if="currentComponent === 'userList'"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setUser="setUser"
        @changeComponent="changeComponent"
      />
      <UserEdit
        v-if="currentComponent === 'userEdit'"
        :user="user"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @changeComponent="changeComponent"
      />
      <VenueList
        v-if="currentComponent === 'venueList'"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setVenue="setVenue"
        @changeComponent="changeComponent"
      />
      <VenueEdit
        v-if="currentComponent === 'venueEdit'"
        :venue="venue"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @changeComponent="changeComponent"
      />
      <TargetList
        v-if="currentComponent === 'targetList'"
        :venue="venue"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @setTarget="setTarget"
        @changeComponent="changeComponent"
      />
      <TargetEdit
        v-if="currentComponent === 'targetEdit'"
        :venueName="venue.venueName"
        :target="target"
        @setSnackbar="setSnackbar"
        @showConfirmDialog="showConfirmDialog"
        @changeComponent="changeComponent"
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
const user = reactive({
  userId: "",
  userName: "",
  comments: "",
  venue: "",
});
const venue = reactive({
  venueName: "",
  comments: "",
  pos: 0,
  targets: [],
});
const target = reactive({
  no: 0,
  title: "",
  lat: 0.0,
  lng: 0.0,
  gap: 0,
  image: "",
  comments: "",
  statis: 0,
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

const setUser = (paramUser: any) => {
  user.userId = paramUser.userId;
  user.userName = paramUser.userName;
  user.comments = paramUser.comments;
  user.venue = paramUser.venue;
};

const setVenue = (paramVenue: any) => {
  venue.venueName = paramVenue.venueName;
  venue.comments = paramVenue.comments;
  venue.pos = paramVenue.pos;
};

const setTarget = (paramTarget: any) => {
  target.no = paramTarget.no;
  target.title = paramTarget.title;
  target.lat = paramTarget.lat;
  target.lng = paramTarget.lng;
  target.gap = paramTarget.gap;
  target.image = paramTarget.image;
  target.comments = paramTarget.comments;
  target.status = paramTarget.status;
};
</script>

<style scoped lang="scss"></style>
