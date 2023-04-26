const framePerSecond = 50;
const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");

canvas.addEventListener("mousemove", movePaddle);

let playerOne = {
  x: 0,
  y: canvas.height / 2 - 75,
  width: 25,
  height: 150,
  score: 3,
  wall: true,
};
let playerTwo = {
  x: canvas.width - 25,
  y: canvas.height / 2 - 75,
  width: 20,
  height: 150,
  score: 3,
  wall: true,
};
let playerThree = {
  x: canvas.width / 2 - 75,
  y: 0,
  width: 150,
  height: 20,
  score: 3,
  wall: true,
};
let playerFour = {
  x: canvas.width / 2 - 75,
  y: canvas.height - 25,
  width: 150,
  height: 20,
  score: 3,
  wall: true,
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2 - 150,
  radius: 20,
  speed: 5,
  velocityX: 5,
  velocityY: 5,
};

let hitCounter = 0;

var socket = new WebSocket("wss://site29.webte.fei.stuba.sk:9000");

let playerTaken = false;
let playerNumber;
let players;
let activePlayers = 0;
let gameBegin = false;
let winner;
let first;
let active;

socket.addEventListener("message", function (event) {
  const data = JSON.parse(event.data);
  if (data["first"]) {
    first = data["first"];
  }
  if (data["activePlayer"] !== null && !playerTaken) {
    switch (data["activePlayer"]) {
      case 0:
        canvas.addEventListener("mousemove", function (evt) {
          movePaddle(evt, playerOne, "horizontal");
        });
        active = 1;
        playerTaken = true;
        break;
      case 1:
        canvas.addEventListener("mousemove", function (evt) {
          movePaddle(evt, playerTwo, "horizontal");
        });
        active = 2;
        playerTaken = true;
        break;
      case 2:
        canvas.addEventListener("mousemove", function (evt) {
          movePaddle(evt, playerThree, "vertical");
        });
        active = 3;
        playerTaken = true;
        break;
      case 3:
        canvas.addEventListener("mousemove", function (evt) {
          movePaddle(evt, playerFour, "vertical");
        });
        active = 4;
        playerTaken = true;
        break;
    }
  }
  if (data["players"]) {
    players = data["players"];
    if (players[0] && playerOne.wall == true && !gameBegin) {
      activePlayers++;
      playerOne.wall = false;
    } else if (!players[0] && playerOne.wall == false) {
      playerOne.wall = true;
      activePlayers--;
    }
    if (players[1] && playerTwo.wall == true && !gameBegin) {
      activePlayers++;
      playerTwo.wall = false;
    } else if (!players[1] && playerTwo.wall == false) {
      playerTwo.wall = true;
      activePlayers--;
    }
    if (players[2] && playerThree.wall == true && !gameBegin) {
      activePlayers++;
      playerThree.wall = false;
    } else if (!players[2] && playerThree.wall == false) {
      playerThree.wall = true;
      activePlayers--;
    }
    if (players[3] && playerFour.wall == true && !gameBegin) {
      activePlayers++;
      playerFour.wall = false;
    } else if (!players[3] && playerFour.wall == false) {
      playerFour.wall = true;
      activePlayers--;
    }

    // Get the activePlayers paragraph element
    const activePlayersElement = document.getElementById("activePlayers");
    activePlayersElement.textContent = activePlayers;

    if (activePlayers === 4) {
      gameBegin = true;
    }
  }

  if (data["gameState"]) {
    const gameState = data["gameState"];
    // Handle incoming message
    playerOne = gameState.playerOne;
    playerTwo = gameState.playerTwo;
    playerThree = gameState.playerThree;
    playerFour = gameState.playerFour;
    ball = gameState.ball;
    hitCounter = gameState.hitCounter;
    activePlayers = gameState.activePlayers;
    gameBegin = gameState.gameBegin;
  }
});

function drawRect(x, y, w, h, color) {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);

  // Add black borders
  context.strokeStyle = "black"; // Set the stroke color to white
  context.lineWidth = 1; // Set the line width to 1 pixel
  context.strokeRect(x, y, w, h); // Draw a stroke around the rectangle
}

