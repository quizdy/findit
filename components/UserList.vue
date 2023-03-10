<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <p class="ml-4">ユーザ</p>
        <v-spacer></v-spacer>
        <v-btn class="ml-1" @click="venueList"
          ><v-icon>mdi-format-list-bulleted</v-icon></v-btn
        >
        <v-btn class="ml-1" @click="addUser"
          ><v-icon>mdi-plus-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-list class="pa-0" style="height: calc(100dvh - 64px)">
        <v-list-item
          v-for="(user, i) in users"
          class="py-3"
          :style="i < users.length - 1 ? 'border-bottom: 1px solid #eee;' : ''"
          :key="i"
          :value="user"
          :title="user.userName"
          :subtitle="user.venue.venueName"
          :prepend-avatar="user.image"
          @click="selectedUser(user)"
        >
          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-delete"
              variant="text"
              @click.stop="confirmDeleteUser(user)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const emitsUserList = defineEmits<{
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
    func: typeof deleteUser,
    params: any
  ): void;
  (e: "changeComponent", componentName: string): void;
  (e: "setUserInfo", userInfo: any): void;
}>();

const users = ref();

const { data: resGetUsers } = await useFetch("/api/GetUsers", {
  method: "GET",
  params: {
    venueName: "",
  },
});

users.value = resGetUsers.value?.users;

const venueList = () => {
  emitsUserList("changeComponent", "venueList");
};

const selectedUser = (user: any) => {
  emitsUserList("setUserInfo", user);
  emitsUserList("changeComponent", "userEdit");
};

const confirmDeleteUser = (user: any) => {
  emitsUserList(
    "showConfirmDialog",
    true,
    "削除",
    "削除します。よろしいですか？",
    deleteUser,
    user
  );
};

const addUser = () => {
  const user = {
    userId: users.value.length === 0 ? "1" : "" + (users.value.length + 1),
    userName: "userName" + Date.now(),
    image: "",
    comments: "",
    venue: {
      venueName: "",
      comments: "",
      pos: 0,
      targets: [],
    },
  };
  emitsUserList("setUserInfo", user);
  emitsUserList("changeComponent", "userEdit");
};

const deleteUser = async (user: any) => {
  const { data: resDeleteUser } = await useFetch("/api/DeleteUser", {
    method: "POST",
    body: { userId: user.userId },
  });

  if ((resDeleteUser.value as any).msg === "") {
    users.value = users.value.filter(
      (_user: any) => _user.userId !== user.userId
    );
  }
};
</script>

<style scoped lang="scss"></style>
