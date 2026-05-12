// ─── Flappy Duel 

// P1: A to flap   P2: L to flap

// Each player has 3 lives. Lose a life on pipe hit or floor/ceiling.

// Pipes get faster and gaps get smaller over time.

// First player to lose all 3 lives loses!

let birds = [];
let pipes = [];
let lives = [3, 3];
let gameState = "waiting"; // 'waiting' | 'playing' | 'won'
let winner = -1;
let pipeTimer = 0;
let elapsed = 0; // frames since game started

const MAX_LIVES = 3;
const BASE_PIPE_INTERVAL = 120;
const BASE_PIPE_SPEED = 3;
const BASE_GAP = 160;
const MIN_GAP = 90;
const MAX_PIPE_SPEED = 7;
const PIPE_W = 40;
const GRAVITY = 0.45;
const FLAP = -7;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("monospace");
  resetGame();
}

function resetGame() {
  let birdY = height / 2;
  birds = [
    {
      x: width * 0.5,
      y: birdY,
      vy: 0,
      alive: true,
      col: color(90, 140, 220),
      flashTimer: 0,
    },
    {
      x: width * 0.5,
      y: birdY,
      vy: 0,
      alive: true,
      col: color(220, 100, 90),
      flashTimer: 0,
    },
  ];
  pipes = [];
  pipeTimer = 0;
  elapsed = 0;
}

// difficulty ramps up over ~3 minutes (10800 frames)
function getPipeSpeed() {
  return min(BASE_PIPE_SPEED + elapsed / 1800, MAX_PIPE_SPEED);
}
function getGap() {
  return max(BASE_GAP - elapsed / 120, MIN_GAP);
}
function getPipeInterval() {
  return max(BASE_PIPE_INTERVAL - elapsed / 60, 60);
}

function keyPressed() {
  if (gameState === "won") {
    gameState = "waiting";
    lives = [3, 3];
    winner = -1;
    resetGame();
    return;
  }
  if (gameState === "waiting") gameState = "playing";

  if ((key === "a" || key === "A") && birds[0].alive) birds[0].vy = FLAP;
  if ((key === "l" || key === "L") && birds[1].alive) birds[1].vy = FLAP;
}

function spawnPipe() {
  let g = getGap();
  let gapY = random(100, height - 100 - g);
  pipes.push({ x: width + PIPE_W, gapY: gapY, gap: g, scored: [false, false] });
}

function checkCollision(bird, pipe) {
  let inX = bird.x + 14 > pipe.x && bird.x - 14 < pipe.x + PIPE_W;
  let inTopPipe = bird.y - 14 < pipe.gapY;
  let inBotPipe = bird.y + 14 > pipe.gapY + pipe.gap;
  return inX && (inTopPipe || inBotPipe);
}

function loseLife(b) {
  lives[b]--;
  birds[b].alive = false;
  birds[b].flashTimer = 0;

  if (lives[b] <= 0) {
    gameState = "won";
    winner = 1 - b;
  } else {
    setTimeout(() => respawn(b), 900);
  }
}

function respawn(b) {
  if (gameState !== "playing") return;
  birds[b].y = height / 2;
  birds[b].vy = 0;
  birds[b].alive = true;
  birds[b].flashTimer = 60; // brief invincibility flash
}

function drawBird(b, idx) {
  if (!b.alive) return;
  // flicker during invincibility
  if (b.flashTimer > 0 && frameCount % 6 < 3) {
    b.flashTimer--;
    return;
  }
  if (b.flashTimer > 0) b.flashTimer--;

  let angle = constrain(b.vy * 3, -30, 30);
  push();
  translate(b.x, b.y);
  rotate(radians(angle));
  fill(b.col);
  noStroke();
  ellipse(0, 0, 30, 24);
  fill(255);
  ellipse(8, -4, 10, 10);
  fill(20);
  ellipse(10, -4, 5, 5);
  fill(255, 180, 30);
  triangle(14, 0, 22, -3, 22, 3);
  fill(red(b.col) * 0.7, green(b.col) * 0.7, blue(b.col) * 0.7);
  ellipse(-4, 4, 16, 10);
  pop();

  let labelOffset = idx === 0 ? -22 : 10;
  fill(255);
  noStroke();
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text("P" + (idx + 1) + (idx === 0 ? " [A]" : " [L]"), b.x, b.y + labelOffset);
}

function drawPipe(p) {
  fill(80, 180, 80);
  noStroke();
  rect(p.x, 0, PIPE_W, p.gapY);
  fill(60, 150, 60);
  rect(p.x - 5, p.gapY - 20, PIPE_W + 10, 20);
  fill(80, 180, 80);
  rect(p.x, p.gapY + p.gap, PIPE_W, height - (p.gapY + p.gap));
  fill(60, 150, 60);
  rect(p.x - 5, p.gapY + p.gap, PIPE_W + 10, 20);
}

function drawBackground() {
  background(135, 206, 235);
  fill(255, 230, 80, 180);
  noStroke();
  ellipse(width * 0.5, 60, 70, 70);
  fill(100, 180, 60);
  rect(0, height - 30, width, 30);
  fill(80, 140, 40);
  rect(0, height - 14, width, 14);
}