function drawCircle(x, y, r, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function drawText(x, y, text, color) {
  context.fillStyle = color;
  context.font = "75px monospace";
  context.fillText(text, x, y);
}

function drawHorizontalWall(x) {
  for (i = 50; i < 650; i += 50) {
    drawRect(i, x, 50, 50, "#DC602E");
  }
}

function drawVerticalWall(x) {
  for (i = 0; i < 650; i += 50) {
    drawRect(x, i, 50, 50, "#DC602E");
  }
}

function drawCorners() {
  drawRect(0, 0, 50, 50, "#DC602E");
  drawRect(0, 50, 50, 50, "#DC602E");
  drawRect(50, 0, 50, 50, "#DC602E");

  drawRect(700, 0, 50, 50, "#DC602E");
  drawRect(700, 50, 50, 50, "#DC602E");
  drawRect(650, 0, 50, 50, "#DC602E");

  drawRect(0, 650, 50, 50, "#DC602E");
  drawRect(0, 700, 50, 50, "#DC602E");
  drawRect(50, 700, 50, 50, "#DC602E");

  drawRect(700, 650, 50, 50, "#DC602E");
  drawRect(700, 700, 50, 50, "#DC602E");
  drawRect(650, 700, 50, 50, "#DC602E");
}

function drawPlayer(x, y, width, height) {
  drawRect(x, y, width, height, "#05A8AA");
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "white");
  drawCorners();

  // draw hit counter
  drawText((3 * canvas.width) / 6 - 20, canvas.height / 2, hitCounter, "black");

  if (playerOne.wall) {
    drawVerticalWall(0);
  } else {
    drawPlayer(playerOne.x, playerOne.y, playerOne.width, playerOne.height);
    // draw playerOne score
    drawText(canvas.width / 8, canvas.height / 2, playerOne.score, "black");
  }

  if (playerTwo.wall) {
    drawVerticalWall(700);
  } else {
    drawPlayer(playerTwo.x, playerTwo.y, playerTwo.width, playerTwo.height);
    // draw playerTwo score
    drawText(
      (6.5 * canvas.width) / 8,
      canvas.height / 2,
      playerTwo.score,
      "black"
    );
  }

  if (playerThree.wall) {
    drawHorizontalWall(0);
  } else {
    drawPlayer(
      playerThree.x,
      playerThree.y,
      playerThree.width,
      playerThree.height
    );
    // draw playerThree score
    drawText(
      (3 * canvas.width) / 6 - 20,
      canvas.height / 6,
      playerThree.score,
      "black"
    );
  }

  if (playerFour.wall) {
    drawHorizontalWall(700);
  } else {
    drawPlayer(playerFour.x, playerFour.y, playerFour.width, playerFour.height);
    // draw playerFour score
    drawText(
      (3 * canvas.width) / 6 - 20,
      (7 * canvas.height) / 8,
      playerFour.score,
      "black"
    );
  }

  drawCircle(ball.x, ball.y, ball.radius, "black");
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2 - 150;
  ball.velocityX = -ball.velocityX;
}

function movePaddle(evt, player, orientation) {
  let rect = canvas.getBoundingClientRect();
  let newPosition;

  if (orientation === "horizontal") {
    // horizontal paddle movement
    newPosition = evt.clientY - rect.top - player.height / 2;
    if (newPosition < 100) {
      player.y;
    } else if (newPosition > canvas.height - 100 - player.height) {
      player.y = canvas.height - 100 - player.height;
    } else {
      player.y = evt.clientY - rect.top - player.height / 2;
    }
  } else {
    // Vertical paddle movement
    newPosition = evt.clientX - rect.left - player.width / 2;
    if (newPosition < 100) {
      player.x;
    } else if (newPosition > canvas.width - 100 - player.width) {
      player.x = canvas.width - 100 - player.width;
    } else {
      player.x = evt.clientX - rect.left - player.width / 2;
    }
  }
}

