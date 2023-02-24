<template>
  <div class="wrapper">
    <h2 class="title">Findit</h2>
    <transition name="fade" v-for="(venue, i) in venues" :key="i">
      <div
        v-show="visibleVenues[i]"
        class="background-image"
        :style="'background-image: url(' + venue.image + ');'"
      ></div>
    </transition>
    <v-form @submit.prevent="login">
      <v-container>
        <v-row>
          <v-col col-12>
            <v-text-field
              bg-color="#fff"
              variant="outlined"
              v-model="userId"
              @input="validateCheck"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col col-12>
            <v-btn elevation="24" height="48" width="240" @click="login"
              >はじめる</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script setup lang="ts">
const emitsLogin = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    msg: string
  ): void;
  (e: "login", userId: string): void;
}>();

const userId = ref("");

const { data: resGetVenues } = await useFetch("/api/GetVenues", {
  method: "GET",
});

const venues = resGetVenues.value?.venues;

const visibleVenues = ref(<boolean[]>[true]);

for (let i = 1; i < venues?.length; i++) {
  visibleVenues.value.push(false);
}

const validateCheck = () => {
  if (userId.value.length > 8) {
    emitsLogin(
      "setSnackbar",
      true,
      2000,
      "warning",
      "top",
      "8文字以下にしてください"
    );
    userId.value = userId.value.slice(0, -1);
    return;
  }
};

const login = () => {
  emitsLogin("login", userId.value);
};

const sliderInterval = ref();
onMounted(() => {
  let pos = 0;
  sliderInterval.value = setInterval(() => {
    visibleVenues.value[pos] = false;
    if (pos === visibleVenues.value.length - 1) {
      pos = 0;
    } else {
      pos++;
    }
    visibleVenues.value[pos] = true;
  }, 15000);
});

onBeforeUnmount(() => {
  clearInterval(sliderInterval.value);
});
</script>

<style scoped lang="scss">
.title {
  position: fixed;
  top: 1rem;
  left: 1rem;
  // font-family: "M PLUS 1p", sans-serif;
  font-family: "Montserrat";
  // font-size: 0.9rem;
  opacity: 1;
  z-index: 999;
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
