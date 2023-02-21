<template>
  <v-card height="100%" width="100%" max-width="800" class="mx-auto">
    <v-img :src="mission.image">
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular
            indeterminate
            color="grey lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <h3 class="pa-2">{{ mission.title }}</h3>
    <div class="comment">
      {{ mission.comments }}
    </div>
    <v-btn class="ma-2 px-1" @click="sendAnswer('Spade')"
      ><v-icon>mdi-cards-spade</v-icon></v-btn
    >
  </v-card>
</template>

<script setup lang="ts">
const emitsMissionDialog = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    adminMsg: string
  ): void;
  (e: "closeMissionDialog"): void;
}>();

const propsMissionDialog = defineProps<{
  user: any;
  mission: any;
}>();

const sendAnswer = async (answer: string) => {
  await useFetch("/api/SendMsg", {
    method: "POST",
    body: {
      venueName: propsMissionDialog.user.venue.venueName,
      sender: propsMissionDialog.user.userName,
      users: ["admin"],
      msg: answer,
    },
  });

  emitsMissionDialog(
    "setSnackbar",
    true,
    2000,
    "info",
    "top",
    "メッセージを送信しました"
  );

  emitsMissionDialog("closeMissionDialog");
};
</script>

<style scoped lang="scss"></style>