function collision(ball, player) {
  player.top = player.y;
  player.bottom = player.y + player.height;
  player.left = player.x;
  player.right = player.x + player.width;

  ball.top = ball.y - ball.radius;
  ball.bottom = ball.y + ball.radius;
  ball.left = ball.x - ball.radius;
  ball.right = ball.x + ball.radius;

  return (
    ball.right > player.left &&
    ball.top < player.bottom &&
    ball.left < player.right &&
    ball.bottom > player.top
  );
}

function collisionDetection(ball, player) {
  let collidePoint = ball.y - (player.y + player.height / 2);
  collidePoint = collidePoint / (player.height / 2);
  let angleRad = collidePoint * (Math.PI / 4);

  let direction = ball.x < canvas.width / 2 ? 1 : -1;

  ball.velocityX = direction * ball.speed * Math.cos(angleRad);
  ball.velocityY = ball.speed * Math.sin(angleRad);
  ball.speed += 0.1;
}

function hitCorners() {
  // upper left corner
  if (ball.x - ball.radius < 50 && ball.y - ball.radius < 100) {
    ball.velocityX = -ball.velocityX;
    hitCounter++;
  }
  if (ball.y - ball.radius < 50 && ball.x - ball.radius < 100) {
    ball.velocityY = -ball.velocityY;
    hitCounter++;
  }
  if (ball.y - ball.radius < 100 && ball.x - ball.radius < 50) {
    ball.velocityY = -ball.velocityY;
  }
  if (ball.x - ball.radius < 100 && ball.y - ball.radius < 50) {
    ball.velocityX = -ball.velocityX;
  }

  // upper right corner
  if (ball.x + ball.radius > canvas.width - 50 && ball.y - ball.radius < 100) {
    ball.velocityX = -ball.velocityX;
    hitCounter++;
  }
  if (ball.y - ball.radius < 50 && ball.x + ball.radius > canvas.width - 100) {
    ball.velocityY = -ball.velocityY;
    hitCounter++;
  }
  if (ball.y - ball.radius < 100 && ball.x + ball.radius > canvas.width - 50) {
    ball.velocityY = -ball.velocityY;
  }
  if (ball.x + ball.radius > canvas.width - 100 && ball.y - ball.radius < 50) {
    ball.velocityX = -ball.velocityX;
  }

  // lower left corner
  if (ball.x - ball.radius < 50 && ball.y + ball.radius > canvas.height - 100) {
    ball.velocityX = -ball.velocityX;
    hitCounter++;
  }
  if (ball.y + ball.radius > canvas.height - 50 && ball.x - ball.radius < 100) {
    ball.velocityY = -ball.velocityY;
    hitCounter++;
  }
  if (ball.y + ball.radius > canvas.height - 100 && ball.x - ball.radius < 50) {
    ball.velocityY = -ball.velocityY;
  }
  if (ball.x - ball.radius < 100 && ball.y + ball.radius > canvas.height - 50) {
    ball.velocityX = -ball.velocityX;
  }

  // lower right corner
  if (
    ball.x + ball.radius > canvas.width - 50 &&
    ball.y + ball.radius > canvas.height - 100
  ) {
    ball.velocityX = -ball.velocityX;
    hitCounter++;
  }
  if (
    ball.y + ball.radius > canvas.height - 50 &&
    ball.x + ball.radius > canvas.width - 100
  ) {
    ball.velocityY = -ball.velocityY;
    hitCounter++;
  }
  if (
    ball.y + ball.radius > canvas.height - 100 &&
    ball.x + ball.radius > canvas.width - 50
  ) {
    ball.velocityY = -ball.velocityY;
  }
  if (
    ball.x + ball.radius > canvas.height - 100 &&
    ball.y + ball.radius > canvas.height - 50
  ) {
    ball.velocityX = -ball.velocityX;
  }
}

