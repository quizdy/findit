<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-tabs
        v-model="tab"
        bg-color="light-blue"
        align-tabs="center"
        height="62"
      >
        <v-tab value="tabInfo" @click="stopVideo">
          <v-icon>mdi-information</v-icon>
        </v-tab>
        <v-tab value="tabCamera" @click="startVideo">
          <v-icon>mdi-camera</v-icon>
        </v-tab>
      </v-tabs>
      <v-form>
        <v-window v-model="tab">
          <v-window-item key="tabInfo" value="tabInfo" disabled>
            <v-container mt-0 pt-0 style="height: calc(100dvh - 3rem)">
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    v-model="targetInfo.title"
                    label="ターゲット名"
                    required
                    @focus="$event.target.select()"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="latLng"
                    label="緯度,経度"
                    append-inner-icon="mdi-map-marker"
                    @click:append-inner="showMap"
                    required
                    @focus="$event.target.select()"
                  >
                  </v-text-field
                ></v-col>
              </v-row>
              <v-row dense>
                <v-col cols="6" style="text-align: center">
                  <v-select
                    v-model="targetInfo.type"
                    :items="targetTypes"
                    variant="solo"
                    hide-details="auto"
                  ></v-select>
                </v-col>
                <v-col cols="6" style="text-align: center">
                  <v-select
                    v-model="targetInfo.icon"
                    :items="$config.ICONS"
                    :item-title="$config.ICONS.title"
                    :item-value="$config.ICONS.value"
                    variant="solo"
                    hide-details="auto"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row class="mb-2">
                <v-col cols="9">
                  <div v-if="targetInfo.image" class="d-flex align-center">
                    <img
                      class="rounded-circle mx-4"
                      :src="targetInfo.image"
                      height="50"
                      width="50"
                    />
                    <v-chip
                      class="ma-2"
                      color="success"
                      label
                      text-color="white"
                      @click="openFileInput"
                    >
                      <v-icon start icon="mdi-check-bold"></v-icon>
                      <small>写真の登録済み</small>
                    </v-chip>
                  </div>
                  <div v-else>
                    <v-chip
                      class="ma-2"
                      color="gray"
                      label
                      text-color="white"
                      @click="openFileInput"
                    >
                      写真が未登録です
                    </v-chip>
                  </div>
                  <v-file-input
                    class="d-none"
                    ref="refFileInput"
                    accept="image/png, image/jpeg, image/bmp"
                    @change="onTargetFileChanged"
                  ></v-file-input>
                </v-col>
                <v-col cols="3"> </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-textarea
                    solo
                    v-model="targetInfo.comments"
                    label="コメント"
                    @focus="$event.target.select()"
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-row no-gutters justify-space-between>
                <v-col cols="6">
                  <v-btn @click="confirmUpdateTarget">登録</v-btn>
                </v-col>
                <v-col cols="6" style="text-align: right">
                  <v-btn @click="cancelTarget">キャンセル</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
          <v-window-item key="tabCamera" value="tabCamera" disabled>
            <v-container mt-0 pt-0 style="height: calc(100dvh - 3rem)">
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
                      :src="targetInfo.image"
                      :style="{
                        opacity: scan.opacity / 100,
                        height: imageHeight,
                        width: imageWidth,
                      }"
                    />
                    <v-slider
                      :disabled="!targetInfo.image"
                      class="mx-8 slider"
                      direction="vertical"
                      max="100"
                      min="0"
                      color="blue"
                      dense
                      v-model="scan.opacity"
                    ></v-slider>
                  </div>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col>
                  <div class="d-flex align-center">
                    <small>基準</small>
                    <v-slider
                      :disabled="!targetInfo.image"
                      class="mx-8 slider"
                      max="100"
                      min="0"
                      color="blue"
                      dense
                      hide-details="auto"
                      v-model="targetInfo.gap"
                      :step="1"
                    >
                      <template v-slot:append>
                        <small>{{ targetInfo.gap }}</small>
                      </template>
                    </v-slider>

                    <v-btn icon :disabled="!targetInfo.image"
                      ><v-icon size="x-small" @click="mask"
                        >mdi-pen</v-icon
                      ></v-btn
                    >
                  </div>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="6">
                  <v-btn v-if="targetInfo.image" class="ma-4" @click="scanImage"
                    ><v-icon>mdi-line-scan</v-icon>スキャン</v-btn
                  >
                </v-col>
                <v-col cols="6" style="text-align: right">
                  <v-btn class="ma-4" @click="saveImage"
                    ><v-icon>mdi-content-save</v-icon>保存する</v-btn
                  >
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
        </v-window>
      </v-form>
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
        color="success"
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

