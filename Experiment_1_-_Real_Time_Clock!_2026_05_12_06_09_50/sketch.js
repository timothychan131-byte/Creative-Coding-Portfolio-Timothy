let W, H, cx, cy, R;
 
function setup() {
  W = windowWidth;
  H = windowHeight;
  createCanvas(W, H);
  cx = W / 2;
  cy = H / 2;
  R = 140;
  textFont('monospace');
}
 
function skyColor(h, m) {
  let t = h + m / 60;
  let stops = [
    { t: 0,  r: 5,   g: 10,  b: 30  },
    { t: 4,  r: 15,  g: 25,  b: 70  },
    { t: 5,  r: 100, g: 150, b: 210 },
    { t: 6,  r: 80,  g: 160, b: 230 },
    { t: 11, r: 255, g: 165, b: 50  },
    { t: 14, r: 220, g: 80,  b: 40  },
    { t: 17, r: 180, g: 50,  b: 30  },
    { t: 19, r: 40,  g: 50,  b: 100 },
    { t: 21, r: 10,  g: 15,  b: 40  },
    { t: 24, r: 5,   g: 10,  b: 30  },
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    let a = stops[i], b2 = stops[i + 1];
    if (t >= a.t && t < b2.t) {
      let frac = (t - a.t) / (b2.t - a.t);
      return color(lerp(a.r, b2.r, frac), lerp(a.g, b2.g, frac), lerp(a.b, b2.b, frac));
    }
  }
  return color(5, 10, 30);
}
 
function getTimeLabel(h) {
  if (h >= 20 || h < 4)  return { name: 'night',     icon: '★' };
  if (h < 5)              return { name: 'pre-dawn',  icon: '◑' };
  if (h < 7)              return { name: 'dawn',      icon: '◐' };
  if (h < 11)             return { name: 'morning',   icon: '○' };
  if (h < 14)             return { name: 'noon',      icon: '☀' };
  if (h < 17)             return { name: 'afternoon', icon: '◕' };
  if (h < 20)             return { name: 'evening',   icon: '◑' };
  return { name: 'night', icon: '★' };
}
 
function drawStars(sky) {
  let b = brightness(sky);
  if (b > 40) return;
  randomSeed(42);
  let alpha = map(b, 0, 40, 200, 0);
  fill(255, 255, 255, alpha);
  noStroke();
  for (let i = 0; i < 80; i++) {
    let x = random(W);
    let y = random(H * 0.6);
    let s = random(1, 2.5);
    ellipse(x, y, s, s);
  }
}
 
function drawSun(h, m) {
  let t = h + m / 60;
  if (t < 6 || t >= 20) return;
  let angle = map(t, 6, 20, PI, 0);
  let sx = cx + 240 * cos(angle);
  let sy = cy + 120 - 120 * sin(angle);
  let alpha = min(map(t, 5, 6, 0, 200), map(t, 19, 20, 200, 0));
  noStroke();
  fill(255, 230, 100, alpha * 0.3);
  ellipse(sx, sy, 80, 80);
  fill(255, 220, 60, alpha);
  ellipse(sx, sy, 36, 36);
}
 
function drawMoon(h, m) {
  let t = h + m / 60;
  if (!(t >= 21 || t < 5)) return;
  noStroke();
  fill(230, 230, 210, 180);
  ellipse(W * 0.75, H * 0.2, 34, 34);
  fill(10, 15, 40, 160);
  ellipse(W * 0.75 + 8, H * 0.2, 28, 28);
}
 
function drawHorizonGlow(h, m) {
  let t = h + m / 60;
  let glowAlpha = 0;
  let gr = 255, gg = 160, gb = 80;
  if (t >= 5 && t < 7) {
    glowAlpha = map(t, 5, 6.5, 0, 120);
  } else if (t >= 18 && t < 20) {
    glowAlpha = map(t, 18, 19.5, 0, 100);
    gr = 230; gg = 80; gb = 40;
  }
  if (glowAlpha > 0) {
    for (let i = 0; i < 5; i++) {
      let a = map(i, 0, 4, glowAlpha, 0);
      fill(gr, gg, gb, a);
      noStroke();
      rect(0, H * 0.55 + i * 18, W, 22);
    }
  }
}
 
