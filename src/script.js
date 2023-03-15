var config = { /*Criar a variável de configuração do jogo*/
    type: Phaser.AUTO, //tipo de renderização
    parent: 'game', //id do elemento html que vai conter o jogo
    width: 800,
    height: 500,
    //Define a cena que será utilizada no jogo, tais como as funções de preload, criação e atualização de cena
    scene: {
        preload: preload,
        create : create,
        update : update
    },
    /*Define as configurações de física do jogo*/
    physics: {
        default: 'arcade', //Tipo de fisica que será utilizado 
        arcade: {
            gravity: { y: 0 }, //Gravidade do jogo a 0, pois não precisamos de gravidade
            debug: false //Desativa o modo debug
        }
    }
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
var count= 0;
var color = ["0xffffff", "0xff0000", "0x00ff00", "0x0000ff"];


//Blocos que vão ser criados
var brickInfo={
    width: 50,//largura
    height: 20,//comprimento
    count: {row: 4,col: 10},//numero de linhas e colunas de blocos
    offset: {top: 90,left: 100},//posição inicial entre blocos
    padding: 9//espaço entre blocos
}

var scene;

//Função para pré carregar recursos do jogo
function preload() {
    this.load.image('paddle', 'assets/images/paddle.png');
    this.load.image('ball', 'assets/images/ball.png');
    this.load.image('background', 'assets/images/background.png');
    this.load.image('heart', 'assets/images/heart.png');

}

//Função para criar os elementos do jogo
function create (){
    scene = this;
    //Adiciona o background ao jogo
    scene.add.image(400, 245, 'background');
    //Aumentar tamanho background
    scene.scale.setGameSize(800, 490);

    

    /* Código paddle */
    // Cria o sprite do paddle
    paddle = scene.physics.add.sprite(400, 450, 'paddle');
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
    ball = scene.physics.add.sprite(400, 300, 'ball');
    // Define o tamanho do sprite da bola
    ball.setScale(0.04);
    // Define o tamanho do corpo de colisão da bola
    ball.body.setSize(120, 120);
    // Impede que a bola saia da tela do jogo
    ball.setCollideWorldBounds(true);
    // Define a velocidade da bola

    ball.setVelocity(300, 300);
    //Define a colisão da bola com o mundo
    ball.body.setCollideWorldBounds = true;
    //Definimos o quao alto a bola ira saltar na vertical quanto atingir o paddle, onde o 1 significa que irá saltar com a mesma força que atingiu a superficie
    ball.body.bounce.y = 1;
    //Faz o mesmo, mas para a horizontal
    ball.body.bounce.x = 1;
    //Define a colisão da bola com o paddle e invoca a função "bounceOffPaddle"
    scene.physics.add.collider(ball, paddle,bounceOffPaddle);
    

    lava = scene.add.rectangle(0,500, 200000, 10, 0x000000);
    scene.physics.add.existing(lava);
    lava.body.immovable = true;
    scene.physics.add.collider(ball, lava, 0 , hitLava);

    //adicionar o texto do score
    scoreText = scene.add.text(16,16, 'Score: ' + score, {fontSize: '32px', fill: '#FFF'});
    livesText = scene.add.text(630,16, 'Lives: ' + lives, {fontSize: '32px', fill: '#FFF'});
  
    //Atualizar os corações conforme o numero de vidas
    for(var i = 0; i < lives; i++){
        scene.add.image(700 + (i * 30), 30, 'heart').setScale(0.1);
    }
    //Chama a função para criar os blocos
    createBricks1();

    

    //Adiciona um listener para mover o paddle com o mouse ou touch
    scene.input.on('pointermove', function (pointer) 
    {
        paddle.setPosition(pointer.x , paddle.y); 
    })
}

function update (){
  

    if(lives === 0){
    // Exibir a mensagem "Game Over" em um objeto de texto da cena
    var gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, 'Game Over \n Your score was:' + score, { font: '32px Arial', fill: '#FFFFFF' });
    gameOverText.setOrigin(0.5);
    
    // Adicionar um botão de reinício
    var restartButton = this.add.text(game.config.width / 2, game.config.height / 2 + 150, 'Jogar Novamente!', { font: '24px Arial', fill: '#FFFFFF', 
    stroke: '#FFFFFF',  backgroundColor: '#8878C3' });
    restartButton.setOrigin(0.5);
    
    restartButton.setInteractive(); // Habilita a interatividade do botão
    restartButton.on('pointerup', function() {
        location.reload();
    });
    
    // Pausar o jogo
    this.physics.pause();
    
    // Desabilitar as interações do jogador com o jogo
    this.input.mouse.disableContextMenu();
    this.input.keyboard.enabled = false;
    }
    if (score === brickInfo.count.row * brickInfo.count.col){
        createBricks2();
    }
    else if(score === brickInfo.count.row * brickInfo.count.col + 47){
        createBricks3();
    }
}

