export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const venueName = query.venueName as string
  const userId = query.userId as string

  const messages = await useStorage().getItem('messages')
  if (messages && 0 < messages.length) {
    const arrayMessage = messages.filter((_message: any) => (_message.venueName === _message.venueName && _message.users.inclues(userId)))
    if (arrayMessage.length === 1) {
      return {
        message: arrayMessage[0]
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