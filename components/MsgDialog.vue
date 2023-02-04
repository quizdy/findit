<template>
  <v-card width="100%" max-width="800" class="mx-auto">
    <v-card-title> メッセージ送信 </v-card-title>
    <v-card-text class="d-flex flex-wrap align-center justify-center">
      <v-btn class="ma-2" @click="sendMsg('Yes')"
        ><v-icon>mdi-thumb-up</v-icon> <span>はい</span></v-btn
      >
      <v-btn class="ma-2" @click="sendMsg('No')"
        ><v-icon>mdi-thumb-down</v-icon> <span>いいえ</span></v-btn
      >
      <v-btn class="ma-2 px-1" @click="sendMsg('Spade')"
        ><v-icon>mdi-cards-spade</v-icon></v-btn
      >
      <v-btn class="ma-2 px-1" @click="sendMsg('Heart')"
        ><v-icon>mdi-cards-heart</v-icon></v-btn
      >
      <v-btn class="ma-2 px-1" @click="sendMsg('Diamond')"
        ><v-icon>mdi-cards-diamond</v-icon></v-btn
      >
      <v-btn class="ma-2 px-1" @click="sendMsg('Club')"
        ><v-icon>mdi-cards-club</v-icon></v-btn
      >
      <v-btn class="ma-2" @click="sendMsg('Hint')"
        ><v-icon>mdi-chat-question</v-icon> <span>ヒント下さい</span></v-btn
      >
      <v-btn class="ma-2" @click="sendMsg('Help')"
        ><v-icon>mdi-alert-circle</v-icon> <span>助けて</span></v-btn
      >
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const emitsMsgDialog = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    adminMsg: string
  ): void;
  (e: "closeMsgDialog"): void;
}>();

const propsMsgDialog = defineProps<{
  venue: any;
}>();

const sendMsg = async (msg: string) => {
  await useFetch("/api/SendMsg", {
    method: "POST",
    body: {
      venueName: propsMsgDialog.venue.venueName,
      users: ["admin"],
      msg: msg,
    },
  });
  emitsMsgDialog("setSnackbar", true, 2000, "info", "メッセージを送信しました");
  emitsMsgDialog("closeMsgDialog");
};
</script>

<style scoped lang="scss"></style>