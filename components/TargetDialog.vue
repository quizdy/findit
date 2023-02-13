<template>
  <v-card width="100%" max-width="800" class="mx-auto">
    <v-card-title>ターゲット</v-card-title>
    <v-card-text class="mx-0 mt-0">
      <draggable v-model="targets" handle=".handle" itemKey="id" @end="onEnd">
        <template #item="{ element: target }">
          <v-list-item
            class="mb-2 pa-2 handle"
            :value="target"
            :title="target.title"
            :prepend-avatar="target.image"
            border
            rounded
            elevation-2
          >
            <template v-slot:append>
              <v-btn
                color="grey-lighten-1"
                icon="mdi-rotate-left"
                variant="text"
                @click.stop="clearStatus(target.no)"
              ></v-btn>
            </template>
          </v-list-item>
        </template>
      </draggable>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const emitsTargetDialog = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    msg: string
  ): void;
  (e: "setSortTargets", targets: any[]): void;
  (e: "closeTargetDialog"): void;
}>();

const propsTargetDialog = defineProps<{
  user: any;
}>();

const targets = ref(propsTargetDialog.user.venue.targets);

const onEnd = () => {
  emitsTargetDialog("setSortTargets", targets.value);
};

const clearStatus = async (targetNo: number) => {
  await useFetch("/api/UpdateStatus", {
    method: "POST",
    body: {
      userId: propsTargetDialog.user.userId,
      no: targetNo,
      targetStatus: 0,
    },
  });
  emitsTargetDialog(
    "setSnackbar",
    true,
    2000,
    "info",
    "bottom",
    "状態を初期化しました"
  );
};
</script>

<style scoped lang="scss"></style>