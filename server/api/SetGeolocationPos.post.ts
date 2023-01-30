export default defineEventHandler(async (e) => {
  const body = await readBody(e)
  console.log("aaaaaaaaaaa")
  useStorage().setItem('gps', body.gps)
})