export default defineEventHandler(async (e) => {
  const body = await readBody(e)
  const userGps = body.userGps

  let usersGps = await useStorage().getItem('usersGps')

  if (!usersGps) usersGps = []

  if (!usersGps.some((_userGps: any) => _userGps.userId === userGps.userId)) {
    usersGps = [...usersGps, userGps];
  } else {
    usersGps = usersGps.map((_userGps: any) =>
      _userGps.userId === userGps.userId ? userGps : _userGps
    );
  }

  useStorage().setItem('usersGps', usersGps)

  return {
    msg: ''
  }
})