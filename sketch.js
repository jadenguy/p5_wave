let wave;
let samplesPerCycle = 100;
let cycleInTwoPi = 1;
let freqGranularity = .01;
let fft = new Array(samplesPerCycle);


function setup() {
  textAlign(CENTER, TOP);
  createCanvas(windowWidth, windowHeight - 4);
  background(220);
  stroke(0);
  fill(255);
  fft.fill(0, 0, fft.length);
  period = TWO_PI / samplesPerCycle;
  count = samplesPerCycle * cycleInTwoPi;
  let func = x => Math.sin(x * 7) + 2 * Math.sin(x * 11)
  // let func = x => Math.sin(x)
  wave = generateSamples(0, period, count, func);
  wave = normalizeWave(wave);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 4);
}
function draw() {
  background(220);
  const freq = frameCount * freqGranularity;
  const avg = drawCircle(wave, freq);
  const v = Math.abs(avg.mag());
  fft[frameCount - 1] = v;
  if (v > .2) {
    print(frameCount, freq, v);
  }
  drawWave(wave, 0);
  drawWave(fft, 2);
  drawAxis(0, cycleInTwoPi, "PI", 0);
  drawAxis(0, fft.length * freqGranularity, "Cycle", 2);
  if (freq >= 20) {
    noLoop();
    print(frameCount, freq, v);
  }
}
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
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
  circle(0, 0, zoom);
  for (let index = 0; index < wave.length; index++) {
    // const start = createVector(wave[index - 1] * zoom);
    // start.rotate(rate * (index - 1));
    // if (x.length == 0) {
    // x.push(start.x);
    // y.push(start.y);
    // }
    const end = createVector(wave[index]);
    end.rotate(rate * index * TWO_PI / wave.length);
    point(end.x * zoom, end.y * zoom);
    x.push(end.x);
    y.push(end.y);

  }
  strokeWeight(2);
  fill(255);
  const xAvg = average(x);
  const yAvg = average(y)
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
  fill(0);
  stroke(50);
  const xStart = width / 3 * third;
  const yStart = height - 2;
  translate(xStart, yStart);
  // line(0, -10, width / 3, -10);
  const delta = high - low;
  const u = delta / divisor;
  for (let i = 0; i <= divisor; i++) {
    const place = i * width / 3 / divisor;
    // print(place * index, low + index * quarter);
    stroke(50);
    line(place, 0, place, -height);
    noStroke();
    const dividerText = String(round_to_precision(low + i * u, u ));

    text(dividerText.substring(0, 3) + " " + unit, place, 0);
  }
  pop();
}
function round_to_precision(x, precision) {
  var y = +x + (precision === undefined ? 0.5 : precision / 2);
  return y - (y % (precision === undefined ? 1 : +precision));
}