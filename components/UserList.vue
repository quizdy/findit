<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-btn @click="venueList"
          ><v-icon>mdi-format-list-bulleted</v-icon></v-btn
        >
        <v-spacer></v-spacer>
        <v-btn @click="addUser"><v-icon>mdi-plus-circle</v-icon></v-btn>
      </v-toolbar>
      <v-list>
        <v-list-item v-if="users.length === 0">No User</v-list-item>
        <v-list-item v-for="(user, i) in users" :key="i" :value="user">
          <v-list-item-title @click="selectedUser(user)">{{
            user.userName
          }}</v-list-item-title>
          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-delete"
              variant="text"
              @click.stop="confirmUser(user)"
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
}>();

const users = ref();

const { data: resGetUsers } = await useFetch("/api/GetUsers", {
  method: "GET",
});

users.value = resGetUsers.value?.users;

const venueList = () => {
  emitsUserList("changeComponent", "venueList");
};

const selectedUser = (user: any) => {
  emitsUserList("setUserInfo", user);
  emitsUserList("changeComponent", "userEdit");
};

const confirmUser = (user: any) => {
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
    userId:
      users.value.length === 0 ? "user1" : "user" + (users.value.length + 1),
    userName: "userName" + Date.now(),
    comments: "comments" + Date.now(),
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
  console.log(user);
  const { data: resDeleteUser } = await useFetch("/api/DeleteUser", {
    method: "POST",
    body: { userId: user.userId },
  });

  if ((resDeleteUser.value as any).msg === "") {
    users.value = users.value.filter(
      (user_: any) => user_.userId !== user.userId
    );
  }
};
</script>

<style scoped lang="scss"></style>