function draw() {
  let now = new Date();
  let h  = now.getHours();
  let m  = now.getMinutes();
  let s  = now.getSeconds();
  let ms = now.getMilliseconds();
 
  let sky = skyColor(h, m);
  background(sky);
 
  drawStars(sky);
  drawMoon(h, m);
  drawHorizonGlow(h, m);
  drawSun(h, m);
 
  // Ground strip
  noStroke();
  fill(30, 60, 30, 40);
  rect(0, H * 0.82, W, H * 0.18);
 
  // Clock glow halo
  noStroke();
  fill(255, 255, 255, 18);
  ellipse(cx, cy, R * 2 + 50, R * 2 + 50);
 
  // Clock face
  fill(0, 0, 0, 100);
  stroke(255, 255, 255, 80);
  strokeWeight(1.5);
  ellipse(cx, cy, R * 2, R * 2);
 
  // 24 tick marks
  for (let i = 0; i < 24; i++) {
    let angle = map(i, 0, 24, -HALF_PI, HALF_PI * 3);
    let len = i % 6 === 0 ? 14 : 8;
    let x1 = cx + (R - 4) * cos(angle);
    let y1 = cy + (R - 4) * sin(angle);
    let x2 = cx + (R - 4 - len) * cos(angle);
    let y2 = cy + (R - 4 - len) * sin(angle);
    stroke(255, 255, 255, i % 6 === 0 ? 220 : 130);
    strokeWeight(i % 6 === 0 ? 2 : 1);
    line(x1, y1, x2, y2);
  }
 
  // Cardinal labels: 00, 06, 12, 18
  let labelMap = [[0, '00'], [6, '06'], [12, '12'], [18, '18']];
  textSize(11);
  textAlign(CENTER, CENTER);
  noStroke();
  for (let pair of labelMap) {
    let angle = map(pair[0], 0, 24, -HALF_PI, HALF_PI * 3);
    let tx = cx + (R - 30) * cos(angle);
    let ty = cy + (R - 30) * sin(angle);
    fill(255, 255, 255, 200);
    text(pair[1], tx, ty);
  }
 
  // Smooth hand based on full day progress
  let totalSeconds = h * 3600 + m * 60 + s + ms / 1000;
  let dayFraction  = totalSeconds / 86400;
  let handAngle    = map(dayFraction, 0, 1, -HALF_PI, HALF_PI * 3);
 
  // Hand line
  stroke(255, 255, 255, 160);
  strokeWeight(1);
  line(cx, cy, cx + R * cos(handAngle), cy + R * sin(handAngle));
 
  // Rotating dot
  let dotX = cx + R * cos(handAngle);
  let dotY = cy + R * sin(handAngle);
  noStroke();
  fill(255, 200, 100, 60);
  ellipse(dotX, dotY, 22, 22);
  fill(255, 220, 80);
  ellipse(dotX, dotY, 13, 13);
  fill(255, 255, 255, 180);
  ellipse(dotX - 2, dotY - 2, 5, 5);
 
  // Center dot
  fill(255, 255, 255, 220);
  ellipse(cx, cy, 8, 8);
 
  // Digital time
  let hStr = String(h).padStart(2, '0');
  let mStr = String(m).padStart(2, '0');
  let sStr = String(s).padStart(2, '0');
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(255, 255, 255, 230);
  noStroke();
  text(hStr + ':' + mStr + ':' + sStr, cx, cy + 10);
 
  // Time of day label
  let label = getTimeLabel(h);
  textSize(12);
  fill(255, 255, 255, 160);
  text(label.icon + '  ' + label.name, cx, cy + 40);
}