<template>
  <div class="background">
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
  (e: "setUser", user: any): void;
  (e: "setVenue", venue: any): void;
  (e: "changeComponent", componentName: string): void;
}>();

const userId = ref("");

const validateCheck = () => {
  if (!userId.value) {
    return;
  }

  if (userId.value.length > 8) {
    emitsLogin("setSnackbar", true, 2000, "warning", "8文字以下にしてください");
    userId.value = userId.value.slice(0, -1);
    return;
  }
};

const login = async () => {
  if (!userId.value) {
    emitsLogin("setSnackbar", true, 2000, "warning", "文字を入力して下さい");
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

  emitsLogin("setUser", user);

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

  emitsLogin("changeComponent", "targetInfo");
};
</script>

<style scoped lang="scss">
.background {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/images/bg.jpg") no-repeat center center;
  background-size: cover;
  opacity: 0.8;
}
</style>