const shutterMp3 = ref();

const emitsTargetEdit = defineEmits<{
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
    func: typeof updateTarget,
    params: any
  ): void;
  (e: "changeComponent", componentName: string): void;
  (e: "setVenueInfo", venue: any): void;
}>();

const propsTargetEdit = defineProps<{
  venue: any;
  target: any;
}>();

const $config = useRuntimeConfig();

const tab = ref("tabInfo");
const targetInfo = reactive({
  no: propsTargetEdit.target.no,
  title: propsTargetEdit.target.title,
  lat: propsTargetEdit.target.lat,
  lng: propsTargetEdit.target.lng,
  gap: propsTargetEdit.target.gap,
  type: propsTargetEdit.target.type,
  icon: propsTargetEdit.target.icon,
  image: propsTargetEdit.target.image,
  comments: propsTargetEdit.target.comments,
  targetStatus: propsTargetEdit.target.targetStatus,
});

const latLng = ref(targetInfo.lat + "," + targetInfo.lng);

const scan = reactive({
  frameId: 0,
  matchPercentage: 0.0,
  opacity: 0,
});

const refFileInput = ref();
const stream = ref();

const overlay = ref(false);
const matchPercentageValue = ref(0);
const interval = ref();
const loading = ref(false);

const imageHeight = 800;
const imageWidth = 600;

const targetTypes = [
  {
    title: "通常",
    value: "",
  },
  {
    title: "追加",
    value: "additional",
  },
  {
    title: "パスコード",
    value: "passcode",
  },
  {
    title: "位置",
    value: "position",
  },
];

const showMap = () => {
  if (latLng.value === "" || latLng.value.indexOf(",") < 0) return;
  const lat = latLng.value.split(",")[0].trim();
  const lng = latLng.value.split(",")[1].trim();

  window.open(
    "https://www.google.co.jp/maps/@" + lat + "," + lng + ",18z",
    "_blank"
  );
};

const openFileInput = () => {
  refFileInput.value.click();
};

const onTargetFileChanged = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  const file = files![0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async (e: any) => {
    targetInfo.image = e.currentTarget.result;
  };
};

const confirmUpdateTarget = () => {
  if (!targetInfo.title) {
    emitsTargetEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "ターゲット名を入力して下さい"
    );
    return;
  }

  if (!targetInfo.image) {
    emitsTargetEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "写真を登録してください"
    );
    return;
  }

  if (!latLng.value || (latLng.value.match(/,/g) || []).length !== 1) {
    emitsTargetEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "緯度,経度をカンマ区切りで登録してください"
    );
    return;
  } else {
    targetInfo.lat = latLng.value.split(",")[0];
    targetInfo.lng = latLng.value.split(",")[1];
  }

  emitsTargetEdit(
    "showConfirmDialog",
    true,
    "登録",
    "登録します。よろしいですか？",
    updateTarget,
    ""
  );
};

const updateTarget = async () => {
  const { data: resUpdateTarget } = await useFetch("/api/UpdateTarget", {
    method: "POST",
    body: { venueName: propsTargetEdit.venue.venueName, target: targetInfo },
  });

  if ((resUpdateTarget.value as any).msg === "") {
    emitsTargetEdit("setVenueInfo", propsTargetEdit.venue);
    emitsTargetEdit("changeComponent", "targetList");
  }
};

const cancelTarget = () => {
  emitsTargetEdit("changeComponent", "targetList");
};