function drawHearts(idx) {
  let xBase = idx === 0 ? 20 : width - 20 - MAX_LIVES * 28;
  for (let i = 0; i < MAX_LIVES; i++) {
    let hx = xBase + i * 28;
    let hy = 65;
    if (i < lives[idx]) {
      fill(220, 50, 80);
    } else {
      fill(80, 80, 80, 120);
    }
    noStroke();
    // simple heart shape
    beginShape();
    vertex(hx + 10, hy + 4);
    bezierVertex(hx + 10, hy, hx + 4, hy, hx + 4, hy + 5);
    bezierVertex(hx + 4, hy + 9, hx + 10, hy + 13, hx + 10, hy + 16);
    bezierVertex(hx + 10, hy + 13, hx + 16, hy + 9, hx + 16, hy + 5);
    bezierVertex(hx + 16, hy, hx + 10, hy, hx + 10, hy + 4);
    endShape(CLOSE);
  }
}

function drawHUD() {
  stroke(255, 255, 255, 60);
  strokeWeight(1);
  setLineDash([10, 10]);
  line(width / 2, 0, width / 2, height);
  setLineDash([]);

  noStroke();
  // P1 score panel
  fill(50, 100, 200, 180);
  rect(width * 0.25 - 55, 12, 110, 40, 8);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text("Player 1", width * 0.25, 22);
  textSize(11);
  text("lives", width * 0.25, 36);

  // P2 score panel
  fill(200, 60, 50, 180);
  rect(width * 0.75 - 55, 12, 110, 40, 8);
  fill(255);
  textSize(13);
  text("Player 2", width * 0.75, 22);
  textSize(11);
  text("lives", width * 0.75, 36);

  drawHearts(0);
  drawHearts(1);

  // difficulty indicator
  let speed = getPipeSpeed();
  let pct = map(speed, BASE_PIPE_SPEED, MAX_PIPE_SPEED, 0, 1);
  let dLabel = pct < 0.33 ? "easy" : pct < 0.66 ? "medium" : "hard";
  fill(0, 0, 0, 100);
  textSize(11);
  textAlign(CENTER, TOP);
  text("difficulty: " + dLabel, width / 2, 14);
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function drawWaiting() {
  fill(0, 0, 0, 130);
  noStroke();
  rect(width / 2 - 210, height / 2 - 80, 420, 160, 12);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text("FLAPPY DUEL", width / 2, height / 2 - 50);
  textSize(14);
  text("P1 press A  ·  P2 press L", width / 2, height / 2 - 15);
  textSize(12);
  fill(200);
  text("3 lives each — last bird standing wins", width / 2, height / 2 + 15);
  text("pipes get faster the longer you survive!", width / 2, height / 2 + 35);
  fill(180);
  textSize(11);
  text("either key to start", width / 2, height / 2 + 60);
}

function drawWon() {
  let wCol = winner === 0 ? color(50, 100, 220) : color(220, 60, 50);
  fill(red(wCol), green(wCol), blue(wCol), 210);
  noStroke();
  rect(width / 2 - 220, height / 2 - 90, 440, 180, 16);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Player " + (winner + 1) + " Wins!", width / 2, height / 2 - 35);
  textSize(14);
  let loser = 1 - winner;
  text("P" + (loser + 1) + " ran out of lives", width / 2, height / 2 + 5);
  textSize(12);
  fill(220);
  text("any key to play again", width / 2, height / 2 + 45);
}

function draw() {
  drawBackground();

  if (gameState === "playing") {
    elapsed++;

    pipeTimer++;
    if (pipeTimer >= getPipeInterval()) {
      spawnPipe();
      pipeTimer = 0;
    }

    let speed = getPipeSpeed();

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= speed;

      // score: passing a pipe
      for (let b = 0; b < 2; b++) {
        if (
          birds[b].alive &&
          pipes[i].x + PIPE_W < birds[b].x &&
          !pipes[i].scored[b]
        ) {
          pipes[i].scored[b] = true;
        }
      }

      // collision
      for (let b = 0; b < 2; b++) {
        if (
          birds[b].alive &&
          birds[b].flashTimer === 0 &&
          checkCollision(birds[b], pipes[i])
        ) {
          loseLife(b);
        }
      }

      drawPipe(pipes[i]);
      if (pipes[i].x + PIPE_W < 0) pipes.splice(i, 1);
    }

    for (let b = 0; b < 2; b++) {
      let bird = birds[b];
      if (!bird.alive) continue;
      bird.vy += GRAVITY;
      bird.y += bird.vy;

      if (bird.y + 14 > height - 30 || bird.y - 14 < 0) {
        loseLife(b);
      }

      drawBird(bird, b);
    }
  } else {
    for (let b = 0; b < 2; b++) drawBird(birds[b], b);
  }

  drawHUD();
  if (gameState === "waiting") drawWaiting();
  if (gameState === "won") drawWon();
}