function update() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  hitCorners();

  ////////// PLAYER ONE //////////
  if (playerOne.wall) {
    // check if wall hit
    if (
      ball.x - ball.radius < 50 &&
      ball.y > 100 &&
      ball.y < canvas.height - 100
    ) {
      ball.velocityX = -ball.velocityX;
      hitCounter++;
    }
  } else {
    //check if paddle hit
    if (collision(ball, playerOne)) {
      collisionDetection(ball, playerOne);
      hitCounter++;
    }
    // check if ball missed
    if (ball.x - ball.radius < 0) {
      playerOne.score--;
      if (playerOne.score == 0) {
        playerOne.wall = true;
        activePlayers--;
      }
      resetBall();
    }
  }

  ////////// PLAYER TWO //////////
  if (playerTwo.wall) {
    // check if wall hit
    if (
      ball.x + ball.radius > canvas.width - 50 &&
      ball.y - ball.radius > 100 &&
      ball.y + ball.radius < canvas.height - 100
    ) {
      ball.velocityX = -ball.velocityX;
      hitCounter++;
    }
  } else {
    // check if paddle hit
    if (collision(ball, playerTwo)) {
      collisionDetection(ball, playerTwo);
      hitCounter++;
    }
    // check if ball missed
    if (
      ball.x + ball.radius > canvas.width &&
      ball.y - ball.radius > 100 &&
      ball.y + ball.radius < canvas.height - 100
    ) {
      playerTwo.score--;
      if (playerTwo.score == 0) {
        playerTwo.wall = true;
        activePlayers--;
      }
      resetBall();
    }
  }

  ////////// PLAYER THREE //////////
  if (playerThree.wall) {
    // check if wall hit
    if (
      ball.y - ball.radius < 50 &&
      ball.x - ball.radius > 100 &&
      ball.x + ball.radius < canvas.height - 100
    ) {
      ball.velocityY = -ball.velocityY;
      hitCounter++;
    }
  } else {
    // check if paddle hit
    if (collision(ball, playerThree)) {
      collisionDetection(ball, playerThree);
      hitCounter++;
    }
    // check if ball missed
    if (
      ball.y - ball.radius < 0 &&
      ball.x - ball.radius > 100 &&
      ball.x + ball.radius < canvas.height - 100
    ) {
      playerThree.score--;
      if (playerThree.score == 0) {
        playerThree.wall = true;
        activePlayers--;
      }
      resetBall();
    }
  }

  ////////// PLAYER FOUR //////////
  if (playerFour.wall) {
    // check if wall hit
    if (
      ball.y + ball.radius > canvas.height - 50 &&
      ball.x - ball.radius > 100 &&
      ball.x + ball.radius < canvas.height - 100
    ) {
      ball.velocityY = -ball.velocityY;
      hitCounter++;
    }
  } else {
    // check if paddle hit
    if (collision(ball, playerFour)) {
      collisionDetection(ball, playerFour);
      hitCounter++;
    }
    // check if ball missed
    if (
      ball.y + ball.radius > canvas.height &&
      ball.x - ball.radius > 100 &&
      ball.x + ball.radius < canvas.height - 100
    ) {
      playerFour.score--;
      if (playerFour.score == 0) {
        playerFour.wall = true;
        activePlayers--;
      }
      resetBall();
    }
  }

  function getWinner() {
    if (!playerOne.wall) return "player 1";
    if (!playerTwo.wall) return "player 2";
    if (!playerThree.wall) return "player 3";
    if (!playerFour.wall) return "player4";
  }

  if (activePlayers == 1) {
    winner = getWinner();
  }
  if (activePlayers == 0) {
    // Get the activePlayers paragraph element
    const activePlayersElement = document.getElementById("activePlayers");
    activePlayersElement.textContent = activePlayers;
    const winnerElement = document.getElementById("winner");
    winnerElement.textContent = `WINNER IS: ${winner}`;
    activePlayersElement.textContent = activePlayers;
    gameBegin = false;
    socket.close();
  }
  // Get the activePlayers paragraph element
  const activePlayersElement = document.getElementById("activePlayers");
  activePlayersElement.textContent = activePlayers;
  return {
    playerOne,
    playerTwo,
    playerThree,
    playerFour,
    ball,
    hitCounter,
    activePlayers,
    gameBegin,
  };
}

const startGameButton = document.getElementById("startGame");
startGameButton.addEventListener("click", () => {
  if (first == active) {
    gameBegin = true;
  }
});

function game() {
  if (gameBegin) {
    const gameState = update();
    socket.send(JSON.stringify(gameState));
  }
  render();
}

setInterval(game, 1000 / framePerSecond);
