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
              <v-avatar size="120">
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
            <v-col cols="12">
              <v-select
                v-model="selectedVenue"
                label="会場"
                :items="venuesInfo"
                @update:modelValue="getVenue"
              ></v-select>
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
</template>

<script setup lang="ts">
const emitsUserEdit = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
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
  userInfo: any;
}>();

const userInfo = reactive({
  userId: propsUserList.userInfo.userId,
  userName: propsUserList.userInfo.userName,
  image: propsUserList.userInfo.image,
  comments: propsUserList.userInfo.comments,
  venue: propsUserList.userInfo.venue,
});

const venuesInfo = ref(<any[]>[]);
const selectedVenue = ref(propsUserList.userInfo.venue.venueName);

const { data: resGetVenues } = await useFetch("/api/GetVenues", {
  method: "GET",
});

resGetVenues.value?.venues.forEach((venue: any) => {
  venuesInfo.value.push(venue.venueName);
});

const getVenue = async () => {
  userInfo.venue.venueName = selectedVenue;
};

const confirmUpdateUser = () => {
  if (!userInfo.userName) {
    emitsUserEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "ユーザ名を入力して下さい"
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
      venue: {
        venueName: userInfo.venue.venueName,
      },
    },
  });

  if ((resUpdateUser.value as any).msg === "") {
    emitsUserEdit("changeComponent", "userList");
  }
};

const cancelUser = () => {
  emitsUserEdit("changeComponent", "userList");
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
