<template>
  <div id="map" v-show="!loading"></div>
  <v-progress-circular
    v-show="loading"
    indeterminate
    color="light-blue"
    :size="70"
    :width="7"
    style="margin: 50% calc(50% - 2rem)"
  ></v-progress-circular>
</template>

<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader";

const emitsTargetMap = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    msg: string
  ): void;
}>();

const propsTargetMap = defineProps<{
  venue: any;
}>();

const $config = useRuntimeConfig();
const $gmap = ref<google.maps.Map>();
const zoom = ref(18);
const pollingPosId = ref();
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const loader = new Loader({
    apiKey: $config.GMAP_API_KEY,
    version: "weekly",
    libraries: ["places"],
  });

  const google = await loader.load();
  const mapId = document.getElementById("map") as HTMLElement;

  $gmap.value = new google.maps.Map(mapId, {
    center: new google.maps.LatLng(
      propsTargetMap.venue.lat,
      propsTargetMap.venue.lng
    ),
    zoom: zoom.value,
    disableDefaultUI: true,
    zoomControl: true,
  });

  const styledMapType = new google.maps.StyledMapType([
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ]);
  $gmap.value.mapTypes.set("noText", styledMapType);
  $gmap.value.setMapTypeId("noText");

  propsTargetMap.venue.targets.forEach((target: any) => {
    const latLng = new google.maps.LatLng(target.lat, target.lng);
    target.icon = "/images/treasure1.png";
    setTargetMarker(target.title, target.icon, latLng);
  });

  google.maps.event.addListener($gmap.value, "zoom_changed", () => {
    zoom.value = $gmap.value?.getZoom();
  });

  watchUsersPos();

  loading.value = false;
});

const setUserPos = (userGps: any) => {
  setUserMarker(userGps);
  if (userGps.self) {
    const latLng = new google.maps.LatLng(userGps.gps.lat, userGps.gps.lng);
    $gmap.value?.panTo(latLng);
    // new google.maps.Circle({
    //   map: $gmap.value,
    //   center: latLng,
    //   radius: userGps.gps.accuracy,
    //   strokeColor: "#0081C9",
    //   strokeOpacity: 0.5,
    //   strokeWeight: 0.75,
    //   fillColor: "#0081C9",
    //   fillOpacity: 0.18,
    // });
    // if (typeof google.maps.geometry !== "undefined") {
    //   const distance = google.maps.geometry.spherical.computeDistanceBetween(
    //     latLng,
    //     targetLatLng
    //   )
    // };
  }
};

const watchUsersPos = () => {
  pollingPosId.value = setInterval(() => {
    getUsersPos();
  }, 3000);
  getUsersPos();
};

const getUsersPos = async () => {
  const { data: res } = await useFetch("/api/GetPos", {
    method: "GET",
  });
  const usersGps = (res.value as any)?.usersGps;

  if (0 < usersGps.length) {
    usersGps.forEach((_userGps: any) => {
      if (_userGps) setUserPos(_userGps);
    });
  }
};

const setTargetMarker = (title: string, icon: string, latLng: any) => {
  const targetMarker = new google.maps.Marker({
    position: latLng,
    icon: {
      url: icon,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
  });
  targetMarker.setMap($gmap.value);
};

let userMarkers = ref(<any[]>[]);

const setUserMarker = (userGps: any) => {
  const latLng = new google.maps.LatLng(userGps.gps.lat, userGps.gps.lng);

  const markers = userMarkers.value.filter(
    (_marker) => _marker.userId === userGps.userId
  );

  if (0 < markers.length) {
    markers[0].userMarker.setPosition(latLng);
    return;
  }

  const userMarker = new google.maps.Marker({
    position: latLng,
    title: userGps.userName,
    icon: {
      url: userGps.image,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
  });

  userMarker.setMap($gmap.value);

  userMarkers.value = [
    ...userMarkers.value,
    {
      userId: userGps.userId,
      userMarker: userMarker,
    },
  ];
};

const stopDrawMap = () => {
  clearInterval(pollingPosId.value);
};

defineExpose({
  stopDrawMap,
});
</script>

<style scoped lang="scss">
#map {
  height: 100%;
  width: 100%;
}
</style>
