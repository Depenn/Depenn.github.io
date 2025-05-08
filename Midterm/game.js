let pipes;
let gameOver = false;
let score = 0;
let scoreText;
let scoreTriggers;
let gameOverText;
let restartText;
let startText;
let isStarted = false;
let finalScoreText;
let highScore = 0;


const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
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
  bird = this.physics.add.sprite(this.scale.width * 0.25, this.scale.height / 2, 'bird')
    .setDisplaySize(50, 30);
  bird.setCollideWorldBounds(true);
  bird.body.allowGravity = false; // burung diam dulu di awal

  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  const groundH = 100;
  this.ground = this.add.tileSprite(
    0,
    this.scale.height - groundH,
    this.scale.width,
    groundH,
    'ground'
  ).setOrigin(0, 0);

  this.flapSound = this.sound.add('flap');
  this.hitSound = this.sound.add('hit');

  pipes = this.physics.add.group();
  scoreTriggers = this.physics.add.group();

  this.physics.add.collider(bird, pipes, hitPipe, null, this);
  this.physics.add.overlap(bird, scoreTriggers, collectScore, null, this);

  scoreText = this.add.text(this.scale.width * 0.05, this.scale.height * 0.05, 'Score: 0', {
    fontSize: '32px',
    fill: '#000'
  }).setVisible(false);

  // ——— Start Screen Text ———
  startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Click to Play', {
    fontSize: '48px',
    fill: '#000'
  }).setOrigin(0.5);

  this.input.once('pointerdown', () => {
    startText.destroy();
    startGame.call(this);
  });
}


function spawnPipe() {
  const holeY = Phaser.Math.Between(this.scale.height * 0.2, this.scale.height * 0.8);
  const gap = 150;

  // Pipa atas
  const topPipe = pipes.create(this.scale.width, holeY - gap/2, 'pipe')
    .setDisplaySize(50, 500)       // misal 50×500 px
    .setOrigin(0, 1)
    .setFlipY(true);
  topPipe.refreshBody();

  const bottomPipe = pipes.create(this.scale.width, holeY + gap/2, 'pipe')
    .setDisplaySize(50, 500)
    .setOrigin(0, 0);
  bottomPipe.refreshBody();


  [topPipe, bottomPipe].forEach(pipe => {
    pipe.setVelocityX(-200);
    pipe.setImmovable(true);
    pipe.body.allowGravity = false;
  });

  // —– Sensor skor —–
  const trigger = scoreTriggers.create(this.scale.width, holeY, null)
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

  if (score > highScore) highScore = score;

  finalScoreText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY + 80,
    `Final Score: ${score}\nHighest Score: ${highScore}`,
    { fontSize: '24px', fill: '#000', align: 'center' }
  ).setOrigin(0.5);

}

function startGame() {
  isStarted = true;
  bird.body.allowGravity = true;
  scoreText.setVisible(true);

  this.input.on('pointerdown', () => {
    if (!gameOver) {
      bird.setVelocityY(-250);
      this.flapSound.play();
    }
  });

  this.time.addEvent({
    delay: 1500,
    callback: spawnPipe,
    callbackScope: this,
    loop: true
  });
}



function update() {
  if (!isStarted || gameOver) return;

  
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

  if (finalScoreText) finalScoreText.destroy();

}



