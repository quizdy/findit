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
      <SwiperSlide v-for="(target, i) in targets" :key="i">
        <v-card max-width="600" class="mx-auto mt-2">
          <v-sheet class="d-flex flex-column">
            <v-container mt-0 pt-0>
              <v-row no-gutters>
                <v-col cols="12">
                  <div class="layout">
                    <v-icon
                      v-show="target.status === 2"
                      size="10rem"
                      color="success"
                      style="position: absolute; top: 25vh; left: 25vw"
                      >mdi-check-circle</v-icon
                    >
                    <v-img
                      :class="[
                        i > 0 && target.status === 0 ? 'passive' : '',
                        target.status === 2 ? 'clear' : '',
                      ]"
                      :src="target.image"
                      :style="{
                        height: imageHeight,
                        width: imageWidth,
                      }"
                    ></v-img>
                  </div>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12" width="400">
                  <h3>{{ target.title }}</h3>
                  <small>{{ target.comments }}</small>
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </v-card>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
const propsTargetInfo = defineProps<{
  venue: any;
}>();

const imageHeight = 800;
const imageWidth = 600;

const targets = ref(propsTargetInfo.venue.targets);
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
</style>
