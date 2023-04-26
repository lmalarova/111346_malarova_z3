<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="style.css">
  <title>Pong</title>
</head>
<body>
  <div id="gameplay">
    <canvas id="pong" width="750" height="750"></canvas>
    <div id="game-info">
      <header>
        <h1>Pong</h1>
      </header>
      <div class="content">
        <h2>Počet hráčov: <span id="activePlayers"></span></h2>
        <h1 id="winner"></h1>
        <button id="startGame">Start Game</button>
      </div>
    </div>
  </div>
  <script src="pong.js"></script>
</body>
</html>
