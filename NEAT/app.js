"use strict";

const GAME_WIDTH = 500;
const PANEL_WIDTH = 320;
const WIDTH = GAME_WIDTH + PANEL_WIDTH;
const HEIGHT = 800;
const BIRD_X = 100;
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const PIPE_VELOCITY = 5;
const BASE_HEIGHT = 30;
const BASE_VELOCITY = 5;
const SPAWN_EVERY = 72;
const SIMULATION_FPS = 60;

const COLORS = {
  sky: "#87ceeb",
  panel: "#1c2330",
  panelBox: "#273040",
  white: "#f0f3f8",
  muted: "#a0aaba",
  green: "#3fb950",
  red: "#dc4b4b",
  blue: "#4a90e2",
  yellow: "#ffdc41",
  hidden: "#aa6edc",
  base: "#964b00"
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const settingsScreen = document.getElementById("settings-screen");
const touchControls = document.getElementById("touch-controls");
const pauseButton = document.getElementById("pause-button");
const networkButton = document.getElementById("network-button");
const settingsButton = document.getElementById("settings-button");
const speedSlider = document.getElementById("speed-slider");
const speedOutput = document.getElementById("speed-output");
const networkDialog = document.getElementById("network-dialog");
const networkCanvas = document.getElementById("network-canvas");
const networkContext = networkCanvas.getContext("2d");
const networkSummary = document.getElementById("network-summary");

const clamp = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, value));
const randomBetween = (minimum, maximum) =>
  minimum + Math.random() * (maximum - minimum);
const randomInt = (minimum, maximum) =>
  Math.floor(randomBetween(minimum, maximum + 1));
const relu = value => Math.max(0, value);
const sigmoid = value => {
  if (value >= 0) return 1 / (1 + Math.exp(-value));
  const exponential = Math.exp(value);
  return exponential / (1 + exponential);
};

let nextNodeId = 1;

class Node {
  constructor(type = 1) {
    this.id = nextNodeId++;
    this.type = type;
    this.value = 1;
    this.depth = type === 0 ? 0 : -1;
  }
}

class Nerve {
  constructor(start, end, weight = randomBetween(-1, 1)) {
    this.start = start;
    this.end = end;
    this.weight = weight;
  }

  mutate() {
    if (Math.random() <= 0.3) {
      this.weight = randomBetween(-1, 1);
    } else {
      this.weight += randomBetween(-0.2, 0.2);
    }
  }
}

class Network {
  constructor(inputSize = 4, outputSize = 1) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.nodes = [];
    this.nerves = [];
    this.score = 0;
    this.grace = 0;
    this.alive = true;
    this.orderedNerves = [];

    for (let index = 0; index < inputSize; index++) {
      this.nodes.push(new Node(0));
    }
    for (let index = 0; index < outputSize; index++) {
      this.nodes.push(new Node(2));
    }

