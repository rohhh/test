const config = {
    title: "mijuego",
    scale:{
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        type: Phaser.AUTO,
        parent: "contenedor",
        width: 800,
        height: 600,
    },
    scene: {
        preload,
        create,
        update,
    },
    physics: {
        default:'arcade',
        arcade: {
            gravity:{y: 300},
            debug: false
        }
    },
    
    
}

var game = new Phaser.Game(config);

function preload (){
    this.load.image('particula', 'https://labs.phaser.io/assets/particles/yellow.png');
    this.load.setPath('./assets/');
    this.load.image([
        'Coin',
        'Esfera',
        'Fondo',
        'Plataforma'
    ]);
    this.load.audio('sonido','coin_audio.mp3');
    this.load.spritesheet('Kaze','Kaze.png',{frameWidth:32.5, frameHeight:48});
    

    
};
function create (){
    count = 0;
    diff = 7;
    plataforma = this.physics.add.staticGroup();
    this.add.image(400,300,'Fondo').setScale(1,1.15);
    //this.input.keyboard.on('keydown_R', this.doRestart, this);
    keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    plataforma.create(400,590,'Plataforma').setScale(2.1,1).refreshBody();
    plataforma.create(400,0,'Plataforma').setScale(2.1,0.5).refreshBody();
    plataforma.create(350,300,'Plataforma').setScale(0.2,0.5).refreshBody();
    plataforma.create(700,420,'Plataforma').setScale(0.3,0.5).refreshBody();
    plataforma.create(800,150,'Plataforma').setScale(1,0.5).refreshBody();
    plataforma.create(-50,300,'Plataforma').setScale(1,0.5).refreshBody();
    plataforma.create(0,450,'Plataforma').setScale(1,0.5).refreshBody();
    plataforma.create(0,160,'Plataforma').setScale(0.1,0.5).refreshBody();
    plataforma.create(130,150,'Plataforma').setScale(0.2,0.5).refreshBody();

    Kaze = this.physics.add.sprite(230,100,'Kaze');
    Kaze.setCollideWorldBounds(true);
    Kaze.setBounce(0.2);
    this.physics.add.collider(Kaze, plataforma.getChildren()[2],desplazo,null,this);
    this.physics.add.collider(Kaze, plataforma);
    plataforma.getChildren()[0].setOffset(0,10);
    plataforma.getChildren()[2].setOffset(0,-15);
    plataforma.getChildren()[3].setOffset(0,5);
    plataforma.getChildren()[4].setOffset(0,5);
    plataforma.getChildren()[5].setOffset(0,5);
    plataforma.getChildren()[6].setOffset(0,5);
    plataforma.getChildren()[7].setOffset(0,5);
    plataforma.getChildren()[8].setOffset(0,5);
    
    this.anims.create({
        key: 'Izquierda',
        frames: this.anims.generateFrameNumbers('Kaze', {start:0, end:3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Derecha',
        frames: this.anims.generateFrameNumbers('Kaze', {start:5, end:8}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Quieto',
        frames: [ { key: 'Kaze', frame: 4 } ],
        frameRate: 20
    });

    coins = this.physics.add.group({
        key: 'Coin',
        repeat: 11,
        setXY: { x: 12, y: 50, stepX: 70 }
    });

    coins.children.iterate(function (child) {
        child.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    
    //this.physics.add.collider(coins, plataforma.getChildren()[2],desplazo,null,this);
    this.physics.add.collider(plataforma, coins);
    this.physics.add.overlap(Kaze,coins,esconder,null,this);
    
    PuntosTexto = this.add.text(300,560,'Puntos:0',{fontSize:'40px', color:'red'});
    
    enemigos = this.physics.add.group();
    
    this.physics.add.collider(Kaze,enemigos,choque,null,this);



};

function update(time, delta){

    particulas = this.add.particles('particula');
    var emitter = particulas.createEmitter({
        speed: 5,
        scale: {start:0.1 , end:0},
        blendMode: 'ADD'
    });
    emitter.setPosition(0,22);
    emitter.startFollow(Kaze);
    if(gameOver){
        if(keyR.isDown){
            gameOver = false;
            this.scene.restart();
            this.physics.resume();
            Puntos = 0;
        }
        return;
    }

    //console.log(this.plataforma.getChildren()[3].get());
    //plataforma.getChildren()[2];
    posX = plataforma.getChildren()[2].x;
    posY = plataforma.getChildren()[2].y;
    count = count +1;
    if (count<20){ 
        plataforma.getChildren()[2].setPosition(posX+diff,posY).refreshBody();
    
    } else if (count == 39){
        count = 0;
    } else {
        plataforma.getChildren()[2].setPosition(posX-diff,posY).refreshBody();
    }
    //console.log(count)
    //console.log(Kaze.x)
    cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown)
    {
        Kaze.setVelocityX(-200);
        Kaze.anims.play('Izquierda', true);
    }
    else if (cursors.right.isDown)
    {
        Kaze.setVelocityX(200);
        Kaze.anims.play('Derecha', true);
    }
    else
    {
        Kaze.setVelocityX(0);
        Kaze.anims.play('Quieto');
    }

    if ((cursors.up.isDown || keySpace.isDown) && Kaze.body.touching.down)
    {
        Kaze.setVelocityY(-310);
    }

}; 

function esconder(Kaze,Coin){
    const efecto = this.sound.add('sonido');

    Coin.disableBody(true,true);
    Puntos += 10;
    PuntosTexto.setText('Puntos:'+Puntos);
    efecto.play();
    if (coins.countActive(true) === 0){
        coins.children.iterate(function(child){
            child.enableBody(true,child.x,0,true,true);
        });
        var x = (Kaze.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0,400);
        Esferas = enemigos.create(x,16,'Esfera');
        Esferas.setBounce(1);
        Esferas.setCollideWorldBounds(true);
        Esferas.setVelocity(Phaser.Math.Between(-100,100),5);
    }
}

function choque(Kaze,Esferas){
    this.physics.pause();
    Kaze.anims.play('Quieto');
    Kaze.setTint('Black');
    gameOver = true;
    this.add.text(100,200,'Game Over!!!!!',{fontSize:'80px',color:'red'})
    this.add.text(100,300,'Press [R] to reiniciar',{fontSize:'50px',color:'blue'})
}

function desplazo(Kaze,plataforma){
//console.log("yes");
//Kaze.setPosition(Kaze.x+1,Kaze.y);
if (count<20){ 
    Kaze.setPosition(Kaze.x+2,Kaze.y);

} else {
    Kaze.setPosition(Kaze.x-2,Kaze.y);
}
}

var Puntos = 0;
var PuntosTexto;
var gameOver = false;
