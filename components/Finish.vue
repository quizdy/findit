<template>
  <div>
    <transition name="fade">
      <v-img v-show="visible" src="/images/finish.gif" />
    </transition>
  </div>
</template>

<script setup lang="ts">
const visible = ref(false);
onMounted(() => {
  visible.value = true;
});
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
