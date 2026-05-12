let currentBrush = 'pen';
let ribbonPrev = null;
let brushColor;
let brushSize = 12;
let pg;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(245, 243, 240);
  pg = createGraphics(windowWidth, windowHeight);
  pg.pixelDensity(1);
  pg.background(245, 243, 240);
  brushColor = color(127, 119, 221);
  textFont('monospace');
  drawUI();
}

function drawUI() {
  fill(230, 228, 225);
  noStroke();
  rect(0, 0, width, 50);

  let brushes = ['pen', 'spray', 'splatter', 'ribbon', 'eraser'];
  let colors = [
    color(83, 74, 183),
    color(15, 110, 86),
    color(153, 60, 29),
    color(184, 79, 134),
    color(120, 120, 120)
  ];
  for (let i = 0; i < brushes.length; i++) {
    let x = 20 + i * 112;
    let isActive = brushes[i] === currentBrush;
    fill(isActive ? colors[i] : 255);
    stroke(isActive ? colors[i] : 180);
    strokeWeight(1);
    rect(x, 10, 100, 30, 6);
    fill(isActive ? 255 : 80);
    noStroke();
    textSize(13);
    textAlign(CENTER, CENTER);
    text(brushes[i], x + 50, 25);
  }

  // size label
  fill(80);
  noStroke();
  textSize(12);
  textAlign(LEFT, CENTER);
  text('size: ' + brushSize, 590, 25);

  // color swatch (hidden for eraser)
  if (currentBrush !== 'eraser') {
    fill(brushColor);
    stroke(180);
    strokeWeight(1);
    rect(660, 12, 26, 26, 4);
  }

  // clear button
  fill(255);
  stroke(180);
  strokeWeight(1);
  rect(700, 10, 70, 30, 6);
  fill(180, 60, 60);
  noStroke();
  textSize(13);
  textAlign(CENTER, CENTER);
  text('clear', 735, 25);
}

function mousePressed() {
  if (mouseY < 50) {
    let brushes = ['pen', 'spray', 'splatter', 'ribbon', 'eraser'];
    for (let i = 0; i < brushes.length; i++) {
      let x = 20 + i * 112;
      if (mouseX > x && mouseX < x + 100 && mouseY > 10 && mouseY < 40) {
        currentBrush = brushes[i];
        ribbonPrev = null;
      }
    }
    if (mouseX > 700 && mouseX < 770 && mouseY > 10 && mouseY < 40) {
      pg.background(245, 243, 240);
    }
    return;
  }
}

function mouseReleased() {
  ribbonPrev = null;
}

function keyPressed() {
  if (key === '1') { currentBrush = 'pen';      ribbonPrev = null; }
  if (key === '2') { currentBrush = 'spray';    ribbonPrev = null; }
  if (key === '3') { currentBrush = 'splatter'; ribbonPrev = null; }
  if (key === '4') { currentBrush = 'ribbon';   ribbonPrev = null; }
  if (key === '5') { currentBrush = 'eraser';   ribbonPrev = null; }
  if (key === '=' || key === '+') brushSize = min(brushSize + 2, 60);
  if (key === '-')                brushSize = max(brushSize - 2, 2);
  if (key === 'c' || key === 'C') {
    let palettes = [
      color(127, 119, 221),
      color(29, 158, 117),
      color(216, 90, 48),
      color(212, 83, 126),
      color(55, 138, 221),
      color(186, 117, 23),
      color(30, 30, 30)
    ];
    let idx = frameCount % palettes.length;
    brushColor = palettes[idx];
  }
  if (key === 'r' || key === 'R') brushColor = color(random(255), random(255), random(255));
}

