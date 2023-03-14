var config = { /*Criar a variável de configuração do jogo*/
    type: Phaser.AUTO, //tipo de renderização
    parent: 'game', //id do elemento html que vai conter o jogo
    width: 800,
    height: 600,
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
var lives = 3;
var score = 0;
var livesText;
var scoreText;
//Blocos que vão ser criados
var brickInfo={
    width: 50,//largura
    height: 20,//comprimento
    count: {row: 4,col: 12},//numero de linhas e colunas de blocos
    offset: {top: 90,left: 60},//posição inicial entre blocos
    padding: 10 //espaço entre blocos
}

var scene;

//Função para pré carregar recursos do jogo
function preload() {
    this.load.image('paddle', 'assets/images/paddle.png');
    this.load.image('ball', 'assets/images/ball.png');
}

//Função para criar os elementos do jogo
function create (){
    scene = this;

    // Cria o sprite do paddle
    paddle = scene.physics.add.sprite(400, 550, 'paddle');
    // Define o tamanho do sprite do paddle
    paddle.setScale(0.9);
    // Define o tamanho do corpo de colisão do paddle
    paddle.body.setSize(120, 16);
    // Impede que o paddle saia da tela do jogo
    paddle.setCollideWorldBounds(true);

    // Cria o sprite da bola
    ball = scene.physics.add.sprite(400, 300, 'ball');
    // Define o tamanho do sprite da bola
    ball.setScale(0.04);
    // Define o tamanho do corpo de colisão da bola
    ball.body.setSize(16, 16);
    // Impede que a bola saia da tela do jogo
    ball.setCollideWorldBounds(true);
    // Define a velocidade da bola
    ball.setVelocity(300, 300);
    // Define a velocidade máxima da bola
    ball.body.maxVelocity.set(200);
    // Define a elasticidade da bola
    //ball.setBounce(1);
    // Define a gravidade da bola
    ball.setGravityY(0);

    ball.body.setCollideWorldBounds(true, 1, 1);
   
    scene.physics.add.collider(ball, paddle,bounceOffPaddle);

    //Adiciona um listener para mover o paddle com o mouse ou touch
    scene.input.on('pointermove', function (pointer) 
    {
        paddle.setPosition(pointer.x , paddle.y); 
    })
}

function update (){

}

function bounceOffPaddle(){
    ball.setVelocity(ball.body.velocity.x, -ball.body.velocity.y);


}
