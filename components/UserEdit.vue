<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-spacer></v-spacer>
        <v-btn @click="cancelUser()"
          ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-form>
        <v-container mt-0 pt-0>
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="user.userId"
                readonly
                label="ユーザＩＤ"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="user.userName"
                label="ユーザ名"
                required
                @focus="$event.target.select()"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <v-select
                v-model="selectedVenue"
                label="会場"
                :items="venues"
                @update:modelValue="getVenue"
              ></v-select>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <v-textarea
                solo
                v-model="user.comments"
                label="コメント"
                @focus="$event.target.select()"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row no-gutters justify-space-between>
            <v-col cols="6">
              <v-btn @click="updateUser">登録</v-btn>
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
  (e: "changeComponent", componentName: string): void;
}>();

const propsUserList = defineProps<{
  user: any;
}>();

const user = reactive({
  userId: propsUserList.user.userId,
  userName: propsUserList.user.userName,
  comments: propsUserList.user.comments,
  venue: propsUserList.user.venue,
});

const venues = ref([]);
const selectedVenue = ref("");

const { data: resGetVenues } = await useFetch("/api/GetVenues", {
  method: "GET",
});

resGetVenues.value?.venues.forEach((venue: any) => {
  venues.value.push(venue.venueName);
});

const getVenue = async () => {
  const { data: resGetVenue } = await useFetch("/api/GetVenue", {
    method: "GET",
    params: { venueName: selectedVenue.value },
  });

  user.venue = (resGetVenue.value as any).venue;
};

const updateUser = async () => {
  if (!user.userName) {
    emitsUserEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "ユーザ名を入力して下さい"
    );
    return;
  }

  const { data: resUpdateUser } = await useFetch("/api/UpdateUser", {
    method: "POST",
    body: {
      userId: user.userId,
      userName: user.userName,
      comments: user.comments,
      venue: user.venue,
    },
  });

  if ((resUpdateUser.value as any).msg === "") {
    emitsUserEdit("changeComponent", "userList");
  }
};

const cancelUser = () => {
  emitsUserEdit("changeComponent", "userList");
};
</script>

<style scoped lang="scss"></style>
