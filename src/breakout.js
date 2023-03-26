var config = {
  type: Phaser.AUTO, 
  parent: "game",
  width: 800,
  heigth: 640,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },

  physics: {
    default: "arcade", 
    arcade: {
      gravity: false,
    },
  },
};
var game = new Phaser.Game(config);

var ball;
var paddle;
var heart;
var bonus;
var lives = 3;
var score = 0;
var livesText;
var scoreText;
var color = ["0xffffff", "0xff0000", "0x00ff00", "0x0000ff"];
var level = 1;
var bonusCount = 0;
var bonusGoodActive = false;
var bonusBadActive = false;
var extraBallActive = false;

//Blocos que vão ser criados
var brickInfo = {
  width: 50 / level, //largura
  height: 20 / level, //comprimento
  count: { row: 4 * level, col: 10 * level }, //numero de linhas e colunas de blocos
  offset: { top: 90, left: 100 }, //posição inicial entre blocos
  padding: 10 * level, //espaço entre blocos
};

//Função para pré carregar recursos do jogo
function preload() {
  this.load.image("paddle", "assets/images/paddle.png");
  this.load.image("ball", "assets/images/ball.png");
  this.load.image("background", "assets/images/background.png");
  this.load.image("heart", "assets/images/heart.png");
  this.load.image("bonus", "assets/images/laranja.png");
}

function create() {
  scene = this;
  scene.add.image(400, 245, "background");
  scene.scale.setGameSize(800, 490);

  /* Código paddle */
  paddle = scene.physics.add.sprite(400, 450, "paddle");
  paddle.setScale(0.9);
  paddle.body.setSize(150, 40);
  paddle.setCollideWorldBounds(true);
  paddle.body.immovable = true;

  /* Código bola */
  ball = scene.physics.add.sprite(400, 300, "ball");
  ball.setScale(0.04);
  ball.body.setSize(120, 120);
  ball.setCollideWorldBounds(true);
  ballGroup = this.physics.add.group(); 

  // Define a velocidade da bola
  function startBall() {
    ball.setVelocity(300, 300);
  }
  // Define um delay para a bola começar a se mover
  setTimeout(startBall, 500);

 
  ball.body.setCollideWorldBounds = true;
  ball.body.bounce.y = 1;  //Salto bola Vertical e Horizontal
  ball.body.bounce.x = 1;

  scene.physics.add.collider(ball, paddle, bounceOffPaddle);

  //Defina a variavel lava como um retangulo que ocupa toda a largura da tela e tem 10px de altura e de faz o colidder com a bola
  lava = scene.add.rectangle(0, 500, 200000, 10, 0x000000);
  scene.physics.add.existing(lava);
  lava.body.immovable = true;
  scene.physics.add.collider(ball, lava, 0, hitLava);

  //adicionar o texto do score e vidas
  scoreText = scene.add.text(16, 16, "Score: " + score, {
    fontSize: "32px",
    fill: "#FFF",
  });
  livesText = scene.add.text(630, 16, "Lives: " + lives, {
    fontSize: "32px",
    fill: "#FFF",
  });
  //Atualizar os corações conforme o numero de vidas
  for (var i = 0; i < lives; i++) {
    scene.add.image(700 + i * 30, 30, "heart").setScale(0.1);
  }

  //Chama a função para criar os blocos
  createBricks1();
  godMode.call(this);

  //Listener para mover o paddle com o mouse ou touch
  scene.input.on("pointermove", function (pointer) {
    paddle.setPosition(pointer.x, paddle.y);
  });
}

function update() {
  if (lives === 0) {
    var gameOverText = this.add.text(
      game.config.width / 2,
      game.config.height / 3,
      "Game Over \n Your score was:" + score,
      { font: "32px Arial", fill: "#FFFFFF" }
    );
    gameOverText.setOrigin(0.5);

    var restartButton = this.add.text(
      game.config.width / 2,
      game.config.height / 3 + 150,
      "Jogar Novamente!",
      {
        font: "24px Arial",
        fill: "#FFFFFF",
        stroke: "#FFFFFF",
        backgroundColor: "#8878C3",
      }
    );

    restartButton.setOrigin(0.5);

    restartButton.setInteractive(); // Habilita a interatividade do botão
    restartButton.on("pointerup", function () {
      window.location.href = "menu.html";
    });

    this.physics.pause();
    this.input.mouse.disableContextMenu();
    this.input.keyboard.enabled = false;
  }
  if (score === brickInfo.count.row * brickInfo.count.col) {
    createBricks2();
  } else if (level === 3) {
    createBricks3();
  }
}

//Função responsável por fazer a bola saltar no paddle quando colidem
function bounceOffPaddle() {
  ball.setVelocityY(-300);
  ball.setVelocityX(Phaser.Math.Between(-350, 350));
}

