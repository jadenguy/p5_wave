let wave;
const sampleFreq = 100;
const cycles = 10;
const fftGranularity = .1;
const fft = new Array(sampleFreq / fftGranularity / 2);
const func = x => Math.sin(x * 17.5) + Math.sin(x * 11) + Math.sin(x * 5);

function setup() {
  createCanvas(windowWidth, windowHeight - 4);
  background(220);
  stroke(0);
  fill(255);
  fft.fill(0, 0, fft.length);
  period = TWO_PI / sampleFreq;
  count = sampleFreq * cycles;
  wave = generateSamples(0, period, count, func);
  normalizeWave(wave);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 4);
}
function draw() {
  background(220);
  const freq = Math.min(frameCount, fft.length) * fftGranularity;
  const avg = drawCircle(wave, freq);
  const v = Math.abs(avg.mag());
  drawWave(wave, 0);
  drawWave(fft, 2);
  const div = Math.floor(width / 230);
  if (frameCount >= fft.length) {
    noLoop();
  }
  else {
    fft[frameCount - 1] = v;
  }
  drawAxis(0, cycles, "ms", 0, div);
  drawAxis(0, fft.length * fftGranularity, "kHz", 2, div);
}
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
function average(arr) {
  return arr.reduce((a,
    b) => a + b, 0) / arr.length
}
function round_to_precision(x, precision = 1) {
  var y = +x + (precision / 2);
  return y - (y % (+precision));
}
function generateSamples(start, period, count, func) {
  var ret = [];
  for (let x = start; x <= count * period; x += period) {
    ret.push(func(x));
  }
  return ret;
}
function normalizeWave(wave) {
  const avg = average(wave);
  for (let index = 0; index < wave.length; index++) {
    wave[index] -= avg;
  }
  const neg = -Math.min(...wave);
  const pos = Math.max(...wave);
  const largest = Math.max(pos, neg);
  for (let index = 0; index < wave.length; index++) {
    wave[index] /= largest;
  }
  return wave;
}
function drawCircle(wave, rate) {
  push();
  translate(width / 2, height / 2);
  let x = [];
  let y = [];
  let zoom = Math.min(width / 7, height / 2.2);
  fill(color(0, 0, 0, 0));
  ellipseMode(RADIUS);
  circle(0, 0, zoom * 1.1);
  // colorMode(HSB, wave.length, 1, 1, 1)
  for (let i = 0; i < wave.length; i++) {
    // stroke(color(i, 1, 1, .5))
    stroke(100, 100, 100, 100 * 255 / wave.length)
    const end = createVector(wave[i]);
    end.rotate(rate * i * TWO_PI * cycles / wave.length);
    circle(end.x * zoom, end.y * zoom, zoom / 80);
    x.push(end.x);
    y.push(end.y);
  }
  strokeWeight(2);
  fill(255);
  const xAvg = average(x);
  const yAvg = average(y)
  // colorMode(RGB)
  stroke(20)
  circle(xAvg * zoom, yAvg * zoom, zoom / 30);
  pop();
  return createVector(xAvg / zoom, yAvg / zoom);
}
function drawWave(wave, third = 0) {
  push();
  const min = Math.min(...wave);
  const max = Math.max(...wave);
  const zoom = .9 * height / (max - min);
  const xStart = width / 3 * third;
  const yStart = height * .95 + min * zoom;
  translate(xStart, yStart);
  const newWidth = width / wave.length / 3;
  for (let index = 1; index < wave.length; index++) {
    const start = createVector(newWidth * (index - 1), wave[index - 1] * -zoom);
    const end = createVector(newWidth * index, wave[index] * -zoom);
    line(start.x, start.y, end.x, end.y);
  }
  pop();
}
function drawAxis(low, high, unit, third = 0, divisor = 10) {
  push();
  textAlign(RIGHT, BOTTOM);
  textFont('courier');
  fill(0);
  stroke(50);
  const xStart = width / 3 * third;
  const yStart = height - 2;
  translate(xStart, yStart);
  const delta = high - low;
  const u = delta / divisor;
  for (let i = 0; i <= divisor; i++) {
    const place = i * width / 3 / divisor;
    // print(place * index, low + index * quarter);
    stroke(50);
    line(place, 0, place, -height);
    noStroke();
    const dividerText = String(round_to_precision(low + i * u, u)).substring(0, 4) + " " + unit;
    text(dividerText, place, 0);
  }
  pop();
}
