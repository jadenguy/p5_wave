let samplesPerCycle = 100;
let cycleInTwoPi = 10;
let wave;
let period;
let count;
let freqGranularity = .01;
let fft = new Array(samplesPerCycle * 2);


function setup() {
  createCanvas(windowWidth, windowHeight - 4);
  background(220);
  stroke(0);
  fill(255);
  fft.fill(0, 0, fft.length);
  period = TWO_PI / samplesPerCycle;
  count = samplesPerCycle * cycleInTwoPi;
  let func = x => Math.sin(x / 10) + 7
  wave = generateSamples(0, period, count, func);
  wave = normalizeWave(wave);


}
function normalizeWave(wave) {
  const avg = average(wave);
  for (let index = 0; index < wave.length; index++) {
    wave[index] -= avg;
  }
  return wave;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 4);
}
function draw() {
  background(220);
  const freq = (frameCount * freqGranularity);
  const avg = drawCircle(wave, freq);
  fft[frameCount - 1] = avg.mag();
  if (avg.mag() > .2) {
    print(Math.round(freq / TWO_PI, freqGranularity));
  }
  drawWave(wave);
  drawWave(fft, 2);
  if (freq >= samplesPerCycle * 2 / freqGranularity) {
    noLoop();
  }
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
  let zoom = Math.min(width / 7, height / 2.2);
  const min = Math.min(...wave);
  const max = Math.max(...wave);
  // zoom /= (max - min);
  for (let index = 1; index < wave.length; index++) {
    const start = createVector(wave[index - 1] * zoom);
    start.rotate(rate * (index - 1));
    if (x.length == 0) {
      x.push(start.x);
      y.push(start.y);
    }
    const end = createVector(wave[index] * zoom);
    end.rotate(rate * index);
    line(start.x, start.y, end.x, end.y);
    x.push(end.x);
    y.push(end.y);

  }
  ellipseMode(RADIUS);
  strokeWeight(2);
  fill(255);
  const xAvg = average(x);
  const yAvg = average(y)
  circle(xAvg, yAvg, 10);
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
function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

