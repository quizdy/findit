export default defineEventHandler(async (e) => {
  return {
    gps: await useStorage().getItem('msg')
  }
})