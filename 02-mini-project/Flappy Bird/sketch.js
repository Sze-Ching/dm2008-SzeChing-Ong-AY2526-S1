// DM2008 — Mini Project
// FLAPPY BIRD (Starter Scaffold)

// Notes for students:
// 1) Add flap control in handleInput() (space / ↑ to jump)
// 2) Detect collisions between the bird and pipes → game over
// 3) Add scoring when you pass a pipe
// 4) (Stretch) Add start/pause/game-over states

/* ----------------- Globals ----------------- */
let bird;
let pipes = [];

let cloudImg;
let clouds = [];
let sparkles = [];

// Start screen onlyy bird
let startBird;
let startBirdOffset = 0;
let startBirdDir = 1;

let soundpoint, soundbgm, soundhit, soundjump;

let score = 0;
let gameOver = true;
let gameStarted = false;

let homeBtnX = 180;
let homeBtnY = 500;
let homeBtnW = 120;
let homeBtnH = 40;

let spawnCounter = 0; // simple timer
const SPAWN_RATE = 90; // ~ every 90 frames at 60fps ≈ 1.5s
const PIPE_SPEED = 2.5;
const PIPE_GAP = 160; // gap height (try 100–160)
const PIPE_W = 60;

/* ----------------- Setup & Draw ----------------- */

function preload() {
  cloudImg = loadImage("assets/cloud.png");

  soundpoint = loadSound("assets/coin.mp3");
  soundbgm = loadSound("assets/energetic-bgm.mp3");
  soundhit = loadSound("assets/thud.wav");
  soundjump = loadSound("assets/jump.mp3");
}

function setup() {
  createCanvas(480, 640);
  noStroke();

  resetGame();
    //play bgm
    soundbgm.play();
    soundbgm.loop();
  
}

function draw() {
  drawGradient(); // background gradient

  for (let c of clouds) {
    c.update();
    c.show();
  }

  for (let s of sparkles) {
    s.update();
    s.show();
  }

  // 1) read input (students: add flap control here)
  if (!gameStarted) {
    // Bobbing animation for startBird
    startBirdOffset += 0.2 * startBirdDir;
    if (startBirdOffset > 6 || startBirdOffset < -6) startBirdDir *= -1;

    startBird.pos.y = height / 2 + 80 + startBirdOffset;

    // Draw front-view bird
    startBird.show(true);

    // pulsing title
    let pulse = 6 * sin(frameCount * 0.05);
    textAlign(CENTER, CENTER);
    textSize(56 + pulse);
    fill("#FFD966"); // yellow
    stroke("#FF69B4"); // pink outline
    strokeWeight(4);
    text("FLAPPY BIRD", width / 2, height / 3);

    if (frameCount % 60 < 30) {
      noStroke();
      fill(255);
      stroke("#FF69B4"); // pink outline
      textSize(24);
      strokeWeight(2);
      text("Press SPACE or UP to Start", width / 2, height / 2);
    }

    // reset for other drawings if needed
    noStroke();
    return; // stop here until player starts
  }

  if (!gameOver) handleInput();

  if (gameOver) {
    // Dim the background
    fill(0, 150); // black with alpha
    rect(0, 0, width, height);

    //"Game Over" title
    textAlign(CENTER, CENTER);
    textSize(64);
    fill("#FF4444");
    stroke(255, 200, 0); // yellow outline
    strokeWeight(3);
    text("GAME OVER", width / 2, height / 3);

    // Show score
    textSize(32);
    fill(255);
    stroke(0);
    strokeWeight(3);
    text("Score: " + score, width / 2, height / 2);

    // Restart instruction
    textSize(24);
    fill(255);
    stroke(0);
    strokeWeight(2);
    text("Press 'R' to Restart", width / 2, height / 1.5);

    //Home button
    noStroke();
    fill("#FFD966");
    rect(homeBtnX, homeBtnY, homeBtnW, homeBtnH, 10); // rounded corners
    fill(0);
    textSize(24);
    text("HOME", homeBtnX + homeBtnW / 2, homeBtnY + homeBtnH / 2);

    noLoop();
    return;
  }

  if (!gameOver) handleInput();
  bird.update();

  // 2) update world
  // spawn new pipes on a simple timer
  spawnCounter++;
  if (spawnCounter >= SPAWN_RATE) {
    pipes.push(new Pipe(width + 40));
    spawnCounter = 0;
  }

  // update + draw pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].update();
    pipes[i].show();

    // TODO (students): collision check with bird
    // If collision → stop the game or reset (add a game state if you want)
    // if (pipes[i].hits(bird)) { /* game over logic here */ }

    // collision check
    if (pipes[i].hits(bird)) {
      soundhit.play();
      gameOver = true;

      //noLoop();
    }
    // score check
    if (!pipes[i].passed && pipes[i].x + pipes[i].w < bird.pos.x) {
      pipes[i].passed = true;
      //play point sfx
      soundpoint.play();
      score++;
    }

    // remove pipes that moved off screen
    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }

  // 3) draw bird last so it’s on top
  bird.show();

  // draw score
  fill(255);
  textSize(90);
  textAlign(CENTER, TOP);
  text(score, width / 2, 50);
}

