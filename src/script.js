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
var color = ["0xffffff", "0xff0000", "0x00ff00", "0x0000ff"];

//Blocos que vão ser criados
var brickInfo={
    width: 50,//largura
    height: 20,//comprimento
    count: {row: 4,col: 10},//numero de linhas e colunas de blocos
    offset: {top: 90,left: 100},//posição inicial entre blocos
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
    //Tornar o paddle imovel
    paddle.body.immovable = true;

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

    //Define a colisão da bola com o mundo
    ball.body.setCollideWorldBounds(true, 1, 1);
    //Define a colisão da bola com o paddle e invoca a função "bounceOffPaddle"
    scene.physics.add.collider(ball, paddle,bounceOffPaddle);
    
    //Chama a função para criar os blocos
    createBricks();
    //Adiciona um listener para mover o paddle com o mouse ou touch
    scene.input.on('pointermove', function (pointer) 
    {
        paddle.setPosition(pointer.x , paddle.y); 
    })
}

function update (){

}
//Função responsável por fazer a bola saltar no paddle quando colidem
function bounceOffPaddle(){
    ball.setVelocity(ball.body.velocity.x, -ball.body.velocity.y);
}

//Função para criar os blocos
function createBricks(){
    //Escolher uma cor aleatoria para os blocos
    var brickColor = Phaser.Utils.Array.GetRandom(color);
    //Loop para criar os blocos
    for( i = 0; i < brickInfo.count.col; i++){
        for( x = 0; x < brickInfo.count.row; x++){
            //Define a posição inicial do bloco
            var brickX = (i * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
            var brickY = (x * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
            /*Criar o bloco, usamos a função "add.rectangle" para criar um retângulo, depois usamos a função "physics.add.existing" para adicionar o bloco ao jogo
            e assim permitir que o bloco possa interagir com outros objetos*/
            manage(scene.physics.add.existing(scene.add.rectangle(brickX, brickY, 50, 20, brickColor)));
          
        }
    }
}

//Função para configurar um bloco
function manage(brick){
    //Tornar o bloco imóvel
    brick.body.immovable = true;
    //Adiciona-mos um collider entre a bola e o bloco, o que significa que quando a bola colidir com o bloco invoca a função "ballHitBrick"
    scene.physics.add.collider(ball, brick,function(){
        ballHitBrick(brick);
    });
}

//Função para colisão da bola com o bloco
function ballHitBrick(brick){
    //Remove o bloco
    brick.destroy();
    //Incrementa o score
    score++;
}