//Função responsável por fazer a bola saltar no paddle quando colidem
function bounceOffPaddle(){
    //Define a velocidade da bola
    ball.setVelocityY(-300);
    //Define a velocidade da bola
    ball.setVelocityX(Phaser.Math.Between(-350, 350));
}

//Função para criar os blocos
function createBricks1(){
  // Loop através da matriz de padrão de blocos
  for (var i = 0; i < brickInfo.count.col; i++) {
    for (var j = 0; j < brickInfo.count.row ; j++) {
      // Se o valor na matriz for 1, cria um bloco
        var brickX = (i * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
        var brickY = (j * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
        var brickColor = Phaser.Utils.Array.GetRandom(color);
        manage(scene.physics.add.existing(scene.add.rectangle(brickX, brickY, 50, 20, brickColor)));
    }
  }
}
function createBricks2(){
    // Define uma matriz de 2D para armazenar o padrão de blocos
    var brickPattern = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, , 0, 0, 0, 0]
      ];
   
   // Loop através da matriz de padrão de blocos
   for (var i = 0; i < brickPattern.length; i++) {
     for (var j = 0; j < brickPattern[i].length; j++) {
       // Se o valor na matriz for 1, cria um bloco
       if (brickPattern[i][j] == 1) {
         var brickX = (j * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
         var brickY = (i * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
         var brickColor = Phaser.Utils.Array.GetRandom(color);
         manage(scene.physics.add.existing(scene.add.rectangle(brickX, brickY, 50, 20, brickColor)));
       }
     }
   }
 }
 function createBricks3(){
    // Define uma matriz de 2D para armazenar o padrão de blocos
    var brickPattern = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ];
   // Loop através da matriz de padrão de blocos
   for (var i = 0; i < brickPattern.length; i++) {
     for (var j = 0; j < brickPattern[i].length; j++) {
       // Se o valor na matriz for 1, cria um bloco
       if (brickPattern[i][j] == 1) {
         var brickX = (j * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
         var brickY = (i * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
         var brickColor = Phaser.Utils.Array.GetRandom(color);
         manage(scene.physics.add.existing(scene.add.rectangle(brickX, brickY, 50, 20, brickColor)));
       }
     }
   }
 }

//Função para configurar um bloco
function manage(brick){
    //Tornar o bloco imóvel
    brick.body.immovable = true;
    //Adiciona-mos um collider entre a bola e o bloco, o que significa que quando a bola colidir com o bloco invoca a função "ballHitBrick"
    scene.physics.add.collider(ball, brick, function(){
        ballHitBrick(brick);
    });
}

//Função para colisão da bola com o bloco
function ballHitBrick(brick){

    //Remove o bloco
    brick.destroy();
    //Incrementa o score
    score++;
    scoreText.setText('Score: ' + score);
}

function hitLava(){
    lives--;
    livesText.setText('Lives: ' + lives);

}