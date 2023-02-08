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
    location: string,
    msg: string
  ): void;
}>();

const propsTargetMap = defineProps<{
  user: any;
}>();

const $config = useRuntimeConfig();
const $gmap = ref<google.maps.Map>();
const zoom = ref(18);
const pollingPosId = ref();
const loading = ref(false);

let targetMarkers = ref(<any[]>[]);
let userMarkers = ref(<any[]>[]);

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
      propsTargetMap.user.venue.lat,
      propsTargetMap.user.venue.lng
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

  propsTargetMap.user.venue.targets.forEach((target: any) => {
    setTargetMarker(target);
  });

  showTargetMarker(propsTargetMap.user.venue.pos);

  google.maps.event.addListener($gmap.value, "zoom_changed", () => {
    zoom.value = $gmap.value?.getZoom();
  });

  const usersPos = await getUsersPos();
  const myself = usersPos.filter(
    (_userPos) => _userPos.userId === propsTargetMap.user.userId
  )[0];
  setUserPos(myself);
  const latLng = new google.maps.LatLng(myself.gps.lat, myself.gps.lng);
  $gmap.value?.panTo(latLng);

  // new google.maps.Circle({
  //   map: $gmap.value,
  //   center: latLng,
  //   radius: userPos.gps.accuracy,
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

  loading.value = false;

  watchUsersPos();
});

const setUserPos = (userPos: any) => {
  setUserMarker(userPos);
};

const watchUsersPos = () => {
  pollingPosId.value = setInterval(() => {
    setUsersPos();
  }, 3000);
};

const getUsersPos = async (): Promise<any[]> => {
  const { data: res } = await useFetch("/api/GetPos", {
    method: "GET",
  });
  return (res.value as any)?.usersPos;
};

const setUsersPos = async () => {
  const usersPos = await getUsersPos();
  usersPos.forEach((_userPos: any) => {
    setUserPos(_userPos);
  });
};

const setUserMarker = (userPos: any) => {
  const latLng = new google.maps.LatLng(userPos.gps.lat, userPos.gps.lng);

  const markers = userMarkers.value.filter(
    (_marker) => _marker.userId === userPos.userId
  );

  if (0 < markers.length) {
    markers[0].userMarker.setPosition(latLng);
    return;
  }

  const userMarker = new google.maps.Marker({
    position: latLng,
    title: userPos.userName,
    icon: {
      url: userPos.image,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
    zIndex: 1000 - userMarkers.value.length,
  });

  userMarker.setMap($gmap.value);

  userMarkers.value = [
    ...userMarkers.value,
    {
      userId: userPos.userId,
      userMarker: userMarker,
    },
  ];
};

const showTargetMarker = (no: number) => {
  targetMarkers.value.forEach((_marker) => {
    if (_marker.no === no + 1) {
      _marker.targetMarker.setVisible(true);
    } else {
      _marker.targetMarker.setVisible(false);
    }
  });
};

const setTargetMarker = (target: any) => {
  const latLng = new google.maps.LatLng(target.lat, target.lng);

  const markers = targetMarkers.value.filter(
    (_marker) => _marker.no === target.no
  );

  if (0 < markers.length) {
    return;
  }

  const targetMarker = new google.maps.Marker({
    position: latLng,
    icon: {
      url: target.icon,
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
    },
    visible: false,
    zIndex: 1,
  });

  targetMarker.setMap($gmap.value);

  targetMarkers.value = [
    ...targetMarkers.value,
    {
      no: target.no,
      targetMarker: targetMarker,
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
