<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <p class="ml-4">ターゲット</p>
        <v-spacer></v-spacer>
        <v-btn class="ml-1" @click="venueList"
          ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
        >
        <v-btn class="ml-1" @click="showAdminMap"
          ><v-icon>mdi-map</v-icon></v-btn
        >
        <v-btn class="ml-1" @click="addTarget"
          ><v-icon>mdi-plus-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-list class="pa-0" style="height: calc(100dvh - 64px)">
        <v-list-item
          v-for="(target, i) in targets"
          class="py-3"
          :style="
            i < targets.length - 1 ? 'border-bottom: 1px solid #eee;' : ''
          "
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
    location: string,
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
  (e: "setVenueInfo", venue: any): void;
  (e: "setTargetInfo", targetInfo: any): void;
}>();

const propsTargetList = defineProps<{
  venue: any;
}>();

const $config = useRuntimeConfig();
const { venueName, targets } = toRefs(propsTargetList.venue);

const venueList = () => {
  emitsTargetList("changeComponent", "venueList");
};

const showAdminMap = () => {
  emitsTargetList("setVenueInfo", propsTargetList.venue);
  emitsTargetList("changeComponent", "adminMap");
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
      targets.value.length === 0
        ? 1
        : targets.value[targets.value.length - 1].no + 1,
    title: "test" + Date.now(),
    lat: 0,
    lng: 0,
    gap: 60,
    type: "",
    icon: $config.ICONS[0].value,
    image: "",
    comments: "",
    targetStatus: 0,
  };
  emitsTargetList("setTargetInfo", targetInfo);
  emitsTargetList("changeComponent", "targetEdit");
};

const deleteTarget = async (target: any) => {
  const { data: resDeleteTarget } = await useFetch("/api/DeleteTarget", {
    method: "POST",
    body: { venueName: venueName.value, targetNo: target.no },
  });

  if ((resDeleteTarget.value as any).msg === "") {
    targets.value = targets.value.filter(
      (target_: any) => target_.no !== target.no
    );
  }
};
</script>

<style scoped lang="scss"></style>
