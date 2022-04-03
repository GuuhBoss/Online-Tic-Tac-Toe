const express = require("express");
const path = require("path");
require("dotenv").config();
const sockio = require("socket.io");
const port = process.env.PORT || 8000;
const app = express();
const server = app.listen(port, () => {
  console.log(`The server is running on port: ${port}`);
});

const io = sockio(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (sock) => {
  console.log(`${sock.id} was connected`);

  sock.emit("message", "Hi you are connected");

  sock.on("click", (squarenum) => {
    sock.broadcast.emit("click", squarenum);
  });

  sock.on("join_room", (data) => {
    sock.join(data);
    console.log(`User with ID: ${sock.id} joined room: ${data}`);
  });

  sock.on("send_message", (data) => {
    sock.to(data.room).emit("receive_message", data);
  });

  sock.on("disconnect", () => {
    console.log("User Disconnected", sock.id);
  });
});

app.use(express.static(path.join(__dirname, "./frontend/build/")));

app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./frontend/build/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});