/* ----------------- Show Score ----------------- */
function showScore() {
  fill(255);
  textSize(30);
  textAlign(CENTER, TOP);
  text("Score: " + score, width / 2, height / 2.5);
}

/* ----------------- Input ----------------- */
function handleInput() {
  // TODO (students): make the bird flap on key press
  // Hints:
  // - In keyPressed(): call bird.flap();
  // - Or here: if (keyIsDown(32)) bird.flap(); // 32 = space
}

function mousePressed() {
  if (gameOver) {
    // Check if mouse is inside button
    if (
      mouseX > homeBtnX &&
      mouseX < homeBtnX + homeBtnW &&
      mouseY > homeBtnY &&
      mouseY < homeBtnY + homeBtnH
    ) {
      // Go back to start screen
      gameStarted = false;
      resetGame(); // reset everything for a fresh start
      loop(); // restart draw loop
    }
  }
}

function keyPressed() {
  // Start the game from start screen
  if (!gameStarted && (key === " " || keyCode === UP_ARROW)) {
    gameStarted = true;
    resetGame();
    return;
  }

  // Flap controls (only when alive and playing)
  if (gameStarted && !gameOver) {
    if (key === " ") bird.flap();
    if (keyCode === UP_ARROW) bird.flap();
    soundjump.play();
  }

  // Restart after death
  if (gameOver && (key === "r" || key === "R")) {
    resetGame();
  }
}

/* ----------------- Gradient Background ----------------- */
function drawGradient() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color("#7EDBFF"), color("#fff4f9"), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

