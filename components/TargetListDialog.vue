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
                v-if="target.targetStatus === 2"
                color="green-lighten-1"
                icon="mdi-check-bold"
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
const emitsTargetListDialog = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    msg: string
  ): void;
  (e: "setSortTargets", targets: any[]): void;
  (e: "closeTargetListDialog"): void;
}>();

const propsTargetListDialog = defineProps<{
  user: any;
}>();

const targets = ref(
  propsTargetListDialog.user.venue.targets.filter(
    (_target: any) => _target.type === ""
  )
);

const onEnd = () => {
  const mission = propsTargetListDialog.user.venue.targets.filter(
    (_target: any) => _target.type !== ""
  );

  const sortTargets = targets.value.concat(mission);

  emitsTargetListDialog("setSortTargets", sortTargets);
};

const clearStatus = async (targetNo: number) => {
  await useFetch("/api/UpdateStatus", {
    method: "POST",
    body: {
      userId: propsTargetListDialog.user.userId,
      no: targetNo,
      targetStatus: 0,
    },
  });
  emitsTargetListDialog(
    "setSnackbar",
    true,
    2000,
    "info",
    "bottom",
    "状態を初期化しました"
  );

  const pos = targets.value.findIndex(
    (_target: any) => _target.no === targetNo
  );

  targets.value[pos].targetStatus = 0;
};
</script>

<style scoped lang="scss"></style>