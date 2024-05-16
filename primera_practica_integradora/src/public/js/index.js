const socket = io();

function sendMessage() {
    const message = document.getElementById("messageInput").value

    socket.emit("newMessage", message)

    messageInput.value = "";
}

function appendMessage(user, message) {

    if (user !== undefined && message !== undefined) {
        const messageList = document.getElementById("messageList")
        const newMessage = document.createElement("p")
        newMessage.textContent = `${user}: ${message}`
        messageList.appendChild(newMessage)
    }
}

socket.on("messageList", (messages) => {
    const messageList = document.getElementById("messageList")
    messageList.innerHTML = ""
    messages.forEach((message) => {
        appendMessage(
            message.user,
            message.message
        )
    })
})

socket.on("newMessage", (data) => {
    appendMessage(data.user, data.message)
});