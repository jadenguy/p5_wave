let samplesPerCycle = 35;
let wave;
let period;
let count;
let fft = [];
let place = .1;
let zoom = 300;
function setup() {
  createCanvas(windowWidth, windowHeight - 4);
  background(220);
  stroke(0);
  fill(255);
  zoom = width / 7;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 4);
  zoom = width / 7;
}
function draw() {
  background(220);
  period = TWO_PI / samplesPerCycle;
  count = samplesPerCycle * 10;
  wave = generateSamples(0, period, count, Math.sin);
  place = TWO_PI * (frameCount / 120);
  const rotated = drawCircle(wave, place);
  fft.push(rotated.mag() / zoom);
  drawWave(wave);
  drawWave(fft, 2);
  // if (frameCount % 1000 == 0) { noLoop(); }
}
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
function generateSamples(start, period, count, func) {
  var ret = [];
  for (let x = start; x < count * period; x += period) {
    ret.push(func(x));
  }
  return ret;
}
function drawCircle(wave, rate) {
  push();
  translate(width / 2, height / 2);
  let x = [];
  let y = [];
  for (let index = 1; index < wave.length; index++) {
    const start = createVector(wave[index - 1] * zoom);
    start.rotate(rate * (index - 1));
    if (x.length == 0) {
      x.push(start.x);
      y.push(start.y);
    }
    const end = createVector(wave[index] * zoom);
    end.rotate(rate * index);
    x.push(end.x);
    y.push(end.y);
    line(start.x, start.y, end.x, end.y);
  }


  ellipseMode(RADIUS);
  strokeWeight(2);
  fill(255);
  const xAvg = average(x);
  const yAvg = average(y)
  circle(xAvg, yAvg, 10);
  pop();
  return createVector(xAvg, yAvg);
}
function drawWave(wave, third = 0) {
  push();
  translate(width / 3 * third, height / 2);
  newWidth = width / wave.length / 3;
  for (let index = 1; index < wave.length; index++) {
    const start = createVector(newWidth * (index - 1), wave[index - 1] * -zoom);
    const end = createVector(newWidth * index, wave[index] * -zoom);
    line(start.x, start.y, end.x, end.y);
  }
  pop();
}
function average(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length }
