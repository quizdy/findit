<template>
  <div class="d-flex align-items-end h-100">
    <transition name="fade">
      <v-img v-show="visible" src="/images/finish.gif" />
    </transition>
    <Transition name="bounce">
      <p v-if="show" class="congratulation">おめでとう!</p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const visible = ref(false);
const show = ref(false);
onMounted(async () => {
  visible.value = true;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  show.value = true;
});
</script>

<style scoped lang="scss">
.congratulation {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  font-size: 5vw;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>
