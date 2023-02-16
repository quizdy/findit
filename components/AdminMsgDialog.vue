<template>
  <v-card width="100%" max-width="800" class="mx-auto">
    <v-card-title> メッセージ送信 </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-textarea
              solo
              v-model="adminMsg"
              label="メッセージ"
              variant="solo"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select
              label="参加者"
              :items="attendee"
              item-title="userName"
              item-value="userId"
              v-model="selectedUsers"
              variant="solo"
              multiple
            ></v-select>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-btn
        color="blue-darken-1"
        variant="text"
        @click="
          closeAdminMsgDialog();
          sendAdminMsg();
        "
      >
        メッセージ送信
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="blue-darken-1" variant="text" @click="closeAdminMsgDialog">
        キャンセル
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const emitsAdminMsgDialog = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    adminMsg: string
  ): void;
  (e: "closeAdminMsgDialog"): void;
}>();

const propsAdminMsgDialog = defineProps<{
  venue: any;
}>();

const selectedUsers = ref(<any[]>[]);
const adminMsg = ref("");
const attendee = ref();

const { data: resGetUsers } = await useFetch("/api/GetUsers", {
  method: "GET",
  params: {
    venueName: propsAdminMsgDialog.venue.venueName,
  },
});

attendee.value = resGetUsers.value?.users;

const sendAdminMsg = async () => {
  if (!adminMsg.value) {
    emitsAdminMsgDialog(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "メッセージを入力して下さい"
    );
    return;
  }

  if (Object.values(selectedUsers.value).length < 1) {
    emitsAdminMsgDialog(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "参加者を指定してください"
    );
    return;
  }

  await useFetch("/api/SendMsg", {
    method: "POST",
    body: {
      venueName: propsAdminMsgDialog.venue.venueName,
      sender: "admin",
      users: Object.values(selectedUsers.value),
      msg: adminMsg.value,
    },
  });

  emitsAdminMsgDialog(
    "setSnackbar",
    true,
    2000,
    "info",
    "bottom",
    "メッセージを送信しました"
  );

  adminMsg.value = "";
};

const closeAdminMsgDialog = () => {
  emitsAdminMsgDialog("closeAdminMsgDialog");
};
</script>

<style scoped lang="scss"></style>