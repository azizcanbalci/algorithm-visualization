import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Droplets } from "lucide-react";

const AntColonySimulation = () => {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [antCount, setAntCount] = useState(50);
  const [obstacleCount, setObstacleCount] = useState(5);
  const [evaporationRate, setEvaporationRate] = useState(0.02);
  const [iteration, setIteration] = useState(0);
  const [bestPathLength, setBestPathLength] = useState(Infinity);
  const [shortestPathFound, setShortestPathFound] = useState(false);
  const [speed, setSpeed] = useState(50);

  const gridSize = 40;
  const cols = 20;
  const rows = 15;

  const simulationRef = useRef({
    ants: [],
    pheromones: [],
    obstacles: [],
    start: { x: 1, y: 7 },
    target: { x: 18, y: 7 },
    bestPath: [],
  });

  // Grid hücresi sınıfı
  class Cell {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.pheromone = 0;
      this.isObstacle = false;
    }
  }

  // Karınca sınıfı
  class Ant {
    constructor(start) {
      this.x = start.x;
      this.y = start.y;
      this.path = [{ x: start.x, y: start.y }];
      this.visited = new Set();
      this.visited.add(`${start.x},${start.y}`);
      this.completed = false;
      this.stuck = false;
      this.pathLength = 0;
    }

    getNeighbors(grid) {
      const neighbors = [];
      const directions = [
        { dx: 0, dy: -1 }, // yukarı
        { dx: 1, dy: 0 }, // sağ
        { dx: 0, dy: 1 }, // aşağı
        { dx: -1, dy: 0 }, // sol
      ];

      for (let dir of directions) {
        const nx = this.x + dir.dx;
        const ny = this.y + dir.dy;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          const cell = grid[ny][nx];
          if (!cell.isObstacle && !this.visited.has(`${nx},${ny}`)) {
            neighbors.push({ x: nx, y: ny, cell });
          }
        }
      }

      return neighbors;
    }

    selectNext(neighbors, target, alpha = 1, beta = 2) {
      if (neighbors.length === 0) {
        this.stuck = true;
        return null;
      }

      const probabilities = [];
      let totalProb = 0;

      for (let neighbor of neighbors) {
        const pheromone = neighbor.cell.pheromone + 0.1;
        const distance =
          Math.abs(neighbor.x - target.x) + Math.abs(neighbor.y - target.y);
        const heuristic = 1 / (distance + 1);

        const prob = Math.pow(pheromone, alpha) * Math.pow(heuristic, beta);
        probabilities.push(prob);
        totalProb += prob;
      }

      let random = Math.random() * totalProb;
      for (let i = 0; i < neighbors.length; i++) {
        random -= probabilities[i];
        if (random <= 0) {
          return neighbors[i];
        }
      }

      return neighbors[neighbors.length - 1];
    }

    move(grid, target) {
      if (this.completed || this.stuck) return;

      if (this.x === target.x && this.y === target.y) {
        this.completed = true;
        this.pathLength = this.path.length;
        return;
      }

      const neighbors = this.getNeighbors(grid);
      const next = this.selectNext(neighbors, target);

      if (next) {
        this.x = next.x;
        this.y = next.y;
        this.path.push({ x: next.x, y: next.y });
        this.visited.add(`${next.x},${next.y}`);
      }
    }

    depositPheromone(grid, amount = 1) {
      if (this.completed) {
        const quality = 100 / this.pathLength;
        for (let pos of this.path) {
          if (grid[pos.y] && grid[pos.y][pos.x]) {
            grid[pos.y][pos.x].pheromone += quality;
          }
        }
      }
    }
  }

  // Grid oluştur
  const createGrid = () => {
    const grid = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(new Cell(x, y));
      }
      grid.push(row);
    }
    return grid;
  };

  // Engeller oluştur
  const createObstacles = (grid, count) => {
    const { start, target } = simulationRef.current;

    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * (cols - 4)) + 2;
      const y = Math.floor(Math.random() * (rows - 4)) + 2;
      const width = Math.floor(Math.random() * 3) + 2;
      const height = Math.floor(Math.random() * 3) + 2;

      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < cols && ny < rows) {
            if (
              !(
                (nx === start.x && ny === start.y) ||
                (nx === target.x && ny === target.y)
              )
            ) {
              grid[ny][nx].isObstacle = true;
            }
          }
        }
      }
    }
  };

  // Karınca oluştur
  const createAnts = (count) => {
    const { start } = simulationRef.current;
    const ants = [];
    for (let i = 0; i < count; i++) {
      ants.push(new Ant(start));
    }
    return ants;
  };

  // Feromon buharlaşması
  const evaporatePheromones = (grid) => {
    for (let row of grid) {
      for (let cell of row) {
        cell.pheromone *= 1 - evaporationRate;
        if (cell.pheromone < 0.01) cell.pheromone = 0;
      }
    }
  };

  // Simülasyonu başlat
  const initSimulation = () => {
    const grid = createGrid();
    createObstacles(grid, obstacleCount);
    simulationRef.current.pheromones = grid;
    simulationRef.current.ants = createAnts(antCount);
    simulationRef.current.bestPath = [];
    setIteration(0);
    setBestPathLength(Infinity);
    setShortestPathFound(false);
  };

  // Çizim fonksiyonu
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { pheromones, ants, start, target, bestPath } = simulationRef.current;

    // Arkaplan
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, cols * gridSize, rows * gridSize);

    // Grid ve feromonlar
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = pheromones[y][x];

        if (cell.isObstacle) {
          ctx.fillStyle = "#475569";
          ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        } else if (cell.pheromone > 0) {
          const intensity = Math.min(cell.pheromone / 5, 1);
          ctx.fillStyle = `rgba(147, 51, 234, ${intensity * 0.6})`;
          ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }

        // Grid çizgileri
        ctx.strokeStyle = "#1e293b";
        ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }

    // En iyi yol
    if (bestPath.length > 0) {
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(
        bestPath[0].x * gridSize + gridSize / 2,
        bestPath[0].y * gridSize + gridSize / 2
      );
      for (let i = 1; i < bestPath.length; i++) {
        ctx.lineTo(
          bestPath[i].x * gridSize + gridSize / 2,
          bestPath[i].y * gridSize + gridSize / 2
        );
      }
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Karıncalar
    ants.forEach((ant) => {
      if (!ant.stuck) {
        ctx.fillStyle = ant.completed ? "#10b981" : "#ef4444";
        ctx.beginPath();
        ctx.arc(
          ant.x * gridSize + gridSize / 2,
          ant.y * gridSize + gridSize / 2,
          4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Karınca yolu
        if (ant.path.length > 1) {
          ctx.strokeStyle = ant.completed
            ? "rgba(16, 185, 129, 0.3)"
            : "rgba(239, 68, 68, 0.2)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(
            ant.path[0].x * gridSize + gridSize / 2,
            ant.path[0].y * gridSize + gridSize / 2
          );
          for (let i = 1; i < ant.path.length; i++) {
            ctx.lineTo(
              ant.path[i].x * gridSize + gridSize / 2,
              ant.path[i].y * gridSize + gridSize / 2
            );
          }
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }
    });

    // Başlangıç
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(
      start.x * gridSize + gridSize / 2,
      start.y * gridSize + gridSize / 2,
      15,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "🏠",
      start.x * gridSize + gridSize / 2,
      start.y * gridSize + gridSize / 2 + 7
    );

    // Hedef
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(
      target.x * gridSize + gridSize / 2,
      target.y * gridSize + gridSize / 2,
      15,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      "🍯",
      target.x * gridSize + gridSize / 2,
      target.y * gridSize + gridSize / 2 + 7
    );
  };

  // Animasyon döngüsü
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      const { ants, pheromones, target } = simulationRef.current;

      let allDone = true;
      for (let ant of ants) {
        if (!ant.completed && !ant.stuck) {
          ant.move(pheromones, target);
          allDone = false;
        }
      }

      if (allDone) {
        // Feromonları bırak
        let bestAnt = null;
        let minLength = Infinity;

        for (let ant of ants) {
          if (ant.completed && ant.pathLength < minLength) {
            minLength = ant.pathLength;
            bestAnt = ant;
          }
        }

        if (bestAnt && minLength < bestPathLength) {
          setBestPathLength(minLength);
          simulationRef.current.bestPath = [...bestAnt.path];
          setShortestPathFound(true);
        }

        for (let ant of ants) {
          ant.depositPheromone(pheromones);
        }

        // Buharlaştır
        evaporatePheromones(pheromones);

        // Yeni iterasyon
        simulationRef.current.ants = createAnts(antCount);
        setIteration((prev) => prev + 1);
      }

      draw();
    };

    const interval = setInterval(animate, speed);
    return () => clearInterval(interval);
  }, [isRunning, antCount, obstacleCount, evaporationRate, speed]);

  // İlk çizim
  useEffect(() => {
    initSimulation();
    draw();
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          🐜 Karınca Kolonisi Optimizasyonu (ACO)
        </h1>

        <div className="mb-4 grid grid-cols-4 gap-4">
          <div>
            <label className="text-white text-sm block mb-2">
              Karınca Sayısı: {antCount}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={antCount}
              onChange={(e) => {
                setAntCount(parseInt(e.target.value));
                if (!isRunning) {
                  initSimulation();
                }
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white text-sm block mb-2">
              Engel Sayısı: {obstacleCount}
            </label>
            <input
              type="range"
              min="0"
              max="12"
              value={obstacleCount}
              onChange={(e) => {
                setObstacleCount(parseInt(e.target.value));
                if (!isRunning) {
                  initSimulation();
                }
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white text-sm block mb-2 flex items-center gap-2">
              <Droplets size={16} />
              Buharlaşma: {(evaporationRate * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={evaporationRate * 100}
              onChange={(e) =>
                setEvaporationRate(parseInt(e.target.value) / 100)
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white text-sm block mb-2">
              Hız:{" "}
              {speed <= 10
                ? "⚡ Çok Hızlı"
                : speed <= 30
                ? "🚀 Hızlı"
                : speed <= 50
                ? "⏩ Normal"
                : speed <= 100
                ? "🐢 Yavaş"
                : "🐌 Çok Yavaş"}
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={cols * gridSize}
          height={rows * gridSize}
          className="border-4  border-slate-600 rounded-lg mb-4 w-full"
        />

        <div className="grid grid-cols-4 gap-3 mb-4 text-center">
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-slate-400 text-xs">İterasyon</div>
            <div className="text-white text-xl font-bold">{iteration}</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-slate-400 text-xs">En Kısa Yol</div>
            <div className="text-green-400 text-xl font-bold">
              {bestPathLength === Infinity ? "---" : bestPathLength}
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Karınca Sayısı</div>
            <div className="text-blue-400 text-xl font-bold">{antCount}</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Durum</div>
            <div className="text-yellow-400 text-xl font-bold">
              {shortestPathFound ? "✓ Bulundu!" : "🔍 Arıyor..."}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            {isRunning ? "Durdur" : "Başlat"}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              initSimulation();
              draw();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <RotateCcw size={20} />
            Yeniden Başlat
          </button>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Nasıl Çalışır?</h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>
              🐜 Karıncalar 🏠 evden 🍯 yiyeceğe gitmek için rastgele yollar
              dener
            </li>
            <li>
              💜 Başarılı karıncalar yol boyunca{" "}
              <span className="text-purple-400">feromon</span> bırakır
            </li>
            <li>🎯 Kısa yol bulan karıncalar daha fazla feromon bırakır</li>
            <li>💨 Feromonlar zamanla buharlaşır (kötü yollar unutulur)</li>
            <li>🔄 Diğer karıncalar feromon yoğunluğuna göre yol seçer</li>
            <li>✅ Zamanla koloni en kısa yolu keşfeder!</li>
          </ul>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">Arayan karıncalar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">Başarılı karıncalar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-slate-300">Feromon izi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntColonySimulation;
