export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const venueName = query.venueName as string
  const userId = query.userId as string

  let messages = await useStorage().getItem('messages')
  if (messages) {
    const targetMessage = messages.filter((_msg: any) => (_msg.venueName === venueName && _msg.users.includes(userId)))
    if (0 < targetMessage.length) {
      const msg = targetMessage[0].msg
      for(let i = 0; i < messages.length; i++) {
        if (messages[i].venueName === venueName) {
          const pos = messages[i].users.indexOf(userId)
          messages[i].users.splice(pos, 1)
        }
      }
      useStorage().setItem('messages', messages)
      
      return {
        userId: userId,
        message: msg
      }
    }
    else {
      return {
        userId: "",
        message: ""
      }
    }
  }
  else {
    return {
      userId: "",
      message: ""
    }
  }
})