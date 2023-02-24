<template>
  <v-card max-width="300" class="mx-auto">
    <v-card-title class="text-h5">
      {{ propsComfirmDialog.title }}
    </v-card-title>
    <v-card-text>
      {{ propsComfirmDialog.title }} します。よろしいですか？</v-card-text
    >
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="green-darken-1" variant="text" @click="ret(true)">
        はい
      </v-btn>
      <v-btn color="green-darken-1" variant="text" @click="ret(false)">
        いいえ
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const emitsComfirmDialog = defineEmits<{
  (e: "ret", ret: boolean): void;
}>();

const propsComfirmDialog = defineProps<{
  title: string;
}>();

const ret = (ret: boolean) => {
  emitsComfirmDialog("ret", ret);
};
</script>

<style scoped lang="scss"></style>