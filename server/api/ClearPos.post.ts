export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const userId = query.userId as string

  if (userId === "") {
    useStorage().setItem('usersGps', [])
    return {
      msg: ''
    }
  }

  let usersGps = await useStorage().getItem('usersGps')

  if (usersGps) {
    usersGps = usersGps.filter((_userGps: any) => _userGps.userId !== userId)
    useStorage().setItem('usersGps', usersGps)
  }
  
  return {
    msg: ''
  }
})