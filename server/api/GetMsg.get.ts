export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const venueName = query.venueName as string
  const userId = query.userId as string

  let messages = await useStorage().getItem('messages')
  if (messages) {
    const targetMessage = messages.filter((_msg: any) => (_msg.venueName === venueName && _msg.users.includes(userId)))
    if (targetMessage.length === 1) {
      const msg = targetMessage[0].msg
      
      const replaceMessage = messages.filter((_msg: any) => (_msg.venueName !== venueName || !_msg.users.includes(userId)))
      useStorage().setItem('messages', replaceMessage)
      
      return {
        message: msg
      }
    }
    else {
      return {
        message: ""
      }
    }
  }
  else {
    return {
      message: ""
    }
  }
})