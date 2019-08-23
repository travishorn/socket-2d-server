const io = require("socket.io")();
const randomColor = require("randomcolor");

const logger = require("./logger");
const animal = require("./animal");

const port = process.env.PORT || 3000;

const clientDisconnected = reason => {
  logger.debug({ message: "Client disconnected.", reason });
};

const logMove = (nickname, direction, newLocation) => {
  logger.debug({ message: "Client move", nickname, direction, newLocation });
};

const logMoveDenied = nickname => {
  logger.debug({
    message: "Client move denied",
    nickname: nickname,
    reason: "On edge of map"
  });
};

const clientConnected = client => {
  const move = direction => {
    logger.debug({
      message: "Client move request",
      nickname: client.nickname,
      direction
    });

    switch (direction) {
      case "up":
        if (client.coordinates.y - 10 >= 0) {
          client.coordinates.y -= 10;
          client.emit("setLocation", client.coordinates);
          logMove(client.nickname, direction, client.coordinates);
        } else {
          logMoveDenied(client.nickname);
        }
        break;
      case "right":
        if (client.coordinates.x + 10 <= 500) {
          client.coordinates.x += 10;
          client.emit("setLocation", client.coordinates);
          logMove(client.nickname, direction, client.coordinates);
        } else {
          logMoveDenied(client.nickname);
        }
        break;
      case "down":
        if (client.coordinates.y + 10 <= 500) {
          client.coordinates.y += 10;
          client.emit("setLocation", client.coordinates);
          logMove(client.nickname, direction, client.coordinates);
        } else {
          logMoveDenied(client.nickname);
        }
        break;
      case "left":
        if (client.coordinates.x - 10 >= 0) {
          client.coordinates.x -= 10;
          client.emit("setLocation", client.coordinates);
          logMove(client.nickname, direction, client.coordinates);
        } else {
          logMoveDenied(client.nickname);
        }
    }
  };

  logger.debug({
    message: "Client connected.",
    clientId: client.id
  });

  client.nickname = animal.random();
  client.coordinates = { x: 250, y: 250 };
  client.color = randomColor();

  client.emit("setNickname", client.nickname);
  client.emit("setLocation", client.coordinates);
  client.emit("setColor", client.color);

  logger.debug({
    message: "Client initialized",
    clientId: client.id,
    nickname: client.nickname,
    location: client.coordinates,
    color: client.color
  });

  client.on("move", move);
  client.on("disconnect", clientDisconnected);
};

io.on("connection", clientConnected);

io.listen(port);
logger.info({
  message: "Socket 2D Server listening.",
  port
});