function drawBrush() {
  let r = red(brushColor);
  let g = green(brushColor);
  let b = blue(brushColor);
  let sz = brushSize;

  if (currentBrush === 'eraser') {
    pg.noStroke();
    pg.fill(245, 243, 240);
    pg.ellipse(mouseX, mouseY, sz * 3, sz * 3);
    return;
  }

  if (currentBrush === 'pen') {
    pg.stroke(r, g, b, 220);
    pg.strokeWeight(sz * 0.6);
    pg.noFill();
    pg.line(mouseX, mouseY, pmouseX, pmouseY);

  } else if (currentBrush === 'spray') {
    let density = sz * 3;
    pg.noStroke();
    for (let i = 0; i < density; i++) {
      let radius = random(0, sz * 1.5);
      let angle  = random(TWO_PI);
      let sx = mouseX + radius * cos(angle);
      let sy = mouseY + radius * sin(angle);
      let a  = map(radius, 0, sz * 1.5, 200, 20);
      pg.fill(r, g, b, a);
      pg.ellipse(sx, sy, random(1, 2.5), random(1, 2.5));
    }

  } else if (currentBrush === 'splatter') {
    let drops = floor(random(4, 10));
    for (let i = 0; i < drops; i++) {
      let dist  = random(sz * 0.5, sz * 3);
      let angle = random(TWO_PI);
      let dx    = mouseX + dist * cos(angle);
      let dy    = mouseY + dist * sin(angle);
      let dsize = random(sz * 0.15, sz * 0.6);
      let alpha = random(120, 230);
      pg.noStroke();
      pg.fill(r, g, b, alpha);
      pg.ellipse(dx, dy, dsize, dsize * random(0.4, 1.2));
      if (random() > 0.6) {
        let tailLen   = random(dsize, dsize * 3);
        let tailAngle = angle + random(-0.3, 0.3);
        pg.stroke(r, g, b, alpha * 0.5);
        pg.strokeWeight(random(0.5, 1.5));
        pg.line(dx, dy, dx + tailLen * cos(tailAngle), dy + tailLen * sin(tailAngle));
        pg.noStroke();
      }
    }
    pg.noStroke();
    pg.fill(r, g, b, 200);
    pg.ellipse(mouseX, mouseY, sz * 0.5, sz * 0.5);

  } else if (currentBrush === 'ribbon') {
    if (ribbonPrev) {
      let dx = mouseX - ribbonPrev.x;
      let dy = mouseY - ribbonPrev.y;
      let len = sqrt(dx * dx + dy * dy);
      if (len > 0) {
        let nx = -dy / len;
        let ny =  dx / len;
        let hw = sz * 0.5;
        let x1 = mouseX + nx * hw,       y1 = mouseY + ny * hw;
        let x2 = mouseX - nx * hw,       y2 = mouseY - ny * hw;
        let x3 = ribbonPrev.x - nx * hw, y3 = ribbonPrev.y - ny * hw;
        let x4 = ribbonPrev.x + nx * hw, y4 = ribbonPrev.y + ny * hw;
        pg.noStroke();
        pg.fill(r, g, b, 200);
        pg.quad(x1, y1, x2, y2, x3, y3, x4, y4);
        let shimmer = map(sin(frameCount * 0.3), -1, 1, 0, 60);
        pg.fill(255, 255, 255, shimmer);
        pg.quad(x1, y1, x1 - nx * (hw * 0.3), y1 - ny * (hw * 0.3),
                x4 + nx * (hw * 0.3) - nx * (hw * 0.3), y4 + ny * (hw * 0.3) - ny * (hw * 0.3),
                x4, y4);
      }
    }
    ribbonPrev = { x: mouseX, y: mouseY };
  }
}

function draw() {
  image(pg, 0, 0);

  if (mouseIsPressed && mouseY > 50) {
    drawBrush();
  } else {
    ribbonPrev = null;
  }

  // cursor preview
  if (mouseY > 50) {
    let sz = brushSize;
    if (currentBrush === 'eraser') {
      stroke(150);
      strokeWeight(1);
      noFill();
      ellipse(mouseX, mouseY, sz * 3, sz * 3);
    } else if (currentBrush === 'pen') {
      noFill();
      stroke(red(brushColor), green(brushColor), blue(brushColor), 150);
      strokeWeight(1);
      ellipse(mouseX, mouseY, sz * 0.6, sz * 0.6);
    } else {
      noFill();
      stroke(red(brushColor), green(brushColor), blue(brushColor), 150);
      strokeWeight(1);
      ellipse(mouseX, mouseY, sz * 3, sz * 3);
    }
  }

  drawUI();

  fill(160);
  noStroke();
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text('keys: 1 pen  2 spray  3 splatter  4 ribbon  5 eraser  |  +/- size  |  c colour  |  r random', 10, height - 8);
}