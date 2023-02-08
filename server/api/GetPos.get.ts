export default defineEventHandler(async (e) => {
  const usersPos = await useStorage().getItem('usersPos')
  if (usersPos) {
    return {
      usersPos: usersPos
    }
  }
  else {
    return {
      usersPos: []
    }
  }
})