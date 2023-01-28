<template>
  <div>
    <v-card max-width="600" class="mx-auto mt-2">
      <v-sheet class="d-flex flex-column">
        <v-container mt-0 pt-0>
          <v-row no-gutters>
            <v-col cols="12">
              <div class="layout">
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
                  id="webcamCanvas"
                  class="webcamCanvas"
                  :height="imageHeight"
                  :width="imageWidth"
                ></canvas>
                <img
                  class="targetImage"
                  :src="
                    propsTargetScan.venue.targets[propsTargetScan.venue.pos]
                      .image
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
                v-model="scan.opacity"
              ></v-slider>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" style="text-align: right">
              <v-btn class="mx-4" @click="scanImage"
                ><v-icon>mdi-line-scan</v-icon>スキャン</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-card>
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

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

const emitsTargetScan = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    msg: string
  ): void;
  (e: "changeComponent", componentName: string): void;
  (e: "nextTarget"): void;
}>();

const propsTargetScan = defineProps<{
  venue: any;
}>();

const scan = reactive({
  frameId: 0,
  matchPercentage: 0.0,
  opacity: 0,
});

const overlay = ref(false);
const matchPercentageValue = ref(0);
const interval = ref();

const imageHeight = 800;
const imageWidth = 600;

onMounted(async () => {
  startVideo();
});

const startVideo = async () => {
  if (typeof window !== "object") return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    emitsTargetScan(
      "setSnackbar",
      true,
      2000,
      "warning",
      "カメラデバイスが無効です"
    );
    return;
  }

  const constraints = {
    audio: false,
    video: { facingMode: { exact: "environment" } },
  };

  const requestPermission = (
    DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
  ).requestPermission;

  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (device) => device.kind === "videoinput" && device.label.includes("USB")
  );

  if (0 < devices.length) {
    (constraints.video as any) = true;
  }

  if (typeof requestPermission === "function") {
    (constraints.video as any) = { facingMode: { exact: "environment" } };
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  const webcam = document.getElementById("webcam") as HTMLVideoElement;
  const webcamCanvas = document.getElementById(
    "webcamCanvas"
  ) as HTMLCanvasElement;

  if (webcam === null || webcamCanvas === null) return;

  webcam.srcObject = stream;
  webcam.play();

  refresh(webcam, webcamCanvas);
};

const stopVideo = () => {
  const webcam = document.getElementById("webcam") as HTMLVideoElement;
  webcam.pause();
  webcam.srcObject = null;
  webcam.load();

  clearInterval(scan.frameId);
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
  interval.value = setInterval(async () => {
    if (matchPercentageValue.value >= scan.matchPercentage) {
      clearInterval(interval.value);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      overlay.value = false;
      if (
        scan.matchPercentage >
        propsTargetScan.venue.targets[propsTargetScan.venue.pos].gap
      ) {
        stopVideo();
        emitsTargetScan("nextTarget");
      }
      webcam.play();
      return;
    }
    matchPercentageValue.value += 1;
  }, 100);
};
</script>

<style scoped lang="scss">
.layout {
  position: relative;
  height: calc(100vh - 14.2rem);
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
