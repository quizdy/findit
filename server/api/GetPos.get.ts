export default defineEventHandler(async (e) => {
  const usersGps = await useStorage().getItem('usersGps')
  console.log(usersGps)
  if (usersGps) {
    return {
      usersGps: usersGps
    }
  }
  else {
    return {
      usersGps: []
    }
  }
})