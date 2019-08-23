const io = require("socket.io")();
const randomColor = require("randomcolor");
const animal = require("./animal");

const port = process.env.PORT || 3000;

const clientDisconnected = reason => {
  console.log("Client disconnected.", reason);
};

const clientConnected = client => {
  const move = direction => {
    console.log(`${client.nickname} wants to move ${direction}.`);
    switch (direction) {
      case "up":
        if (client.coordinates.y - 10 >= 0) {
          client.coordinates.y -= 10;
          client.emit("setLocation", client.coordinates);
          console.log(`${client.nickname} has room and moves ${direction}.`);
        }
        break;
      case "right":
        if (client.coordinates.x + 10 <= 500) {
          client.coordinates.x += 10;
          client.emit("setLocation", client.coordinates);
          console.log(`${client.nickname} has room and moves ${direction}.`);
        }
        break;
      case "down":
        if (client.coordinates.y + 10 <= 500) {
          client.coordinates.y += 10;
          client.emit("setLocation", client.coordinates);
          console.log(`${client.nickname} has room and moves ${direction}.`);
        }
        break;
      case "left":
        if (client.coordinates.x - 10 >= 0) {
          client.coordinates.x -= 10;
          client.emit("setLocation", client.coordinates);
          console.log(`${client.nickname} has room and moves ${direction}.`);
        }
    }
  };

  console.log("Client connected.", client.id);

  client.nickname = animal.random();
  client.coordinates = { x: 250, y: 250 };
  client.color = randomColor();

  console.log(`${client.id} gets nickname ${client.nickname}`);
  client.emit("setNickname", client.nickname);
  client.emit("setLocation", client.coordinates);
  client.emit("setColor", client.color);

  client.on("move", move);
  client.on("disconnect", clientDisconnected);
};

io.on("connection", clientConnected);

io.listen(port);
console.log(`Socket 2D Server listening on port ${port}.`);
