export default defineEventHandler(async (e) => {
  console.log("bbbbbbbb", await useStorage().getItem('gps'))
  return {
    gps: await useStorage().getItem('gps')
  }
})