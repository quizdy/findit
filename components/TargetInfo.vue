<template>
  <div style="max-width: 600px; margin: 0 auto">
    <v-toolbar class="mx-0 mt-0 py-4" height="10" color="light-blue" dark>
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
        <div class="layout">
          <transition name="fade">
            <v-icon
              v-show="target.targetStatus === 2"
              size="10rem"
              color="success"
              class="check"
              >mdi-check-circle</v-icon
            >
          </transition>
          <v-img
            :class="[
              i > 0 && target.targetStatus === 0 ? 'passive' : '',
              target.targetStatus === 2 ? 'clear' : '',
            ]"
            :src="target.image"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="grey lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </div>
        <div class="frame">
          <h3 class="my-3">{{ target.title }}</h3>
          <div class="comment">
            {{ target.comments }}
          </div>
        </div>
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
    location: string,
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
  height: calc(100dvh - 100px);
  width: 100%;
  background-color: #eee;
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

.frame {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 160px;
  margin: 0 1rem;
}

.frame .comment {
  font-size: 0.9rem;
  height: 100px;
  width: 100%;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
