const express = require("express");
const path = require("path");
require("dotenv").config();
const socketio = require("socket.io");
const port = process.env.PORT || 8000;
const app = express();
const server = app.listen(port, () => {
  console.log(`The server is running on port: ${port}`);
});

const io = socketio(server, {
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

  sock.on("hello", (data) => {
    console.log(data);
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
