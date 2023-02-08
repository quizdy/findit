<template>
  <div>
    <Swiper
      :slides-per-view="1"
      :loop="false"
      :effect="'creative'"
      :creative-effect="{
        prev: {
          shadow: false,
          translate: ['-20%', 0, -1],
        },
        next: {
          translate: ['100%', 0, 0],
        },
      }"
    >
      <SwiperSlide v-for="(mission, i) in missions" :key="i">
        <v-card max-width="480" class="mx-auto rounded-0">
          <v-sheet class="d-flex flex-column">
            <div class="layout" @click="sendMission(mission)">
              <v-img
                :src="mission.image"
                :style="{
                  height: imageHeight,
                  width: imageWidth,
                }"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </div>
          </v-sheet>
        </v-card>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
const emitsMissionDialog = defineEmits<{
  (e: "closeMissionDialog"): void;
}>();

const propsMissionDialog = defineProps<{
  venue: any;
}>();

const imageHeight = 640;
const imageWidth = 480;

const attendee = ref(<any[]>[]);

const { data: resGetUsers } = await useFetch("/api/GetUsers", {
  method: "GET",
  params: {
    venueName: propsMissionDialog.venue.venueName,
  },
});

resGetUsers.value?.users.forEach((_user) => {
  attendee.value.push(_user.userId);
});

const missions = ref(
  propsMissionDialog.venue.targets.filter((_target: any) => _target.mission)
);

const sendMission = async (mission: any) => {
  await useFetch("/api/SendMsg", {
    method: "POST",
    body: {
      venueName: propsMissionDialog.venue.venueName,
      sender: "admin",
      users: attendee.value,
      msg: "mission",
      mission: mission,
    },
  });

  alert("ミッション発動");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  emitsMissionDialog("closeMissionDialog");
};
</script>

<style scoped lang="scss">
.layout {
  position: relative;
  height: 100%;
  width: 100%;
}
</style>