    const inputs = this.nodes.slice(0, inputSize);
    const outputs = this.nodes.slice(inputSize);
    for (const input of inputs) {
      for (const output of outputs) {
        this.nerves.push(new Nerve(input, output));
      }
    }
    this.rebuildTopology();
  }

  clone() {
    const copy = Object.create(Network.prototype);
    copy.inputSize = this.inputSize;
    copy.outputSize = this.outputSize;
    copy.nodes = this.nodes.map(node => {
      const clonedNode = new Node(node.type);
      clonedNode.value = node.value;
      clonedNode.depth = node.depth;
      return clonedNode;
    });
    const nodeMap = new Map(this.nodes.map((node, index) => [node, copy.nodes[index]]));
    copy.nerves = this.nerves.map(
      nerve => new Nerve(nodeMap.get(nerve.start), nodeMap.get(nerve.end), nerve.weight)
    );
    copy.score = this.score;
    copy.grace = this.grace;
    copy.alive = this.alive;
    copy.orderedNerves = [];
    copy.rebuildTopology();
    return copy;
  }

  rebuildTopology() {
    for (const node of this.nodes) {
      node.depth = node.type === 0 ? 0 : -1;
    }

    for (let pass = 0; pass < this.nodes.length; pass++) {
      let changed = false;
      for (const nerve of this.nerves) {
        if (nerve.start.depth < 0 || nerve.end.type === 0) continue;
        const depth = nerve.start.depth + 1;
        if (depth > nerve.end.depth) {
          nerve.end.depth = depth;
          changed = true;
        }
      }
      if (!changed) break;
    }

    const reachableDepths = this.nodes
      .filter(node => node.depth >= 0)
      .map(node => node.depth);
    const finalDepth = Math.max(1, ...reachableDepths);
    for (const node of this.nodes) {
      if (node.type === 2) node.depth = finalDepth;
    }

    this.orderedNerves = [...this.nerves].sort(
      (first, second) => first.start.depth - second.start.depth
    );
  }

  process(inputs) {
    let inputIndex = 0;
    for (const node of this.nodes) {
      if (node.type === 0) {
        node.value = inputs[inputIndex++];
      } else {
        node.value = 0;
      }
    }

    let processLayer = 0;
    for (const nerve of this.orderedNerves) {
      while (processLayer < nerve.start.depth) {
        processLayer++;
        for (const node of this.nodes) {
          if (node.depth === processLayer) node.value = relu(node.value);
        }
      }
      nerve.end.value += nerve.start.value * nerve.weight;
    }

    return this.nodes.filter(node => node.type === 2).map(node => node.value);
  }

  mutate() {
    const roll = randomInt(1, 100);

    if (roll <= 75) {
      if (this.nerves.length) {
        const count = Math.ceil(this.nerves.length * 0.1);
        for (let index = 0; index < count; index++) {
          this.nerves[randomInt(0, this.nerves.length - 1)].mutate();
        }
      }
      return 0;
    }

    if (roll <= 85) {
      if (this.nerves.length) {
        const oldNerve = this.nerves[randomInt(0, this.nerves.length - 1)];
        const newNode = new Node(1);
        this.nodes.push(newNode);
        this.nerves = this.nerves.filter(nerve => nerve !== oldNerve);
        this.nerves.push(new Nerve(oldNerve.start, newNode, 1));
        this.nerves.push(new Nerve(newNode, oldNerve.end, oldNerve.weight));
        this.rebuildTopology();
      }
      return 6;
    }

    if (roll <= 88) {
      const hiddenNodes = this.nodes.filter(node => node.type === 1);
      if (hiddenNodes.length) {
        const removed = hiddenNodes[randomInt(0, hiddenNodes.length - 1)];
        this.nodes = this.nodes.filter(node => node !== removed);
        this.nerves = this.nerves.filter(
          nerve => nerve.start !== removed && nerve.end !== removed
        );
        this.rebuildTopology();
      }
      return 6;
    }

    if (roll <= 96) {
      const missing = [];
      for (const start of this.nodes) {
        for (const end of this.nodes) {
          const exists = this.nerves.some(
            nerve => nerve.start === start && nerve.end === end
          );
          if (
            start.depth >= 0 &&
            end.type !== 0 &&
            start.depth < end.depth &&
            !exists
          ) {
            missing.push([start, end]);
          }
        }
      }
      if (missing.length) {
        const [start, end] = missing[randomInt(0, missing.length - 1)];
        this.nerves.push(new Nerve(start, end));
        this.rebuildTopology();
      }
      return 3;
    }

    if (this.nerves.length) {
      this.nerves.splice(randomInt(0, this.nerves.length - 1), 1);
      this.rebuildTopology();
    }
    return 3;
  }
}

class Population {
  constructor(count) {
    this.inputSize = 4;
    this.outputSize = 1;
    this.agents = Array.from({ length: count }, () => new Network(4, 1));
  }

  rank() {
    this.agents.sort((first, second) => second.score - first.score);
  }

