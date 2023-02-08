export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const userId = query.userId as string

  if (userId === "") {
    useStorage().setItem('usersPos', [])
    return {
      msg: ''
    }
  }

  let usersPos = await useStorage().getItem('usersPos')

  if (usersPos) {
    usersPos = usersPos.filter((_userPos: any) => _userPos.userId !== userId)
    useStorage().setItem('usersPos', usersPos)
  }
  
  return {
    msg: ''
  }
})