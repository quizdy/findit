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
      <SwiperSlide
        v-for="(target, i) in targets"
        :key="i"
        v-show="target.type === '' || target.targetStatus === 1"
      >
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
          <transition name="fade">
            <v-icon
              v-show="target.targetStatus === 2"
              size="10rem"
              color="white"
              class="circle"
              >mdi-circle</v-icon
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
          <h3 class="pa-2">{{ target.title }}</h3>
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

.layout::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(180deg, #000 0 70%, #fff 90%);
}

.layout .passive {
  filter: blur(20px);
}

.layout .clear {
  filter: sepia(60%);
  filter: opacity(50%);
}

.layout .check,
.layout .circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  opacity: 0.7;
}

.layout .circle {
  z-index: 2;
}

.layout .check {
  z-index: 3;
}

.frame {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 180px;
  width: calc(100% - 2.5rem);
  background: rgba(255, 255, 255, 0.6);
  margin: 0 0.75rem 0.5rem 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.5);
}

.frame .comment {
  font-size: 0.9rem;
  height: 130px;
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
