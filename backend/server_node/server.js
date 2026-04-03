import { Server } from "socket.io";
import { Redis } from "ioredis";

const io = new Server(6001, {
    cors: {
        origin: "http://localhost:3000",
    },
});
const redis = new Redis(1000);

console.log("Connected to port 6001");
io.on("error", (socket) => {
    console.log("Error on socket:", socket.id);
});
io.on("connection", (socket) => {
    console.log("Incoming connection ID:", socket.id);

    redis.subscribe("application_result", (error, count) => {
        // console.log("channels:", count);
    });
    redis.on("message", (channel, msg) => {
        // console.log("partner:", partner);
        console.log("channel:", channel);
        console.log("message:", msg);

        socket.emit("application_msg", msg);
        console.log("Sent to ", socket.id);
    });
});