  newGeneration(survivalRate, mutationRate) {
    this.rank();
    const populationSize = this.agents.length;
    const requestedSurvivors = Math.max(1, Math.round(populationSize * survivalRate));
    const survivors = this.agents.slice(0, requestedSurvivors);

    for (const agent of this.agents) {
      if (agent.grace > 0 && !survivors.includes(agent)) survivors.push(agent);
      agent.grace = Math.max(0, agent.grace - 1);
    }

    survivors.splice(populationSize);
    const children = [];
    const childrenNeeded = populationSize - survivors.length;
    for (let index = 0; index < childrenNeeded; index++) {
      const child = survivors[index % survivors.length].clone();
      if (Math.random() <= mutationRate) child.grace += child.mutate();
      child.score = 0;
      children.push(child);
    }

    this.agents = [...children, ...survivors];
    const maximumNodes = 2 + this.inputSize + this.outputSize;
    this.agents = this.agents.map(agent =>
      agent.nodes.length > maximumNodes ? new Network(4, 1) : agent
    );
    this.rank();
  }
}

class Bird {
  constructor(network) {
    this.x = BIRD_X;
    this.y = HEIGHT / 2;
    this.velocity = 0;
    this.tickCount = 0;
    this.network = network;
    network.alive = true;
  }

  jump() {
    this.velocity = -10;
    this.tickCount = 0;
  }

  update() {
    this.tickCount++;
    let displacement = this.velocity + 1.5 * this.tickCount;
    displacement = Math.min(displacement, 16);
    if (displacement < 0) displacement -= 2;
    this.y += displacement;
  }
}

class Pipe {
  constructor(x) {
    this.x = x;
    this.width = randomInt(80, 120);
    this.gap = randomInt(110, 220);
    this.top = randomInt(40, HEIGHT - this.gap - BASE_HEIGHT - 40);
    this.bottom = this.top + this.gap;
    this.passed = false;
  }

  collides(bird) {
    const horizontal =
      bird.x < this.x + this.width && bird.x + BIRD_WIDTH > this.x;
    const vertical = bird.y < this.top || bird.y + BIRD_HEIGHT > this.bottom;
    return horizontal && vertical;
  }
}

