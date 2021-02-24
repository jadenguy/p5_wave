let wave;
let fftIndex = 0;
const sampleFreq = 96;
const cycles = 1;
const fft = new Array(Math.floor(sampleFreq * sampleFreq / 2));
const fftSpeedup = fft.length / 60;
//where x is the sample millisecond, so a sin (x) == 1 khz sine wave of magnitude 1
const func = x => 10 * Math.sin(x * 17.5) + 5 * Math.sin(x * 11) + 30 * Math.sin(x * 5) + 8 * Math.sin(x * 40) + 20 * Math.sin(x * 75);

function setup() {
  createCanvas(windowWidth, windowHeight - 4);
  background(220);
  stroke(0);
  fill(255);
  fft.fill(0, 0, fft.length);
  const period = TWO_PI / sampleFreq;
  const count = sampleFreq * cycles;
  wave = generateSamples(0, period, count, func);
  normalizeWave(wave);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 4);
}
function draw() {
  background(220);
  const div = Math.floor(width / 230);

  for (let i = 0; i < fftSpeedup; i++) {
    const freq = fftIndex / sampleFreq;
    const avg = drawCircle(wave, freq);
    const v = Math.abs(avg.mag());
    if (fftIndex > fft.length) {
      noLoop();
    }
    else {
      fft[fftIndex - 1] = v;
      fftIndex++;
    }
  }
  drawWave(wave, 0);
  drawWave(fft, 2);
  labelXAxis(0, cycles, "ms", 0, div);
  labelXAxis(0, fft.length / sampleFreq, "kHz", 2, div);
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
  stroke(100, 100, 100, 10)
  for (let i = 0; i < wave.length; i++) {
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
  const newWidth = width / (wave.length - 1) / 3.;
  for (let index = 1; index < wave.length; index++) {
    const start = createVector(newWidth * (index - 1), wave[index - 1] * -zoom);
    const end = createVector(newWidth * index, wave[index] * -zoom);
    line(start.x, start.y, end.x, end.y);
  }
  pop();
}
function labelXAxis(low, high, unit, third = 0, divisor = 10) {
  push();
  textAlign(RIGHT, BOTTOM);
  textFont('courier');
  fill(0);
  stroke(50);
  const xStart = width / 3 * third;
  const yStart = height - 2;
  line(xStart, height * .95, xStart + width / 3, height * .95);
  translate(xStart, yStart);
  const delta = high - low;
  const u = delta / divisor;

  for (let i = 0; i <= divisor; i++) {
    const place = i * width / 3 / divisor;
    stroke(50);
    line(place, 0, place, -height);
    noStroke();
    const dividerText = String(round_to_precision(low + i * u, u)).substring(0, 4) + " " + unit;
    text(dividerText, place, 0);
  }
  pop();
}