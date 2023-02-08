export default defineEventHandler(async (e) => {
  const body = await readBody(e)
  const userPos = body.userPos

  let usersPos = await useStorage().getItem('usersPos')

  if (!usersPos) usersPos = []

  if (!usersPos.some((_userPos: any) => _userPos.userId === userPos.userId)) {
    usersPos = [...usersPos, userPos];
  } else {
    usersPos = usersPos.map((_userPos: any) =>
      _userPos.userId === userPos.userId ? userPos : _userPos
    );
  }

  useStorage().setItem('usersPos', usersPos)

  return {
    msg: ''
  }
})