class TrainingLab {
  constructor() {
    this.running = false;
    this.paused = false;
    this.settings = null;
    this.population = null;
    this.birds = [];
    this.pipes = [];
    this.generation = 0;
    this.frame = 0;
    this.previousBest = 0;
    this.previousAverage = 0;
    this.baseX1 = 0;
    this.baseX2 = GAME_WIDTH;
    this.lastTime = 0;
    this.accumulator = 0;
    this.speedMultiplier = Number(speedSlider.value);
    this.logs = this.loadLogs();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  loadLogs() {
    try {
      return JSON.parse(localStorage.getItem("neat-training-log") || "[]");
    } catch {
      return [];
    }
  }

  start(settings) {
    this.settings = settings;
    this.population = new Population(settings.populationSize);
    this.generation = 0;
    this.previousBest = 0;
    this.previousAverage = 0;
    this.running = true;
    this.paused = false;
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.startGeneration();
    settingsScreen.hidden = true;
    touchControls.hidden = false;
    pauseButton.textContent = "Pause";
  }

  startGeneration() {
    this.generation++;
    this.frame = 0;
    this.baseX1 = 0;
    this.baseX2 = GAME_WIDTH;
    this.pipes = [new Pipe(GAME_WIDTH)];
    this.birds = this.population.agents.map(network => {
      network.score = 0;
      return new Bird(network);
    });
  }

  returnToSettings() {
    this.running = false;
    this.paused = false;
    settingsScreen.hidden = false;
    touchControls.hidden = true;
    if (networkDialog.open) networkDialog.close();
    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    pauseButton.textContent = this.paused ? "Resume" : "Pause";
    this.draw();
  }

  champion() {
    return this.population
      ? this.population.agents.reduce(
          (best, network) => (network.score > best.score ? network : best),
          this.population.agents[0]
        )
      : null;
  }

  step() {
    if (!this.running || this.paused) return;
    this.frame++;

    if (this.frame >= SIMULATION_FPS * this.settings.maxSeconds) {
      this.finishGeneration();
      return;
    }

    if (this.frame % SPAWN_EVERY === 0) {
      this.pipes.push(new Pipe(GAME_WIDTH));
    }

    for (const bird of this.birds) {
      if (!bird.network.alive) continue;
      bird.network.score += 0.1;
      bird.update();

      const nextPipe = this.pipes.find(
        pipe => pipe.x + pipe.width > bird.x
      );
      if (nextPipe) {
        const inputs = [
          bird.y / HEIGHT,
          (bird.y - nextPipe.top) / HEIGHT,
          (nextPipe.bottom - bird.y) / HEIGHT,
          (nextPipe.x - bird.x) / GAME_WIDTH
        ];
        const output = bird.network.process(inputs)[0];
        if (sigmoid(output) > 0.5) bird.jump();
      }

      if (
        bird.y <= 0 ||
        bird.y + BIRD_HEIGHT >= HEIGHT - BASE_HEIGHT
      ) {
        bird.network.alive = false;
      }
    }

    for (const pipe of this.pipes) {
      pipe.x -= PIPE_VELOCITY;
      for (const bird of this.birds) {
        if (bird.network.alive && pipe.collides(bird)) {
          bird.network.alive = false;
        }
      }

      if (!pipe.passed && pipe.x + pipe.width < BIRD_X) {
        pipe.passed = true;
        for (const bird of this.birds) {
          if (bird.network.alive) bird.network.score += 100;
        }
      }
    }
    this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width >= 0);

    this.baseX1 -= BASE_VELOCITY;
    this.baseX2 -= BASE_VELOCITY;
    if (this.baseX1 + GAME_WIDTH < 0) this.baseX1 = this.baseX2 + GAME_WIDTH;
    if (this.baseX2 + GAME_WIDTH < 0) this.baseX2 = this.baseX1 + GAME_WIDTH;

    if (!this.population.agents.some(network => network.alive)) {
      this.finishGeneration();
    }
  }

  finishGeneration() {
    for (const network of this.population.agents) {
      network.alive = false;
      network.score -= 0.02 * (network.nodes.length + network.nerves.length);
    }

    this.population.rank();
    const scores = this.population.agents.map(network => network.score);
    const champion = this.population.agents[0];
    this.previousBest = Math.max(...scores);
    this.previousAverage =
      scores.reduce((total, score) => total + score, 0) / scores.length;

    this.logs.push({
      generation: this.generation,
      bestScore: this.previousBest,
      averageScore: this.previousAverage,
      championNodes: champion.nodes.length,
      championEdges: champion.nerves.length
    });
    if (this.logs.length > 1000) this.logs.splice(0, this.logs.length - 1000);
    try {
      localStorage.setItem("neat-training-log", JSON.stringify(this.logs));
    } catch {
      // The simulation continues if storage is unavailable.
    }

    this.population.newGeneration(
      this.settings.survivalRate,
      this.settings.mutationRate
    );
    this.startGeneration();
  }

  loop(time) {
    if (this.running) {
      const elapsed = Math.min(100, time - this.lastTime);
      this.lastTime = time;
      if (!this.paused) {
        this.accumulator += elapsed;
        const stepDuration = 1000 / (SIMULATION_FPS * this.speedMultiplier);
        let steps = 0;
        while (this.accumulator >= stepDuration && steps < 8) {
          this.step();
          this.accumulator -= stepDuration;
          steps++;
        }
        if (steps === 8) this.accumulator = 0;
      }
      this.draw();
    }
    requestAnimationFrame(this.loop);
  }

  draw() {
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, GAME_WIDTH, HEIGHT);

