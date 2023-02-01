export default defineEventHandler(async (e) => {
  useStorage().setItem('usersGps', [])
  return {
    msg: ''
  }
})