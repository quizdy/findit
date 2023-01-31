<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-btn @click="venueList()"
          ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
        >
        <v-spacer></v-spacer>
        <v-btn @click="addTarget()"><v-icon>mdi-plus-circle</v-icon></v-btn>
      </v-toolbar>
      <v-list>
        <v-list-item v-if="venueInfo.targets.length === 0"
          >No Target</v-list-item
        >
        <v-list-item
          v-for="(target, i) in venueInfo.targets"
          :key="i"
          :value="target"
          :title="target.title"
          :prepend-avatar="target.image"
          @click="selectedTarget(target)"
        >
          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-delete"
              variant="text"
              @click.stop="confirmDeleteTarget(target)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const emitsTargetList = defineEmits<{
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
    func: typeof deleteTarget,
    params: any
  ): void;
  (e: "changeComponent", componentName: string): void;
  (e: "setTargetInfo", targetInfo: any): void;
}>();

const propsTargetList = defineProps<{
  venue: any;
}>();

const venueInfo = reactive({
  venueName: propsTargetList.venue.venueName,
  targets: propsTargetList.venue.targets,
});

const venueList = () => {
  emitsTargetList("changeComponent", "venueList");
};

const selectedTarget = (target: any) => {
  emitsTargetList("setTargetInfo", target);
  emitsTargetList("changeComponent", "targetEdit");
};

const confirmDeleteTarget = (target: any) => {
  emitsTargetList(
    "showConfirmDialog",
    true,
    "削除",
    "削除します。よろしいですか？",
    deleteTarget,
    target
  );
};

const addTarget = () => {
  const targetInfo = {
    no:
      venueInfo.targets.length === 0
        ? 1
        : venueInfo.targets[venueInfo.targets.length - 1].no + 1,
    title: "test" + Date.now(),
    lat: 0,
    lng: 0,
    gap: 60,
    image: "",
    comments:
      "comments" +
      Date.now() +
      "comments" +
      Date.now() +
      "comments" +
      Date.now(),
    targetStatus: 0,
  };
  emitsTargetList("setTargetInfo", targetInfo);
  emitsTargetList("changeComponent", "targetEdit");
};

const deleteTarget = async (target: any) => {
  const { data: resDeleteTarget } = await useFetch("/api/DeleteTarget", {
    method: "POST",
    body: { venueName: venueInfo.venueName, targetNo: target.no },
  });

  if ((resDeleteTarget.value as any).msg === "") {
    venueInfo.targets = venueInfo.targets.filter(
      (target_: any) => target_.no !== target.no
    );
  }
};
</script>

<style scoped lang="scss"></style>
