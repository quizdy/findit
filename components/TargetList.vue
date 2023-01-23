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
        <v-list-item v-if="venue.targets.length === 0">No Target</v-list-item>
        <v-list-item
          v-for="(target, i) in venue.targets"
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
              @click.stop="delTarget(target)"
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
  (e: "setTarget", target: any): void;
  (e: "changeComponent", componentName: string): void;
}>();

const propsTargetList = defineProps<{
  venue: any;
}>();

const venue = reactive({
  venueName: propsTargetList.venue.venueName,
  comments: propsTargetList.venue.comments,
  pos: propsTargetList.venue.pos,
  targets: [],
});

const { data: resGetVenue } = await useFetch("/api/GetVenue", {
  method: "GET",
  params: { venueName: venue.venueName },
});

venue.venueName = (resGetVenue.value as any).venue.venueName;
venue.comments = (resGetVenue.value as any).venue.comments;
venue.pos = (resGetVenue.value as any).venue.pos;
venue.targets = (resGetVenue.value as any).venue.targets;

const venueList = () => {
  emitsTargetList("changeComponent", "venueList");
};

const selectedTarget = (target: any) => {
  emitsTargetList("setTarget", target);
  emitsTargetList("changeComponent", "targetEdit");
};

const addTarget = () => {
  const target = {
    no:
      venue.targets.length === 0
        ? 1
        : venue.targets[venue.targets.length - 1].no + 1,
    title: "test" + Date.now(),
    lat: 0.0,
    lng: 0.0,
    gap: 80,
    image: "",
    comments:
      "comments" +
      Date.now() +
      "comments" +
      Date.now() +
      "comments" +
      Date.now(),
    status: 0,
  };
  emitsTargetList("setTarget", target);
  emitsTargetList("changeComponent", "targetEdit");
};

const delTarget = async (target: any) => {
  const { data: resDeleteTarget } = await useFetch("/api/DeleteTarget", {
    method: "POST",
    body: { venueName: venue.venueName, targetNo: target.no },
  });

  if ((resDeleteTarget.value as any).msg === "") {
    venue.targets = venue.targets.filter(
      (target_: any) => target_.no !== target.no
    );
  }
};
</script>

<style scoped lang="scss"></style>