    for (const pipe of this.pipes) {
      ctx.fillStyle = COLORS.green;
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
      ctx.fillRect(pipe.x, pipe.bottom, pipe.width, HEIGHT - pipe.bottom);
    }

    ctx.fillStyle = COLORS.base;
    ctx.fillRect(this.baseX1, HEIGHT - BASE_HEIGHT, GAME_WIDTH, BASE_HEIGHT);
    ctx.fillRect(this.baseX2, HEIGHT - BASE_HEIGHT, GAME_WIDTH, BASE_HEIGHT);

    ctx.fillStyle = COLORS.yellow;
    for (const bird of this.birds) {
      if (!bird.network.alive) continue;
      roundRect(ctx, bird.x, bird.y, BIRD_WIDTH, BIRD_HEIGHT, 4);
      ctx.fill();
    }

    this.drawPanel();
  }

  drawPanel() {
    const champion = this.champion();
    if (!champion) return;

    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(GAME_WIDTH, 0, PANEL_WIDTH, HEIGHT);
    drawText(ctx, "TRAINING STATS", 520, 22, 21, COLORS.white, true);

    const alive = this.population.agents.filter(network => network.alive).length;
    const lines = [
      `Generation: ${this.generation}`,
      `Alive: ${alive}/${this.population.agents.length}`,
      `Current best: ${champion.score.toFixed(1)}`,
      `Last best: ${this.previousBest.toFixed(1)}`,
      `Last average: ${this.previousAverage.toFixed(1)}`
    ];
    lines.forEach((line, index) =>
      drawText(ctx, line, 520, 66 + index * 27, 17, COLORS.white)
    );

    drawText(ctx, "CHAMPION NETWORK", 520, 285, 21, COLORS.white, true);
    ctx.fillStyle = COLORS.panelBox;
    roundRect(ctx, 515, 325, PANEL_WIDTH - 30, 330, 8);
    ctx.fill();
    drawNetwork(ctx, champion, { x: 515, y: 325, width: 290, height: 330 });

    [
      "S: open expanded network view",
      "P: pause",
      "Esc: return to settings"
    ].forEach((line, index) =>
      drawText(ctx, line, 520, 690 + index * 24, 13, COLORS.muted)
    );

  }
}

function drawText(context, text, x, y, size, color, bold = false) {
  context.fillStyle = color;
  context.font = `${bold ? "700 " : ""}${size}px Consolas, monospace`;
  context.textBaseline = "top";
  context.fillText(text, x, y);
}

function roundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
}