onMounted(async () => {
  shutterMp3.value = new Audio("/sounds/shutter.mp3");

  if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) {
    emitsTargetEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "位置情報が無効です"
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (targetInfo.lat === 0 && targetInfo.lng === 0) {
        latLng.value =
          position.coords.latitude + "," + position.coords.longitude;
      }
    },
    (e: any) => {
      // setSnackbar(true, 2000, "warning", e.message);
      return;
    },
    {
      enableHighAccuracy: true,
      timeout: 2000,
    }
  );
});

const startVideo = async () => {
  loading.value = true;
  if (typeof window !== "object") {
    loading.value = false;
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    emitsTargetEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "top",
      "カメラデバイスが無効です"
    );
    loading.value = false;
    return;
  }

  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (device) => device.kind === "videoinput"
  );

  if (devices.length === 0) {
    emitsTargetEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "top",
      "カメラデバイスが見つかりませんでした"
    );
    return;
  }

  const constraints = {
    audio: false,
    video: {},
  };

  if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) !== null) {
    (constraints.video as any) = {
      facingMode: {
        exact: "environment",
      },
    };
  } else {
    (constraints.video as any) = true;
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((st) => {
      stream.value = st;
    })
    .catch((e) => {
      emitsTargetEdit("setSnackbar", true, 2000, "warning", "top", e.name);
    });

  const webcam = document.getElementById("webcam") as HTMLVideoElement;
  const webcamCanvas = document.getElementById(
    "webcamCanvas"
  ) as HTMLCanvasElement;

  if (webcam === null || webcamCanvas === null) {
    loading.value = false;
    return;
  }

  webcam.srcObject = stream.value;
  webcam.play();

  refresh(webcam, webcamCanvas);
  loading.value = false;
};

const stopVideo = () => {
  const webcam = document.getElementById("webcam") as HTMLVideoElement;
  if (webcam) {
    webcam.pause();
    webcam.srcObject = null;
  }
  if (scan.frameId) clearInterval(scan.frameId);
  if (stream.value) {
    stream.value.getTracks().forEach((track: any) => {
      track.stop();
    });
  }
};

const refresh = (webcam: HTMLVideoElement, webcamCanvas: HTMLCanvasElement) => {
  const ctx = webcamCanvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(webcam, 0, 0, webcamCanvas.width, webcamCanvas.height);

  scan.frameId = requestAnimationFrame(
    refresh.bind(null, webcam, webcamCanvas)
  );
};

const saveImage = () => {
  const webcamCanvas = document.getElementById(
    "webcamCanvas"
  ) as HTMLCanvasElement;
  const base64 = webcamCanvas.toDataURL("image/png");
  targetInfo.image = base64;

  shutterMp3.value.play();

  emitsTargetEdit(
    "setSnackbar",
    true,
    2000,
    "success",
    "bottom",
    "保存しました"
  );

  scan.opacity = 100;
};

const scanImage = () => {
  const webcamCanvas = document.getElementById(
    "webcamCanvas"
  ) as HTMLCanvasElement;
  const image = targetInfo.image;
  const diff = resemble(image)
    .compareTo(webcamCanvas.toDataURL())
    .ignoreColors()
    .onComplete((data) => {
      scan.matchPercentage = 100 - data.misMatchPercentage;
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
      webcam.play();
      return;
    }
    matchPercentageValue.value += 1;
  }, 100);
};

const mask = () => {
  emitsTargetEdit(
    "setSnackbar",
    true,
    -1,
    "success",
    "bottom",
    "黒色でマスキングできるようにする（フリーハンド）。マスキングした箇所を写真とは別のイメージファイルとして保持して、比較するときにターゲット画像と写真画像のそれぞれにマスキング画像を合成して、比較することでマスキング箇所は同じ黒のため結果、マスキング以外が比較されることになるのでスキャンの精度が上がるはず。ただ実装が結構大変になる"
  );
};

defineExpose({
  stopVideo,
});
</script>

<style scoped lang="scss">
.layout {
  position: relative;
  height: calc(100dvh - 13.6rem);
  width: 100%;
}
.layout .webcamCanvas,
.layout .targetImage {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
.layout .slider {
  display: flex;
  position: absolute;
  top: 0;
  right: -3rem;
  margin: 0;
  padding: 3rem 2rem;
  height: 100%;
}
</style>
