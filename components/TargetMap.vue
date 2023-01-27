<template>
  <div id="map"></div>
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
  usersGps: any;
}>();

const $config = useRuntimeConfig();
const $gmap = ref<google.maps.Map>();
const zoom = ref(20);

const { venue, usersGps } = toRefs(propsTargetMap);

onMounted(async () => {
  const loader = new Loader({
    apiKey: $config.GMAP_API_KEY,
    version: "weekly",
    libraries: ["places"],
  });

  const google = await loader.load();
  const mapId = document.getElementById("map") as HTMLElement;

  const userGps = usersGps.value.filter((user: any) => user.self === true)[0];

  $gmap.value = new google.maps.Map(mapId, {
    center: new google.maps.LatLng(userGps.gps.lat, userGps.gps.lng),
    zoom: zoom.value,
    disableDefaultUI: true,
    zoomControl: true,
  });

  venue.value.targets.forEach((target: any) => {
    const latLng = new google.maps.LatLng(target.lat, target.lng);
    target.icon = "/images/treasure1.png";
    setTargetMarker(target.title, target.icon, latLng);
  });

  usersGps.value.forEach((user: any, index: number) => {
    const latLng = new google.maps.LatLng(user.gps.lat, user.gps.lng);
    setUserMarker(index, user);
    if (user.self) {
      $gmap.value?.panTo(latLng);
      new google.maps.Circle({
        map: $gmap.value,
        center: latLng,
        radius: user.gps.accuracy,
        strokeColor: "#0081C9",
        strokeOpacity: 0.5,
        strokeWeight: 0.75,
        fillColor: "#0081C9",
        fillOpacity: 0.18,
      });
    }
  });

  google.maps.event.addListener($gmap.value, "zoom_changed", () => {
    zoom.value = $gmap.value?.getZoom();
  });
});

watch(
  () => usersGps,
  (current, prev) => {
    console.log("ccc");
    if (typeof google === "undefined") return;
    current.value.forEach((user: any, index: number) => {
      const userLatLng = new google.maps.LatLng(user.gps.lat, user.gps.lng);
      setUserMarker(index, user);
      if (user.self) {
        $gmap.value?.panTo(userLatLng);
      }

      venue.value.targets.forEach((target: any) => {
        const targetLatLng = new google.maps.LatLng(target.lat, target.lng);
        target.icon = "/images/treasure1.png";
        setTargetMarker(target.title, target.icon, targetLatLng);
        if (typeof google.maps.geometry === "undefined") return;
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          userLatLng,
          targetLatLng
        );
        // console.log("distance:", distance);
      });
    });
  },
  { deep: true }
);

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

const markers: any[] = [];
const setUserMarker = (no: number, user: any) => {
  const latLng = new google.maps.LatLng(user.gps.lat, user.gps.lng);

  const marker = markers.filter((m) => m.userId === user.userId);
  if (0 < marker.length) {
    marker[0].marker.setPosition(
      new google.maps.LatLng(user.gps.lat, user.gps.lng)
    );
    return;
  }

  const userMarker = new google.maps.Marker({
    position: latLng,
    label: (no + 1).toString(),
    title: user.userName,
  });

  const infoWindow = new google.maps.InfoWindow();

  userMarker.addListener("click", () => {
    infoWindow.close();
    infoWindow.setContent(userMarker.getTitle());
    infoWindow.open(userMarker.getMap(), userMarker);
  });

  userMarker.setMap($gmap.value);

  markers.push({
    userId: user.userId,
    marker: userMarker,
  });
};

// const beep = (tempo: number, volume: number) => {
//   const low = new Audio(
//     "data:audio/wav;base64,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"
//   );

//   low.volume = volume;

//   const beep = setInterval(() => {
//     low.play();
//   }, (60 / tempo) * 1000);
// };
</script>

<style scoped lang="scss">
#map {
  height: 100%;
  width: 100%;
}
</style>
