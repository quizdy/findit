<template>
  <v-card
    height="100%"
    width="100%"
    min-height="50dvh"
    max-width="800"
    class="mx-auto"
  >
    <v-img class="align-end text-white" height="200" :src="mission.image" cover>
    </v-img>
    <v-card-title>{{ mission.title }}</v-card-title>

    <v-card-text>{{ mission.comments }}</v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue" @click="closeMissionDialog">閉じる</v-btn>
    </v-card-actions>
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
  mission: any;
}>();

const closeMissionDialog = () => {
  emitsMissionDialog("closeMissionDialog");
};
</script>

<style scoped lang="scss"></style>