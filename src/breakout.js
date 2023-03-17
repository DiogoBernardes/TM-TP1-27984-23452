var config = {
  /*Criar a variável de configuração do jogo*/
  type: Phaser.AUTO, //tipo de renderização
  parent: "game", //id do elemento html que vai conter o jogo
  width: 800,
  heigth: 640,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  //Define a cena que será utilizada no jogo, tais como as funções de preload, criação e atualização de cena
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  /*Define as configurações de física do jogo*/
  physics: {
    default: "arcade", //Tipo de fisica que será utilizado
    arcade: {
      gravity: false, //Gravidade do jogo a 0, pois não precisamos de gravidade
    },
  },
};
//Cria o jogo com as configurações definidas
var game = new Phaser.Game(config);
//Variaveis para guardar informações do jogo
var ball;
var paddle;
var heart;
var lives = 3;
var score = 0;
var livesText;
var scoreText;
var color = ["0xffffff", "0xff0000", "0x00ff00", "0x0000ff"];
var level = 1;
var bonusCount = 0; // variável para contar a quantidade de bônus gerados
var bonusGoodActive = false;
var bonusBadActive = false;

//Blocos que vão ser criados
var brickInfo = {
  width: 50 / level, //largura
  height: 20 / level, //comprimento
  count: { row: 4 * level, col: 10 * level }, //numero de linhas e colunas de blocos
  offset: { top: 90, left: 100 }, //posição inicial entre blocos
  padding: 10 * level, //espaço entre blocos
};

var scene;

//Função para pré carregar recursos do jogo
function preload() {
  this.load.image("paddle", "assets/images/paddle.png");
  this.load.image("ball", "assets/images/ball.png");
  this.load.image("background", "assets/images/background.png");
  this.load.image("heart", "assets/images/heart.png");
  this.load.image("bonus", "assets/images/laranja.jpg");
  this.load.image("bonusNegative", "assets/images/maça.jpg");
}

//Função para criar os elementos do jogo
function create() {
  scene = this;
  //Adiciona o background ao jogo
  scene.add.image(400, 245, "background");
  //Aumentar tamanho background
  scene.scale.setGameSize(800, 490);

  /* Código paddle */
  // Cria o sprite do paddle
  paddle = scene.physics.add.sprite(400, 450, "paddle");
  // Define o tamanho do sprite do paddle
  paddle.setScale(0.9);
  // Define o tamanho do corpo de colisão do paddle
  paddle.body.setSize(150, 40);
  // Impede que o paddle saia da tela do jogo
  paddle.setCollideWorldBounds(true);
  //Tornar o paddle imovel
  paddle.body.immovable = true;

  /* Código bola */
  // Cria o sprite da bola
  ball = scene.physics.add.sprite(400, 300, "ball");
  // Define o tamanho do sprite da bola
  ball.setScale(0.04);
  // Define o tamanho do corpo de colisão da bola
  ball.body.setSize(120, 120);
  // Impede que a bola saia da tela do jogo
  ball.setCollideWorldBounds(true);

  // Define a velocidade da bola
  function startBall() {
    ball.setVelocity(300, 300);
  }
  // Define um delay para a bola começar a se mover
  setTimeout(startBall, 500);

  //Define a colisão da bola com o mundo
  ball.body.setCollideWorldBounds = true;
  //Definimos o quao alto a bola ira saltar na vertical quanto atingir o paddle, onde o 1 significa que irá saltar com a mesma força que atingiu a superficie
  ball.body.bounce.y = 1;
  //Faz o mesmo, mas para a horizontal
  ball.body.bounce.x = 1;
  //Define a colisão da bola com o paddle e invoca a função "bounceOffPaddle"
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

  //Adiciona um listener para mover o paddle com o mouse ou touch
  scene.input.on("pointermove", function (pointer) {
    paddle.setPosition(pointer.x, paddle.y);
  });
}

function update() {
  if (lives === 0) {
    // Exibir a mensagem "Game Over" em um objeto de texto da cena
    var gameOverText = this.add.text(
      game.config.width / 2,
      game.config.height / 3,
      "Game Over \n Your score was:" + score,
      { font: "32px Arial", fill: "#FFFFFF" }
    );
    gameOverText.setOrigin(0.5);

    // Adicionar um botão de reinício
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

    // Pausar o jogo
    this.physics.pause();

    // Desabilitar as interações do jogador com o jogo
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
  //Define a velocidade da bola
  ball.setVelocityY(-300);
  //Define a velocidade da bola
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
  ball.setVelocityY(375, 375);
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
  //Tornar o bloco imóvel
  brick.body.immovable = true;
  //Adiciona-mos um collider entre a bola e o bloco, o que significa que quando a bola colidir com o bloco invoca a função "ballHitBrick"
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
  //Remove o bloco
  brick.destroy();
  //Incrementa o score
  score++;
  scoreText.setText("Score: " + score);
  createBonus(brick.x, brick.y);
}

function hitLava() {
  lives--;
  livesText.setText("Lives: " + lives);
}

function createBonus(x, y) {
  var bonus;
  var extraBall;
  var maxBonusPerLevel = 3; // quantidade máxima de bônus por nível
  if (Math.random() < 0.5) {
    bonusType = "positive";
  } else {
    bonusType = "negative";
  }

  // verifica se o limite máximo de bônus por nível não foi atingido
  if (bonusCount < maxBonusPerLevel) {
    bonus = scene.physics.add.sprite(
      x,
      y,
      "bonus" + bonusType.charAt(0).toUpperCase() + bonusType.slice(1)
    );
    bonus.setScale(0.2);
    bonus.setVelocityY(150);

    // adiciona um collider entre o paddle e o bonus
    scene.physics.add.collider(paddle, bonus, function (paddle, bonus) {
      // Define aqui o comportamento do bônus
      bonus.disableBody(true, true);

      if (bonusType === "positive") {
        bonusGoodActive = true; // marca que o bônus bom está ativo
        var rand_bonus = Phaser.Math.RND.pick([0, 1]); // escolhe aleatoriamente entre aumentar o tamanho do paddle ou receber vida extra
        if (rand_bonus === 0) {
          paddle.setScale(1.5); // aumenta o tamanho do paddle em 50%
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
          // adiciona uma vida extra para o jogador
          lives++;
          livesText.setText("Lives: " + lives);
        }
      } else if (bonusType === "negative") {
        bonusBadActive = true; // marca que o bônus ruim está ativo
        // Adiciona uma nova bola no jogo
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
        }, 5000);
      }
    });

    // incrementa o contador de bônus
    bonusCount++;
  }
}
