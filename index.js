const ORIGIN = process.env.ORIGIN
const io = require("socket.io")(8900, {
    cors: {
        origin: `${ORIGIN}`,
    }
});

let users = [];

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
}

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId)
}

io.on("connection", (socket) => {
    //when connect
    console.log("a user connected");

    //take userId and socketId from user
    socket.on("sendUser", userId => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            senderId, text,
        });
    });



    //when disconect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
});