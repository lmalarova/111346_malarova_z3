<?php
  //php server.php start
  use Workerman\Worker;
  use Workerman\Lib\Timer;
  require_once './vendor/autoload.php';

  // SSL context.
  $context = [
    'ssl' => [
        'local_cert'  => '/home/xmalaroval/webte_fei_stuba_sk.pem',
        'local_pk'    => '/home/xmalaroval/webte.fei.stuba.sk.key',
        'verify_peer' => false,
    ]
  ];

  $connections = [];
  $GLOBALS['players']= [false, false, false, false];  

  // Create A Worker and Listens 9000 port, use Websocket protocol
  $ws_worker = new Worker("websocket://0.0.0.0:9000", $context);

  // Enable SSL. WebSocket+SSL means that Secure WebSocket (wss://). 
  // The similar approaches for Https etc.
  $ws_worker->transport = 'ssl';

  // 1 processes
  $ws_worker->count = 1;

  $ws_worker->onWorkerStart = function($ws_worker)
  {   
    // Emitted when new connection come
    $ws_worker->onConnect = function ($connection) use (&$connections) {
      $connections[$connection->id] = $connection;
      for($i = 0; $i < 5; $i++) {
        $object = new stdClass();
        if(!$GLOBALS['players'][$i]) {
          echo $i+1 ."\n";
          if($i == 0) {
            $GLOBALS['first'] = 1;
          }
          $GLOBALS['players'][$i] = true;
          $GLOBALS['activePlayer'] = $i;
          break;
        }
      }
      // Send gameState to all clients
      foreach ($connections as $conn) {
        echo $conn->id;
        $object = new stdClass();
        $object->players = $GLOBALS['players'];
        $object->activePlayer = $GLOBALS['activePlayer'];
        $object->first = $GLOBALS['first'];
        $conn->send(json_encode($object));
      }
      echo "New connection\n";
    };

  $ws_worker->onMessage = function ($connection, $data) use (&$connections) {
    $connections[$connection->id] = $connection;
    $gameState = json_decode($data);

    // Send gameState to all clients
    foreach ($connections as $conn) {
      $object = new stdClass();
      $object->players = $GLOBALS['players'];
      $object->first = $GLOBALS['first'];
      $object->gameState = $gameState;
      $conn->send(json_encode($object));
    }
  };

  // Emitted when connection closed
  $ws_worker->onClose = function ($connection) use (&$connections) {
    $GLOBALS['players'][$connection->id - 1] = false;
    if($GLOBALS['first'] = $connection->id) {
      for($i=0; $i<4; $i++){
        if($GLOBALS['players'][$i]){
          $GLOBALS['first'] = $i+1;
          break;
        }
      }
    }
    foreach ($connections as $conn) {
      $object = new stdClass();
      $object->players = $GLOBALS['players'];
      $object->first = $GLOBALS['first'];
      $conn->send(json_encode($object));
    }
    unset($connections[$connection->id]);
    echo "Connection closed\n";
    };
  };
  // Run worker
  Worker::runAll();
?>
