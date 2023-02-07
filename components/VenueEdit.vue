<template>
  <div>
    <v-card max-width="600" class="mx-auto">
      <v-toolbar color="light-blue" dark>
        <v-spacer></v-spacer>
        <v-btn @click="cancelVenue"
          ><v-icon>mdi-arrow-left-circle</v-icon></v-btn
        >
      </v-toolbar>
      <v-form>
        <v-container mt-0 pt-0>
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="venueInfo.venueName"
                label="会場名"
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
            <v-col cols="12">
              <v-file-input
                accept="image/png, image/jpeg, image/bmp"
                placeholder="写真"
                prepend-icon="mdi-camera"
                @change="onVenueFileChanged"
              ></v-file-input>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12">
              <v-textarea
                solo
                v-model="venueInfo.comments"
                label="コメント"
                @focus="$event.target.select()"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row no-gutters justify-space-between>
            <v-col cols="6">
              <v-btn @click="confirmVenue">登録</v-btn>
            </v-col>
            <v-col cols="6" style="text-align: right">
              <v-btn @click="cancelVenue">キャンセル</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const emitsVenueEdit = defineEmits<{
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
    func: typeof updateVenue,
    params: any
  ): void;
  (e: "changeComponent", componentName: string): void;
}>();

const propsVenueList = defineProps<{
  venue: any;
}>();

const venueInfo = reactive({
  venueName: propsVenueList.venue.venueName,
  lat: propsVenueList.venue.lat,
  lng: propsVenueList.venue.lng,
  comments: propsVenueList.venue.comments,
  image: propsVenueList.venue.image,
  pos: propsVenueList.venue.pos,
});

const latLng = ref(venueInfo.lat + "," + venueInfo.lng);

const showMap = () => {
  if (latLng.value === "" || latLng.value.indexOf(",") < 0) return;
  const lat = latLng.value.split(",")[0].trim();
  const lng = latLng.value.split(",")[1].trim();

  window.open(
    "https://www.google.co.jp/maps/@" + lat + "," + lng + ",18z",
    "_blank"
  );
};

const onVenueFileChanged = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  const file = files![0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async (e: any) => {
    venueInfo.image = e.currentTarget.result;
  };
};
const confirmVenue = () => {
  if (!venueInfo.venueName) {
    emitsVenueEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "会場名を入力して下さい"
    );
    return;
  }

  if (!latLng.value || (latLng.value.match(/,/g) || []).length !== 1) {
    emitsVenueEdit(
      "setSnackbar",
      true,
      2000,
      "warning",
      "bottom",
      "緯度,経度をカンマ区切りで登録してください"
    );
    return;
  } else {
    venueInfo.lat = latLng.value.split(",")[0];
    venueInfo.lng = latLng.value.split(",")[1];
  }

  emitsVenueEdit(
    "showConfirmDialog",
    true,
    "登録",
    "登録します。よろしいですか？",
    updateVenue,
    ""
  );
};

const updateVenue = async () => {
  if (!venueInfo.image) {
    venueInfo.image = "/images/T24-42.png";
  }
  const { data: resUpdateVenue } = await useFetch("/api/UpdateVenue", {
    method: "POST",
    body: { venue: venueInfo },
  });

  if ((resUpdateVenue.value as any).msg === "") {
    emitsVenueEdit("changeComponent", "venueList");
  }
};

const cancelVenue = () => {
  emitsVenueEdit("changeComponent", "venueList");
};

onMounted(async () => {
  if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) {
    emitsVenueEdit(
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
      if (venueInfo.lat === 0 && venueInfo.lng === 0) {
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
</script>

<style scoped lang="scss"></style>
