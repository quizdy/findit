<template>
  <div class="wrapper">
    <div
      v-for="(venue, i) in venues"
      :key="i"
      class="background-image"
      :style="
        'background-image: url(' +
        venue.image +
        '); animation: fadeInOut 3s ease-in ' +
        i * 3 +
        's infinite;'
      "
    ></div>
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
    msg: string
  ): void;
  (e: "setUserInfo", user: any): void;
  (e: "setVenue", venue: any): void;
}>();

const userId = ref("");

const { data: resGetVenues } = await useFetch("/api/GetVenues", {
  method: "GET",
});

const venues = resGetVenues.value?.venues;

const validateCheck = () => {
  if (userId.value.length > 8) {
    emitsLogin("setSnackbar", true, 2000, "warning", "8文字以下にしてください");
    userId.value = userId.value.slice(0, -1);
    return;
  }
};

const login = async () => {
  if (!userId.value) {
    emitsLogin(
      "setSnackbar",
      true,
      2000,
      "warning",
      "ユーザＩＤを入力して下さい"
    );
    return;
  }

  const { data: resGetUser } = await useFetch("/api/GetUser", {
    method: "GET",
    params: { userId: userId.value },
  });

  if (!resGetUser.value.userId) {
    emitsLogin(
      "setSnackbar",
      true,
      2000,
      "warning",
      "ユーザが見つかりませんでした"
    );
    return;
  }

  const user = resGetUser.value;

  if (user.venue.targets.length === 0) {
    emitsLogin(
      "setSnackbar",
      true,
      2000,
      "warning",
      "ターゲットが登録されていません"
    );
    return;
  }

  emitsLogin("setUserInfo", user);
};

onMounted(() => {});

onBeforeUnmount(() => {});
</script>

<style scoped lang="scss">
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

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
