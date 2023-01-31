export default defineEventHandler(async (e) => {
  return {
    usersGps: await useStorage().getItem('usersGps')
  }
})