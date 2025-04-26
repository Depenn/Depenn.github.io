let pipes;
let gameOver = false;
let score = 0;
let scoreText;
let scoreTriggers;
let gameOverText;
let restartText;


const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  backgroundColor: '#87CEEB', // langit biru
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let bird;

function preload() {
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
  this.load.image('ground', 'assets/ground.png');
  
  this.load.audio('flap', 'assets/wingflap.wav');
  this.load.audio('hit',  'assets/hit.wav');
}

function create() {
  bird = this.physics.add.sprite(100, 300, 'bird')
    .setDisplaySize(50, 30);        
  bird.setCollideWorldBounds(true);

  // 1) Ambil dimensi asli texture
  const src = this.textures.get('ground').getSourceImage();  
  const groundH = 100;                    // tinggi yang mau kita tampilkan

  this.ground = this.add.tileSprite(
    0,
    this.scale.height - groundH,         // y = canvasHeight – groundH
    this.scale.width,                    // lebar canvas
    groundH,                             // tinggi ground
    'ground'
  ).setOrigin(0, 0);

  // 2) Tambahkan physics static body ke tileSprite
  this.physics.add.existing(this.ground, true);  
  this.physics.add.collider(bird, this.ground, hitPipe, null, this);



  this.flapSound = this.sound.add('flap');
  this.hitSound  = this.sound.add('hit');

  this.input.on('pointerdown', () => {
    if (!gameOver) {
      bird.setVelocityY(-250);
      this.flapSound.play();    // <<< play flap!
    }
  });


  // Group untuk pipa
  pipes = this.physics.add.group();
  // Group untuk sensor skor
  scoreTriggers = this.physics.add.group();

  // Spawn pipa tiap 1.5 detik
  this.time.addEvent({
    delay: 1500,
    callback: spawnPipe,
    callbackScope: this,
    loop: true
  });

  // Collider burung vs pipa → game over
  this.physics.add.collider(bird, pipes, hitPipe, null, this);
  // Overlap burung vs sensor skor → naikkan skor
  this.physics.add.overlap(bird, scoreTriggers, collectScore, null, this);

  // Tampilkan skor
  scoreText = this.add.text(20, 20, 'Score: 0', {
    fontSize: '32px',
    fill: '#000'
  });
}

function spawnPipe() {
  const holeY = Phaser.Math.Between(150, 450);
  const gap = 150;

  // Pipa atas
  const topPipe = pipes.create(400, holeY - gap/2, 'pipe')
    .setDisplaySize(50, 500)       // misal 50×500 px
    .setOrigin(0, 1)
    .setFlipY(true);
  topPipe.refreshBody();

  const bottomPipe = pipes.create(400, holeY + gap/2, 'pipe')
    .setDisplaySize(50, 500)
    .setOrigin(0, 0);
  bottomPipe.refreshBody();


  [topPipe, bottomPipe].forEach(pipe => {
    pipe.setVelocityX(-200);
    pipe.setImmovable(true);
    pipe.body.allowGravity = false;
  });

  // —– Sensor skor —–
  const trigger = scoreTriggers.create(400, holeY, null)
    .setSize(10, 600)
    .setAlpha(0)
    .setVelocityX(-200);
  trigger.body.allowGravity = false;
  trigger.passed = false;
}

function hitPipe() {
  if (gameOver) return;               // guard supaya nggak dipanggil berkali-kali
  this.physics.pause();
  gameOver = true;
  bird.setTint(0xff0000);

  this.hitSound.play();

  gameOverText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY - 50,
    'GAME OVER',
    { fontSize: '48px', fill: '#f00' }
  ).setOrigin(0.5);

  restartText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY + 20,
    'Click to Restart',
    { fontSize: '24px', fill: '#000' }
  ).setOrigin(0.5);

  this.input.once('pointerdown', () => resetGame.call(this));
}




function update() {
  if (gameOver) return;
  
  this.ground.tilePositionX += 1;
  
  if (bird.body.blocked.down) {
    hitPipe.call(this);
    return;
  }

  if (bird.body.velocity.y > 0) {
    bird.angle = 20;
  } else {
    bird.angle = -15;
  }
  
}

function collectScore(bird, trigger) {
  if (!trigger.passed) {
    trigger.passed = true;
    score++;
    scoreText.setText('Score: ' + score);
  }
}

function resetGame() {
  // Hapus semua pipa & trigger
  pipes.clear(true, true);
  scoreTriggers.clear(true, true);

  // Reset burung
  bird.clearTint();
  bird.setPosition(100, 300);
  bird.setVelocity(0, 0);

  // Reset skor & teks
  score = 0;
  scoreText.setText('Score: 0');

  // Hapus teks Game Over
  gameOverText.destroy();
  restartText.destroy();

  // Reset flag & physics
  gameOver = false;
  this.physics.resume();
}