function drawNetwork(context, network, rect, expanded = false) {
  const visibleNodes = network.nodes.filter(node => node.depth >= 0);
  if (!visibleNodes.length) return;

  const layers = new Map();
  for (const node of visibleNodes) {
    if (!layers.has(node.depth)) layers.set(node.depth, []);
    layers.get(node.depth).push(node);
  }

  const maxDepth = Math.max(...layers.keys());
  const positions = new Map();
  for (const [depth, nodes] of layers) {
    const padding = expanded ? 80 : 25;
    const x = maxDepth === 0
      ? rect.x + rect.width / 2
      : rect.x + padding + (depth / maxDepth) * (rect.width - padding * 2);
    const spacing = rect.height / (nodes.length + 1);
    nodes.forEach((node, index) => {
      positions.set(node, { x, y: rect.y + spacing * (index + 1) });
    });
  }

  for (const nerve of network.nerves) {
    const start = positions.get(nerve.start);
    const end = positions.get(nerve.end);
    if (!start || !end) continue;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = nerve.weight >= 0 ? COLORS.green : COLORS.red;
    context.lineWidth = clamp(Math.floor(Math.abs(nerve.weight) * 2) + 1, 1, expanded ? 7 : 4);
    context.globalAlpha = 0.88;
    context.stroke();
    context.globalAlpha = 1;

    if (expanded) {
      const middleX = start.x + (end.x - start.x) * 0.5;
      const middleY = start.y + (end.y - start.y) * 0.5;
      drawText(context, nerve.weight.toFixed(2), middleX + 5, middleY - 8, 12, COLORS.muted);
    }
  }

  for (const [node, position] of positions) {
    let color = COLORS.hidden;
    let label = "H";
    if (node.type === 0) {
      color = COLORS.blue;
      label = "I";
    } else if (node.type === 2) {
      color = COLORS.yellow;
      label = "O";
    }
    const radius = expanded ? 18 : 11;
    context.beginPath();
    context.arc(position.x, position.y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = COLORS.white;
    context.lineWidth = expanded ? 2 : 1;
    context.stroke();
    context.fillStyle = COLORS.panel;
    context.font = `${expanded ? 14 : 11}px Consolas, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, position.x, position.y + 1);
    context.textAlign = "start";
    context.textBaseline = "top";
  }
}

function readNumber(id, minimum, maximum, integer = false) {
  const input = document.getElementById(id);
  let value = Number(input.value);
  if (!Number.isFinite(value)) value = minimum;
  value = clamp(value, minimum, maximum);
  if (integer) value = Math.round(value);
  input.value = integer ? String(value) : String(value);
  return value;
}

function readSettings() {
  return {
    populationSize: readNumber("population-size", 10, 30, true),
    survivalRate: readNumber("survival-rate", 0.05, 0.95),
    mutationRate: readNumber("mutation-rate", 0, 1),
    maxSeconds: readNumber("max-seconds", 10, 300, true)
  };
}

function openNetworkView() {
  const champion = lab.champion();
  if (!champion) return;
  networkContext.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
  networkContext.fillStyle = "#171d28";
  networkContext.fillRect(0, 0, networkCanvas.width, networkCanvas.height);
  drawNetwork(
    networkContext,
    champion,
    { x: 30, y: 30, width: 840, height: 500 },
    true
  );
  networkSummary.textContent =
    `Generation ${lab.generation} · score ${champion.score.toFixed(1)} · ` +
    `${champion.nodes.length} nodes · ${champion.nerves.length} connections. ` +
    "Green connections are positive; red connections are negative.";
  if (!networkDialog.open) networkDialog.showModal();
}

const lab = new TrainingLab();

settingsScreen.addEventListener("submit", event => {
  event.preventDefault();
  lab.start(readSettings());
});

document.addEventListener("keydown", event => {
  if (event.key === "Enter" && !settingsScreen.hidden) {
    event.preventDefault();
    lab.start(readSettings());
  } else if (event.key.toLowerCase() === "p" && lab.running) {
    lab.togglePause();
  } else if (event.key.toLowerCase() === "s" && lab.running) {
    openNetworkView();
  } else if (event.key === "Escape" && lab.running && !networkDialog.open) {
    lab.returnToSettings();
  }
});

pauseButton.addEventListener("click", () => lab.togglePause());
networkButton.addEventListener("click", openNetworkView);
settingsButton.addEventListener("click", () => lab.returnToSettings());
speedSlider.addEventListener("input", () => {
  lab.speedMultiplier = Number(speedSlider.value);
  speedOutput.value = `${lab.speedMultiplier.toFixed(1)}×`;
});
document.getElementById("close-network").addEventListener("click", () => {
  networkDialog.close();
});

document.getElementById("download-log").addEventListener("click", () => {
  const header = [
    "generation",
    "best_score",
    "average_score",
    "champion_nodes",
    "champion_edges"
  ];
  const rows = lab.logs.map(row => [
    row.generation,
    row.bestScore,
    row.averageScore,
    row.championNodes,
    row.championEdges
  ]);
  const csv = [header, ...rows].map(row => row.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "training_log.csv";
  link.click();
  URL.revokeObjectURL(url);
});

ctx.fillStyle = COLORS.panel;
ctx.fillRect(0, 0, WIDTH, HEIGHT);
