var App = {};

App.stage1 = function(game) {
  console.log("starting stage1");
  console.log(game);
  App.info.game = game;

};

App.stage1.prototype = {
  preload: function() {
    this.load.spritesheet('dude', '/../../../assets/dude.png', 32, 48);
    this.load.image('ground','/../../../assets/platform.png');
  },

  create: function() {
    this.physics.startSystem(Phaser.Physics.ARCADE);
    platforms = this.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(0, this.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;
    player = this.add.sprite(32, this.world.height - 150, 'dude');
    App.info.player = player;
    this.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.gravity.y = 300;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#fff'});

    App.info.socketHandlers();

    

  },

  update: function() {

    for ( var i = 0; i < App.info.players.length; i ++) {
      if (App.info.players[i].alive) { 
        App.info.players[i].update();
        this.physics.arcade.collide(player, App.info.players[i].player);
      }
    }
    var cursors = this.input.keyboard.createCursorKeys();
    player.body.velocity.x = 0;
    this.physics.arcade.collide(player, platforms);

    

    if (cursors.left.isDown) {
      player.body.velocity.x = -150;
      player.animations.play('left');
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 150;
      player.animations.play('right');
    } else {
      player.animations.stop();
      player.frame = 4;

    }
    if (cursors.down.isDown) {
      this.state.start("stage2");
      console.log("start stage 2");
    }
    if (cursors.up.isDown) {
      App.info.score += 10;
      scoreText.text = 'Score:' + App.info.score;
      console.log(this);
    }

    App.info.socket.emit('move player', {
      x: player.x,
      y: player.y,
      angle: player.angle
    });
    // this.socketCheck(App.info.socket, this);


  }

  // socketCheck: function(socket, context) {

  //   socket.on('makePlayer', function(counter) {
  //     console.log(this);
  //     counter = context.add.sprite(32, context.world.height - 150, 'dude');
  //     context.physics.arcade.enable(counter);
  //     context.physics.arcade.enable(counter);
  //     counter.body.collideWorldBounds = true;

  //     counter.body.gravity.y = 300;
  //   });
  
}; 

App.info = {
  score: 0,
  life: 0,
  players: [],
  socket: io.connect('http://localhost:3000'),
  socketHandlers: function () {

    App.info.socket.on('connect', App.info.socketConnect());
    App.info.socket.on('disconnect', App.info.socketDisconnect());
    App.info.socket.on('newplayer', function(data){App.info.createPlayer(data); });
    App.info.socket.on('moveplayer', function(data){App.info.movePlayer(data); });
    App.info.socket.on('remove player', function(data){App.info.removePlayer(data); });

  },
  socketConnect: function() {
    console.log('connected to server');

    App.info.players.forEach(function (player){
      player.player.kill();
    });
    App.info.players = [];
    App.info.socket.emit('new player', {x: player.x, y: player.y, angle: player.angle});

  },
  socketDisconnect: function () {
    console.log('disconnected from server');
    App.info.socket.emit('disconnect');
  },
  createPlayer: function (data) {
    console.log('new player connected', data.id);
    console.log('socket data',data);
    var duplicate = App.info.findPlayer(data.id);

    if (duplicate) {
      console.log("duplicate player");
      return;
    }

    App.info.players.push( new RemotePlayer(data.id, App.info.game, player, data.x, data.y, data.angle));
    console.log("stored players",App.info.players);
  },
  movePlayer: function (data) {

    var movedPlayer = App.info.findPlayer(data.id);

    if (!movedPlayer) {
      console.log('player not found', data.id);
      return;
    }

    movedPlayer.player.x = data.x;
    movedPlayer.player.y = data.y; 
    movedPlayer.player.angle = data.angle;

  },
  removePlayer: function (data) {
    var removedPlayer = App.info.findPlayer(data.id);

    if (!removedPlayer) {
      console.log( 'player not found', data.id);
      return;
    }
    removedPlayer.player.kill();
    App.info.players.splice(App.info.players.indexOf(removedPlayer), 1);

  },
  
  findPlayer: function (id) {
    for (var i = 0; i < App.info.players.length; i ++) {
      if (App.info.players[i].player.name === id) {
        return App.info.players[i];
      }
    }
  }
};