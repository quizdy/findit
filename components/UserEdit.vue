<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-spacer></v-spacer>
        <v-btn @click="cancelUser"
          ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-form>
        <v-container mt-0 pt-0>
          <v-row no-gutters>
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-avatar class="mb-4" size="100">
                <v-img :src="userInfo.image" @click="chgAvatar"></v-img>
              </v-avatar>
            </v-col>
            <v-col cols="8">
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    v-model="userInfo.userId"
                    readonly
                    label="ユーザＩＤ"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    v-model="userInfo.userName"
                    label="ユーザ名"
                    required
                    @focus="$event.target.select()"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="10">
              <v-select
                v-model="selectedVenueName"
                label="会場"
                :items="venuesInfo"
                @update:modelValue="getVenue"
              ></v-select>
            </v-col>
            <v-col cols="2">
              <v-btn
                :disabled="!selectedVenueName"
                class="mx-3 mt-1"
                rounded
                icon
                @click="openTargetDialog"
                ><v-icon dense>mdi-list-box</v-icon></v-btn
              >
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <v-textarea
                solo
                v-model="userInfo.comments"
                label="コメント"
                @focus="$event.target.select()"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row no-gutters justify-space-between>
            <v-col cols="6">
              <v-btn @click="confirmUpdateUser">登録</v-btn>
            </v-col>
            <v-col cols="6" style="text-align: right">
              <v-btn @click="cancelUser">キャンセル</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </div>
  <client-only>
    <v-dialog v-model="targetSortDialog">
      <TargetDialog
        :user="userInfo"
        @setSnackbar="setSnackbar"
        @setSortTargets="setSortTargets"
        @closeTargetDialog="targetSortDialog = false"
      />
    </v-dialog>
  </client-only>
</template>

<script setup lang="ts">
const emitsUserEdit = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    msg: string
  ): void;
  (
    e: "showConfirmDialog",
    show: boolean,
    title: string,
    msg: string,
    func: typeof updateUser,
    params: any
  ): void;
  (e: "changeComponent", componentName: string): void;
}>();

const propsUserList = defineProps<{
  user: any;
}>();

const userInfo = reactive({
  userId: propsUserList.user.userId,
  userName: propsUserList.user.userName,
  image: propsUserList.user.image,
  comments: propsUserList.user.comments,
  venue: propsUserList.user.venue,
});

const venuesInfo = ref(<any[]>[]);
const selectedVenueName = ref(propsUserList.user.venue.venueName);
const targetSortDialog = ref(false);

const { data: resGetVenues } = await useFetch("/api/GetVenues", {
  method: "GET",
});

resGetVenues.value?.venues.forEach((venue: any) => {
  venuesInfo.value.push(venue.venueName);
});

const setSnackbar = (
  show: boolean,
  timeout: number,
  color: string,
  location: string,
  msg: string
) => {
  emitsUserEdit("setSnackbar", show, timeout, color, location, msg);
};

const getVenue = async () => {
  const { data: resGetVenue } = await useFetch("/api/GetVenue", {
    method: "GET",
    params: { venueName: selectedVenueName.value },
  });

  userInfo.venue = (resGetVenue.value as any).venue;

  if (userInfo.venue.targets.length < 1) {
    emitsUserEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "指定した会場にはターゲットの登録がありません"
    );
    selectedVenueName.value = "";
    userInfo.venue.venueName = "";
    return;
  }
};

const confirmUpdateUser = () => {
  if (!userInfo.userName) {
    emitsUserEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "ユーザ名を入力して下さい"
    );
    return;
  }

  if (!userInfo.venue.venueName) {
    emitsUserEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "会場を指定してください"
    );
    return;
  }

  emitsUserEdit(
    "showConfirmDialog",
    true,
    "登録",
    "登録します。よろしいですか？",
    updateUser,
    ""
  );
};

const updateUser = async (params: any) => {
  const { data: resUpdateUser } = await useFetch("/api/UpdateUser", {
    method: "POST",
    body: {
      userId: userInfo.userId,
      userName: userInfo.userName,
      image: userInfo.image,
      comments: userInfo.comments,
      venue: userInfo.venue,
    },
  });

  if ((resUpdateUser.value as any).msg === "") {
    emitsUserEdit("changeComponent", "userList");
  }
};

const cancelUser = () => {
  emitsUserEdit("changeComponent", "userList");
};

const openTargetDialog = () => {
  targetSortDialog.value = true;
};

const setSortTargets = (targets: any[]) => {
  userInfo.venue.targets = targets;
};

const chgAvatar = async () => {
  const url =
    "https://api.multiavatar.com/" +
    Math.random().toString(32).substring(2) +
    ".png";

  // userInfo.image = await toDataURL(url);
  userInfo.image = url;
};

const toDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

if (!userInfo.image) chgAvatar();
</script>

<style scoped lang="scss"></style>
