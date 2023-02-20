<template>
  <div class="wrapper">
    <h2 class="title">Findit</h2>
    <div
      class="background-image"
      style="background-image: url('/images/bg.jpg')"
    ></div>
    <v-form @submit.prevent="adminLogin">
      <v-container>
        <v-row>
          <v-col col-12>
            <v-text-field
              bg-color="#fff"
              variant="outlined"
              v-model="adminId"
              @input="validateCheck"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col col-12>
            <v-btn elevation="24" height="48" width="240" @click="adminLogin"
              >はじめる</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script setup lang="ts">
const emitsAdminLogin = defineEmits<{
  (
    e: "setSnackbar",
    show: boolean,
    timeout: number,
    color: string,
    location: string,
    msg: string
  ): void;
  (e: "changeComponent", componentName: string): void;
}>();

const $config = useRuntimeConfig();
const adminId = ref("");

const validateCheck = () => {
  if (adminId.value.length > 10) {
    adminId.value = adminId.value.slice(0, -1);
    return;
  }
};

const adminLogin = async () => {
  if (!adminId.value) {
    emitsAdminLogin(
      "setSnackbar",
      true,
      2000,
      "warning",
      "top",
      "パスワードを入力して下さい"
    );
    return;
  }

  if (adminId.value !== $config.ADMIN_PASSWORD) {
    emitsAdminLogin(
      "setSnackbar",
      true,
      2000,
      "warning",
      "top",
      "パスワードが違います"
    );
    return;
  }

  emitsAdminLogin("changeComponent", "venueList");
};
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
</style>
