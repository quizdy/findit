<template>
  <v-card width="100%" max-width="800" class="mx-auto">
    <v-card-title>ターゲットの順番</v-card-title>
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
          </v-list-item>
        </template>
      </draggable>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const emitsTargetSortDialog = defineEmits<{
  (e: "setSortTargets", targets: any[]): void;
  (e: "closeTargetSortDialog"): void;
}>();

const propsTargetSortDialog = defineProps<{
  venue: any;
}>();

const targets = ref(propsTargetSortDialog.venue.targets);

const onEnd = () => {
  emitsTargetSortDialog("setSortTargets", targets.value);
};
</script>

<style scoped lang="scss"></style>