//Função para criar os blocos
function createBricks1() {
  // Loop através da matriz de padrão de blocos
  for (var i = 0; i < brickInfo.count.col; i++) {
    for (var j = 0; j < brickInfo.count.row; j++) {
      // Se o valor na matriz for 1, cria um bloco
      var brickX =
        i * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
      var brickY =
        j * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
      var brickColor = Phaser.Utils.Array.GetRandom(color);
      manage(
        scene.physics.add.existing(
          scene.add.rectangle(brickX, brickY, 50, 20, brickColor)
        )
      );
    }
  }
}
function createBricks2() {
  bonusCount = 0;
  var rows = 4 * level;
  var cols = 10 * level;
  var matrix = [];
  for (var i = 0; i < rows; i++) {
    var u = [];
    for (var j = 0; j < cols; j++) {
      u.push(Phaser.Math.Between(0, 1));
    }
    matrix.push(u);
  }

  console.log(matrix);

  // Loop através da matriz de padrão de blocos
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      // Se o valor na matriz for 1, cria um bloco
      if (matrix[i][j] == 1) {
        var brickX =
          j * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
        var brickY =
          i * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
        var brickColor = Phaser.Utils.Array.GetRandom(color);
        manage(
          scene.physics.add.existing(
            scene.add.rectangle(brickX, brickY, 50, 20, brickColor)
          )
        );
      }
    }
  }
  ball.setVelocityY(500, 500);
}
function createBricks3() {
  var rows = 4 * level;
  var cols = 10 * level;
  var matrix = [];
  for (var i = 0; i < rows; i++) {
    var u = [];
    for (var j = 0; j < cols; j++) {
      u.push(Phaser.Math.Between(0, 1));
    }
    matrix.push(u);
  }

  console.log(matrix);
  // Loop através da matriz de padrão de blocos
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      // Se o valor na matriz for 1, cria um bloco
      if (matrix[i][j] == 1) {
        var brickX =
          j * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
        var brickY =
          i * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
        var brickColor = Phaser.Utils.Array.GetRandom(color);
        manage(
          scene.physics.add.existing(
            scene.add.rectangle(brickX, brickY, 50, 20, brickColor)
          )
        );
      }
    }
  }
}

//Função para configurar um bloco
function manage(brick) {
  brick.body.immovable = true;
  scene.physics.add.collider(ball, brick, function () {
    ballHitBrick(brick);
  });
}

//Função para colisão da bola com o bloco
function ballHitBrick(brick) {
  if (brick.fillColor == "0xffffff" && level === 1) {
    ball.setVelocity(450, 450);
  } else if (brick.fillColor == "0xffffff" && level === 2) {
    ball.setVelocity(800, 800);
  }
  brick.destroy();
  score++;
  scoreText.setText("Score: " + score);

  callBonus = Math.random() < 0.2 ? createBonus(brick.x, brick.y) : null;
}

function hitLava() {
  lives--;
  livesText.setText("Lives: " + lives);
}

function createBonus(x, y) {
  var maxBonusPerLevel = 5;
  bonusType = Math.random() < 0.5 ? "positive" : "negative";

  if (bonusCount < maxBonusPerLevel) {
    bonus = scene.physics.add.sprite(x, y, "bonus");
    bonus.setScale(0.05);
    bonus.setVelocityY(150);

    scene.physics.add.collider(paddle, bonus, function (paddle, bonus) {
      bonus.disableBody(true, true);

      if (bonusType === "positive") {
        positiveBonus();
      } else if (bonusType === "negative") {
        negativeBonus();
      }
    });
    bonusCount++;
  }
}

function positiveBonus() {
  bonusGoodActive = true;
  var rand_bonus = Phaser.Math.RND.pick([0, 1]); // escolhe aleatoriamente entre aumentar o tamanho do paddle ou receber vida extra
  if (rand_bonus === 0) {
    paddle.setScale(1.5); 
    scene.time.delayedCall(
      10000,
      function () {
        paddle.setScale(1); // retorna o tamanho do paddle ao normal
        bonusGoodActive = false; // marca que o bônus bom não está mais ativo
      },
      [],
      this
    );
  } else {
    lives++;
    livesText.setText("Lives: " + lives);
  }
}

function negativeBonus() {
  if (!extraBallActive) {
    bonusBadActive = true;
    extraBallActive = true;

    extraBall = scene.physics.add.sprite(500, 150, "ball");
    extraBall.setVelocityY(300);
    extraBall.setVelocityX(Phaser.Math.RND.integerInRange(-200, 200));
    extraBall.setBounce(1, 1);
    extraBall.setScale(0.04);
    extraBall.setCollideWorldBounds(true);
    scene.physics.add.collider(extraBall, paddle, bounceOffPaddle);
    scene.physics.add.collider(extraBall, lava, 0, hitLava);
    // Remove a bola adicional após 5 segundos
    setTimeout(function () {
      extraBall.disableBody(true, true);
      extraBallActive = false;
    }, 5000);
  } else {
    paddle.setScale(0.5); // diminui o tamanho do paddle em 50%
    scene.time.delayedCall(
      10000,
      function () {
        paddle.setScale(1); // retorna o tamanho do paddle ao normal
        bonusGoodActive = false; // marca que o bônus bom não está mais ativo
      },
      [],
      this
    );
  }
}

function godMode() {
  // Defina as variáveis iniciais
  var maxLives = 3;

  // Adicione um listener para a tecla "N"
  this.input.keyboard.on('keydown-N', function () {
    paddle.setScale(2.5); // aumenta o tamanho do paddle em 2 vezes
  });

  // Adicione um listener para a tecla "L"
  this.input.keyboard.on('keydown-L', function () {
    lives += 1; // aumenta o número de vidas em 1
    livesText.setText('Lives: ' + lives); // atualiza o texto das vidas
  });

    // Adicione um listener para a tecla "B"
    this.input.keyboard.on('keydown-B', function () {
      paddle.setScale(1); // volta o tamanho do paddle ao normal
      lives = maxLives; // volta o número de vidas para 3
      livesText.setText('Lives: ' + lives); // atualiza o texto das vidas
    });
}

