import io from 'socket.io-client'

export default defineNuxtPlugin(() => {
    const $config = useRuntimeConfig();
    console.log($config)
    const socket = io($config.SOCKET_IO)
    return {
        provide: {
            socket: socket
        }
    }
})