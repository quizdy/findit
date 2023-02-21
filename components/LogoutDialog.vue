<template>
  <v-card max-width="300" class="mx-auto">
    <v-card-title class="text-h5"> 終了 </v-card-title>
    <v-card-text>終了します。よろしいですか？</v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="green-darken-1"
        variant="text"
        @click="
          closeLogoutDialog();
          clearPos();
          reload();
        "
      >
        はい
      </v-btn>
      <v-btn
        color="green-darken-1"
        variant="text"
        @click="
          closeLogoutDialog();
          changeComponent('targetInfo');
        "
      >
        いいえ
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const emitsLogoutDialog = defineEmits<{
  (e: "closeLogoutDialog"): void;
  (e: "changeComponent", componentName: string): void;
  (e: "clearPos"): void;
}>();

const closeLogoutDialog = () => {
  emitsLogoutDialog("closeLogoutDialog");
};

const changeComponent = (componentName: string) => {
  emitsLogoutDialog("changeComponent", componentName);
};

const clearPos = () => {
  emitsLogoutDialog("clearPos");
};

const reload = () => {
  location.reload();
};
</script>

<style scoped lang="scss"></style>