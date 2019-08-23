const io = require("socket.io")();
const randomColor = require("randomcolor");

const logger = require("./logger");
const animal = require("./animal");

const port = process.env.PORT || 3000;

const clientDisconnected = (client, reason) => {
  logger.debug({ message: "Client disconnected.", reason });

  /* Remove ALL remote clients, then add back the still-alive ones
   * Need to find a way to just remove the disconnected client. */
  client.broadcast.emit("resetRemoteClients");

  const remoteClients = Object.keys(io.sockets.sockets).map(id => {
    const remoteClient = io.sockets.sockets[id];

    return {
      nickname: remoteClient.nickname,
      coordinates: remoteClient.coordinates,
      color: remoteClient.color
    };
  });

  remoteClients.forEach(remoteClient => {
    client.broadcast.emit("addRemoteClient", remoteClient);
  });
};

const logMove = (nickname, direction, newCoordinates) => {
  logger.debug({ message: "Client move", nickname, direction, newCoordinates });
};

const logMoveDenied = nickname => {
  logger.debug({
    message: "Client move denied",
    nickname: nickname,
    reason: "On edge of map"
  });
};

const clientMove = (client, direction) => {
  logger.debug({
    message: "Client move request",
    nickname: client.nickname,
    direction
  });

  const informRemoteClients = () => {
    client.broadcast.emit("setRemoteClientCoordinates", {
      nickname: client.nickname,
      coordinates: client.coordinates
    });
  };

  switch (direction) {
    case "up":
      if (client.coordinates.y - 10 >= 0) {
        client.coordinates.y -= 10;
        client.emit("setCoordinates", client.coordinates);
        informRemoteClients();
        logMove(client.nickname, direction, client.coordinates);
      } else {
        logMoveDenied(client.nickname);
      }
      break;
    case "right":
      if (client.coordinates.x + 10 <= 500) {
        client.coordinates.x += 10;
        client.emit("setCoordinates", client.coordinates);
        informRemoteClients();
        logMove(client.nickname, direction, client.coordinates);
      } else {
        logMoveDenied(client.nickname);
      }
      break;
    case "down":
      if (client.coordinates.y + 10 <= 500) {
        client.coordinates.y += 10;
        client.emit("setCoordinates", client.coordinates);
        informRemoteClients();
        logMove(client.nickname, direction, client.coordinates);
      } else {
        logMoveDenied(client.nickname);
      }
      break;
    case "left":
      if (client.coordinates.x - 10 >= 0) {
        client.coordinates.x -= 10;
        client.emit("setCoordinates", client.coordinates);
        informRemoteClients();
        logMove(client.nickname, direction, client.coordinates);
      } else {
        logMoveDenied(client.nickname);
      }
  }
};

const clientConnected = client => {
  logger.debug({
    message: "Client connected.",
    clientId: client.id
  });

  client.nickname = animal.random();
  client.coordinates = { x: 250, y: 250 };
  client.color = randomColor();

  client.emit("setNickname", client.nickname);
  client.emit("setCoordinates", client.coordinates);
  client.emit("setColor", client.color);

  logger.debug({
    message: "Client initialized",
    clientId: client.id,
    nickname: client.nickname,
    coordinates: client.coordinates,
    color: client.color
  });

  const remoteClients = Object.keys(io.sockets.sockets)
    .filter(id => id !== client.id)
    .map(id => {
      const remoteClient = io.sockets.sockets[id];

      return {
        nickname: remoteClient.nickname,
        coordinates: remoteClient.coordinates,
        color: remoteClient.color
      };
    });

  remoteClients.forEach(remoteClient => {
    client.emit("addRemoteClient", remoteClient);
  });

  client.broadcast.emit("addRemoteClient", {
    nickname: client.nickname,
    coordinates: client.coordinates,
    color: client.color
  });

  client.on("move", direction => clientMove(client, direction));
  client.on("disconnect", reason => clientDisconnected(client, reason));
};

io.on("connection", clientConnected);

io.listen(port);
logger.info({
  message: "Socket 2D Server listening.",
  port
});