/* ----------------- Sparkle Class ----------------- */
class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(3, 6);
    this.speed = random(0.5, 1.5);
    this.alpha = random(150, 255);
  }

  update() {
    this.y -= this.speed;
    this.alpha += sin(frameCount * 0.1) * 5; // twinkle
    if (this.y < -10) {
      this.y = height + random(20, 100);
      this.x = random(width);
    }
  }

  show() {
    noStroke();
    fill(255, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}

/* ----------------- Reset ----------------- */
function resetGame() {
  clouds = [
    new Cloud(100, 100, 0.5),
    new Cloud(300, 150, 0.8),
    new Cloud(500, 80, 0.6),
    new Cloud(700, 200, 0.6),
  ];

  // add sparkles ✨
  sparkles = [];
  for (let i = 0; i < 25; i++) {
    sparkles.push(new Sparkle(random(width), random(height)));
  }

  bird = new Bird(120, height / 5);
  pipes = [new Pipe(width + 40)];
  spawnCounter = 0;
  score = 0;
  gameOver = false;

  // **Create start screen bird once**
  startBird = new Bird(width / 2, height / 2 + 50);

  loop(); // restart draw loop
}

/* ----------------- Classes ----------------- */
class Bird {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.r = 16; // for collision + draw
    this.gravity = 0.25; // constant downward force
    this.flapStrength = -6.0; // negative = upward
  }

  applyForce(fy) {
    this.acc.y += fy;
  }

  flap() {
    // instant upward kick
    this.vel.y = this.flapStrength;
  }

  update() {
    // gravity
    this.applyForce(this.gravity);

    // integrate
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // top border collision = game over
    if (this.pos.y < this.r) {
      soundhit.play();
      gameOver = true;
    }

    // bottom border collision = game over
    if (this.pos.y > height - this.r) {
      soundhit.play();
      gameOver = true;
      // TODO (students): treat touching the ground as game over
    }
  }

  show(frontView = false) {
    if (frontView) {
      // body
      fill(255, 205, 80);
      ellipse(this.pos.x, this.pos.y + 20, this.r * 4.5, this.r * 4);
      //wings
      ellipse(this.pos.x - 40, this.pos.y + 26, this.r * 1, this.r * 1.8);
      ellipse(this.pos.x + 40, this.pos.y + 26, this.r * 1, this.r * 1.8);

      // blush
      fill(255, 150, 180, 180);
      ellipse(this.pos.x - 20, this.pos.y + 26, this.r * 1, this.r * 1);
      ellipse(this.pos.x + 20, this.pos.y + 26, this.r * 1, this.r * 1);

      // beak
      fill(255, 120, 0);
      triangle(
        this.pos.x - 8,
        this.pos.y + 20,
        this.pos.x + 8,
        this.pos.y + 20,
        this.pos.x,
        this.pos.y + 30
      );

      // eyes
      fill(255);
      circle(this.pos.x - 16, this.pos.y + 17, 15); // left
      circle(this.pos.x + 16, this.pos.y + 17, 15); // right
      fill(40);
      circle(this.pos.x - 16, this.pos.y + 17, 10);
      circle(this.pos.x + 16, this.pos.y + 17, 10);
    } else {
      // body
      fill(255, 205, 80);
      ellipse(this.pos.x, this.pos.y, this.r * 2.2, this.r * 2);

      // blush
      fill(255, 150, 180, 180);
      ellipse(this.pos.x - 2, this.pos.y, this.r * 0.8, this.r * 0.8);

      // beak
      fill(255, 120, 0);
      triangle(
        this.pos.x + this.r,
        this.pos.y - 7,
        this.pos.x + this.r + 10,
        this.pos.y + 1,
        this.pos.x + this.r,
        this.pos.y + 4
      );

      // eye white
      fill(255);
      circle(this.pos.x + 6, this.pos.y - 6, 10);
      // eye black
      fill(40);
      circle(this.pos.x + 6, this.pos.y - 6, 8);
      // sparkle in eye (tiny white dot)
      fill(255);
      circle(this.pos.x + 8, this.pos.y - 8, 4);
    }
  }
}

class Cloud {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.w = 100; // width for drawing
    this.h = 60; // height for drawing
  }

  update() {
    this.x -= this.speed;
    if (this.x < -this.w) {
      this.x = width + random(50, 200); // reset off screen to right
      this.y = random(50, 200); // random new height
    }
  }

  show() {
    image(cloudImg, this.x, this.y, this.w, this.h);
  }
}

class Pipe {
  constructor(x) {
    this.x = x;
    this.w = PIPE_W;
    this.speed = PIPE_SPEED;

    // randomize gap position
    const margin = 40;
    const gapY = random(margin, height - margin - PIPE_GAP);

    this.top = gapY; // bottom of top pipe
    this.bottom = gapY + PIPE_GAP; // top of bottom pipe

    this.passed = false; // for scoring once per pipe
  }

  update() {
    this.x -= this.speed;
  }

  show() {
    fill("#00980D");
    rect(this.x, 0, this.w, this.top); // top pipe
    rect(this.x, this.bottom, this.w, height - this.bottom); // bottom pipe
  }

  offscreen() {
    // look at MDN to understand what 'return' does
    // we will learn more about this in Week 6
    return this.x + this.w < 0;
  }

  // TODO (students): circle-rect collision (simple)
  // 1) Check if bird within pipe's x range.
  // 2) If yes, check if bird.y is outside the gap (above top OR below bottom).
  //    Then it’s a hit.
  //
  hits(bird) {
    const withinX =
      bird.pos.x + bird.r > this.x && bird.pos.x - bird.r < this.x + this.w;
    const aboveGap = bird.pos.y - bird.r < this.top;
    const belowGap = bird.pos.y + bird.r > this.bottom;
    return withinX && (aboveGap || belowGap);
  }
}
