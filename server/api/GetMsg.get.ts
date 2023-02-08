export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const venueName = query.venueName as string
  const userId = query.userId as string

  let messages = await useStorage().getItem('messages')
  if (messages) {
    const targetMessage = messages.filter((_msg: any) => (_msg.venueName === venueName && _msg.users.includes(userId)))
    if (0 < targetMessage.length) {
      const sender = targetMessage[0].sender
      const msg = targetMessage[0].msg
      const mission = targetMessage[0].mission
      for(let i = 0; i < messages.length; i++) {
        if (messages[i].venueName === venueName) {
          const pos = messages[i].users.indexOf(userId)
          messages[i].users.splice(pos, 1)
        }
      }
      useStorage().setItem('messages', messages)
      
      return {
        sender: sender,
        message: msg,
        mission: mission,
      }
    }
    else {
      return {
        sender: "",
        message: "",
      }
    }
  }
  else {
    return {
      sender: "",
      message: "",
    }
  }
})