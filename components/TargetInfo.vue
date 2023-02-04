<template>
  <div>
    <v-toolbar class="ma-0 py-4" height="10" color="light-blue" dark>
      <v-avatar class="mx-4" size="28">
        <v-img :src="propsTargetInfo.user.image"></v-img>
      </v-avatar>
      <small class="pt-1">{{ propsTargetInfo.user.userName }}</small>
      <v-spacer></v-spacer>
      <v-btn @click="openMsgDialog">
        <v-icon>mdi-email-fast-outline</v-icon>
      </v-btn>
    </v-toolbar>
    <Swiper
      :slides-per-view="1"
      :initial-slide="propsTargetInfo.user.venue.pos"
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
      <SwiperSlide v-for="(target, i) in targets" :key="i">
        <v-card max-width="600" class="mx-auto rounded-0">
          <v-sheet class="d-flex flex-column">
            <div class="layout">
              <v-icon
                v-show="target.targetStatus === 2"
                size="10rem"
                color="success"
                class="check"
                >mdi-check-circle</v-icon
              >
              <v-img
                :class="[
                  i > 0 && target.targetStatus === 0 ? 'passive' : '',
                  target.targetStatus === 2 ? 'clear' : '',
                ]"
                :src="target.image"
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
            <h3 class="mx-8 mt-4">{{ target.title }}</h3>
            <small class="mx-8 mt-2">{{ target.comments }}</small>
          </v-sheet>
        </v-card>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
const emitsTargetInfo = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    msg: string
  ): void;
  (e: "openMsgDialog"): void;
}>();

const propsTargetInfo = defineProps<{
  user: any;
}>();

const imageHeight = 800;
const imageWidth = 600;

const targets = ref(propsTargetInfo.user.venue.targets);

const openMsgDialog = () => {
  emitsTargetInfo("openMsgDialog");
};
</script>

<style scoped lang="scss">
.layout {
  position: relative;
  height: calc(100dvh - 14.2rem);
  width: 100%;
}

.layout .passive {
  filter: blur(20px);
}

.layout .clear {
  filter: sepia(60%);
  filter: opacity(50%);
}

.layout .check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
}
</style>
