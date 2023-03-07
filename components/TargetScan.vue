<template>
  <div style="max-width: 600px; margin: 0 auto">
    <v-container
      v-show="targetType === '' || targetType === 'additional'"
      class="ma-0 pa-0"
    >
      <v-row no-gutters>
        <v-col cols="12">
          <div class="layout">
            <v-progress-circular
              v-show="loading"
              indeterminate
              color="light-blue"
              :size="70"
              :width="7"
              style="margin: 50% calc(50% - 2rem)"
            ></v-progress-circular>
            <video
              id="webcam"
              class="d-none"
              autoplay
              muted
              playsinline
              :height="imageHeight"
              :width="imageWidth"
            ></video>
            <canvas
              v-show="!loading"
              id="webcamCanvas"
              class="webcamCanvas"
              :height="imageHeight"
              :width="imageWidth"
            ></canvas>
            <img
              class="targetImage"
              :src="
                propsTargetScan.venue.targets[propsTargetScan.venue.pos].image
              "
              :style="{
                opacity: scan.opacity / 100,
                height: imageHeight,
                width: imageWidth,
              }"
            />
          </div>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12">
          <v-slider
            class="mx-4"
            max="100"
            min="0"
            color="blue"
            dense
            hide-details="false"
            v-model="scan.opacity"
          ></v-slider>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" style="text-align: center">
          <v-btn class="mx-4" min-width="300" @click="scanImage"
            ><v-icon>mdi-line-scan</v-icon>スキャン</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
    <v-container v-show="targetType === 'passcode'" class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col>
          <div class="layout d-flex align-center justify-center">
            <img
              class="targetImage"
              :src="
                propsTargetScan.venue.targets[propsTargetScan.venue.pos].image
              "
              :style="{
                height: imageHeight,
                width: imageWidth,
              }"
            />
            <div
              class="d-flex flex-column rounded px-4 py-8"
              style="background-color: #fff; opacity: 0.95"
            >
              <v-text-field
                bg-color="#fff"
                variant="outlined"
                v-model="passcode"
              ></v-text-field>
              <v-btn height="48px" min-width="300" @click="sendPasscode"
                ><v-icon>mdi-lock-open</v-icon> コード送信</v-btn
              >
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-overlay
      :model-value="overlay"
      class="align-center justify-center"
      persistent
      no-click-animation
    >
      <v-progress-circular
        :rotate="0"
        :size="100"
        :width="16"
        :model-value="matchPercentageValue"
        color="#1976d2"
      >
        <small>{{ matchPercentageValue }}%</small>
      </v-progress-circular>
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import resemble from "resemblejs";

const emitsTargetScan = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    msg: string
  ): void;
  (e: "changeComponent", componentName: string): void;
  (e: "foundTarget"): void;
}>();

const propsTargetScan = defineProps<{
  venue: any;
  stream: any;
}>();

const scan = reactive({
  frameId: 0,
  matchPercentage: 0.0,
  opacity: 0,
});

const passcode = ref("");

const targetType = ref(
  propsTargetScan.venue.targets[propsTargetScan.venue.pos].type
);
const overlay = ref(false);
const matchPercentageValue = ref(0);
const progressInterval = ref();
const loading = ref(false);

const imageHeight = 800;
const imageWidth = 600;

onMounted(async () => {
  startVideo();
});

onUnmounted(() => {
  stopVideo();
});

const startVideo = async () => {
  loading.value = true;

  const webcam = document.getElementById("webcam") as HTMLVideoElement;
  const webcamCanvas = document.getElementById(
    "webcamCanvas"
  ) as HTMLCanvasElement;

  if (webcam === null || webcamCanvas === null) {
    loading.value = false;
    return;
  }

  webcam.srcObject = propsTargetScan.stream;
  webcam.play();

  refresh(webcam, webcamCanvas);
  loading.value = false;
};

const stopVideo = async () => {
  const webcam = document.getElementById("webcam") as HTMLVideoElement;
  if (webcam) {
    webcam.pause();
    webcam.srcObject = null;
  }
  if (scan.frameId) clearInterval(scan.frameId);
};

const refresh = (webcam: HTMLVideoElement, webcamCanvas: HTMLCanvasElement) => {
  const ctx = webcamCanvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(webcam, 0, 0, webcamCanvas.width, webcamCanvas.height);

  scan.frameId = requestAnimationFrame(
    refresh.bind(null, webcam, webcamCanvas)
  );
};

const scanImage = () => {
  const webcamCanvas = document.getElementById(
    "webcamCanvas"
  ) as HTMLCanvasElement;
  const image = propsTargetScan.venue.targets[propsTargetScan.venue.pos].image;
  const diff = resemble(image)
    .compareTo(webcamCanvas.toDataURL())
    .ignoreColors()
    .onComplete((data) => {
      // scan.matchPercentage = 100 - data.misMatchPercentage;
      scan.matchPercentage =
        (100 - data.misMatchPercentage) * 1.75 > 100
          ? 100
          : (100 - data.misMatchPercentage) * 1.75;
      showProgress();
    });
};

const showProgress = () => {
  const webcam = document.getElementById("webcam") as HTMLVideoElement;
  webcam.pause();
  overlay.value = true;
  matchPercentageValue.value = 0;
  progressInterval.value = setInterval(async () => {
    if (matchPercentageValue.value >= scan.matchPercentage) {
      clearInterval(progressInterval.value);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      overlay.value = false;
      if (
        scan.matchPercentage >
        propsTargetScan.venue.targets[propsTargetScan.venue.pos].gap
      ) {
        stopVideo();
        emitsTargetScan("foundTarget");
      }
      webcam.play();
      return;
    }
    matchPercentageValue.value += 1;
  }, 100);
};

const sendPasscode = () => {
  alert(passcode.value);
};

defineExpose({
  stopVideo,
});
</script>

<style scoped lang="scss">
.layout {
  position: relative;
  height: calc(100dvh - 160px);
  width: 100%;
}

.webcamCanvas,
.targetImage {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
