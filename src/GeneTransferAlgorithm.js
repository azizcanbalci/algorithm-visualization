import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Zap,
  Users,
  TrendingUp,
} from "lucide-react";

export default function GeneTransferAlgorithm() {
  const [showSettings, setShowSettings] = useState(true);
  const [running, setRunning] = useState(false);

  // Parametreler
  const [chromosomeSize, setChromosomeSize] = useState(12);
  const [populationSize, setPopulationSize] = useState(8);
  const [mutationRate, setMutationRate] = useState(0.1);
  const [crossoverRate, setCrossoverRate] = useState(0.8);
  const [eliteSize, setEliteSize] = useState(2);
  const [maxGenerations, setMaxGenerations] = useState(100);
  const [speed, setSpeed] = useState(500);

  // Durum
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState([]);
  const [bestIndividual, setBestIndividual] = useState(null);
  const [stats, setStats] = useState({ best: 0, avg: 0, worst: 0 });
  const [history, setHistory] = useState([]);
  const [activeIndividual, setActiveIndividual] = useState(null);
  const [stopped, setStopped] = useState(false);
  const [crossoverVisualization, setCrossoverVisualization] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [lastMutation, setLastMutation] = useState(null);

  const calculateFitness = (genes) => {
    return genes.reduce((sum, gene) => sum + gene, 0);
  };

  const createIndividual = () => ({
    genes: Array(chromosomeSize)
      .fill(0)
      .map(() => (Math.random() > 0.5 ? 1 : 0)),
    fitness: 0,
    generation: 0,
    parents: null,
    id: Math.random().toString(36).substring(7),
  });

  const initPopulation = () => {
    const newPop = Array(populationSize)
      .fill(0)
      .map(() => {
        const ind = createIndividual();
        ind.fitness = calculateFitness(ind.genes);
        return ind;
      });
    setPopulation(newPop);
    setGeneration(0);
    setHistory([]);
    setStopped(false);
    setCrossoverVisualization(null);
    setLastMutation(null);
    updateStats(newPop);
  };

  const updateStats = (pop) => {
    const fitnesses = pop.map((p) => p.fitness);
    const best = Math.max(...fitnesses);
    const worst = Math.min(...fitnesses);
    const avg = (fitnesses.reduce((a, b) => a + b, 0) / pop.length).toFixed(1);
    setStats({ best, avg, worst });

    const bestInd = pop.find((p) => p.fitness === best);
    setBestIndividual(bestInd);
  };

  const selectParent = (pop) => {
    const tournament = [];
    for (let i = 0; i < 3; i++) {
      tournament.push(pop[Math.floor(Math.random() * pop.length)]);
    }
    return tournament.reduce((a, b) => (a.fitness > b.fitness ? a : b));
  };

  const crossover = (p1, p2) => {
    const point = Math.floor(Math.random() * (chromosomeSize - 1)) + 1;
    const genes = [...p1.genes.slice(0, point), ...p2.genes.slice(point)];
    const child = {
      genes,
      fitness: calculateFitness(genes),
      generation: generation + 1,
      parents: [p1.id, p2.id],
      id: Math.random().toString(36).substring(7),
    };

    if (!animating && running) {
      setCrossoverVisualization({
        parent1: p1,
        parent2: p2,
        child,
        crossoverPoint: point,
        timestamp: Date.now(),
      });
      setAnimating(true);
      setTimeout(() => {
        setAnimating(false);
      }, 2500);
    }

    return child;
  };

  const mutate = (individual) => {
    const mutatedIndices = [];
    const genes = individual.genes.map((gene, idx) => {
      if (Math.random() < mutationRate) {
        mutatedIndices.push(idx);
        return gene === 1 ? 0 : 1;
      }
      return gene;
    });

    if (mutatedIndices.length > 0) {
      setLastMutation({
        individual: { ...individual, genes },
        mutatedIndices,
        timestamp: Date.now(),
      });
    }

    return {
      ...individual,
      genes,
      fitness: calculateFitness(genes),
    };
  };

  const evolveGeneration = () => {
    setPopulation((prevPop) => {
      if (generation >= maxGenerations) {
        setStopped(true);
        setRunning(false);
        return prevPop;
      }

      const sorted = [...prevPop].sort((a, b) => b.fitness - a.fitness);

      if (sorted[0].fitness === chromosomeSize) {
        setStopped(true);
        setRunning(false);
        return prevPop;
      }

      const newPop = [];

      for (let i = 0; i < eliteSize && i < sorted.length; i++) {
        newPop.push({
          ...sorted[i],
          generation: generation + 1,
        });
      }

      while (newPop.length < prevPop.length) {
        const p1 = selectParent(prevPop);
        const p2 = selectParent(prevPop);

        let child;
        if (Math.random() < crossoverRate) {
          child = crossover(p1, p2);
        } else {
          child = {
            ...p1,
            generation: generation + 1,
            id: Math.random().toString(36).substring(7),
          };
        }

        child = mutate(child);
        newPop.push(child);
      }

      setGeneration((g) => g + 1);
      updateStats(newPop);

      setHistory((prev) => [
        ...prev,
        {
          gen: generation + 1,
          best: sorted[0].fitness,
          avg: parseFloat(
            (
              sorted.reduce((sum, ind) => sum + ind.fitness, 0) / sorted.length
            ).toFixed(1)
          ),
          worst: sorted[sorted.length - 1].fitness,
        },
      ]);

      return newPop;
    });
  };

  useEffect(() => {
    if (generation === 0) {
      initPopulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running || stopped) return;
    const timer = setTimeout(evolveGeneration, speed);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, generation, stopped, speed]);

  const GeneVisualization = ({
    genes,
    highlightIndices = [],
    size = "small",
  }) => {
    const sizeClass = size === "large" ? "w-4 h-8" : "w-3 h-3";

    return (
      <div className="flex gap-0.5">
        {genes.map((gene, i) => (
          <div
            key={i}
            className={`${sizeClass} rounded-sm transition-all ${
              highlightIndices.includes(i)
                ? "border-2 border-yellow-400 animate-pulse"
                : "border border-gray-500"
            }`}
            style={{
              backgroundColor: gene === 1 ? "#00ff88" : "#1a1a2e",
              boxShadow: gene === 1 ? "0 0 6px rgba(0, 255, 136, 0.8)" : "none",
            }}
          />
        ))}
      </div>
    );
  };

  if (showSettings) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🧬 GEN AKTARIMI ALGORİTMASI
            </h1>
            <p className="text-gray-400 text-lg">
              Genetik algoritma parametrelerini ayarla ve evrimi başlat
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 space-y-8 border border-purple-500/30 shadow-2xl">
            <div>
              <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
                <Users size={24} /> Popülasyon Parametreleri
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Kromozom Boyutu:{" "}
                    <span className="text-cyan-400 text-lg">
                      {chromosomeSize}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={chromosomeSize}
                    onChange={(e) =>
                      setChromosomeSize(parseInt(e.target.value))
                    }
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Bir bireyin kaç genden oluşacağı
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Popülasyon Boyutu:{" "}
                    <span className="text-cyan-400 text-lg">
                      {populationSize}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    value={populationSize}
                    onChange={(e) =>
                      setPopulationSize(parseInt(e.target.value))
                    }
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Nesildeki birey sayısı
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                <Zap size={24} /> Genetik Operatörler
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Mutasyon Oranı:{" "}
                    <span className="text-purple-400 text-lg">
                      {(mutationRate * 100).toFixed(0)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.3"
                    step="0.01"
                    value={mutationRate}
                    onChange={(e) =>
                      setMutationRate(parseFloat(e.target.value))
                    }
                    className="w-full accent-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Her genin rastgele değişme olasılığı
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Çaprazlama Oranı:{" "}
                    <span className="text-purple-400 text-lg">
                      {(crossoverRate * 100).toFixed(0)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.1"
                    value={crossoverRate}
                    onChange={(e) =>
                      setCrossoverRate(parseFloat(e.target.value))
                    }
                    className="w-full accent-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    İki ebeveynden çocuk üretme olasılığı
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-green-300 mb-6 flex items-center gap-2">
                <TrendingUp size={24} /> Algoritma Ayarları
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Elit Koruma:{" "}
                    <span className="text-green-400 text-lg">{eliteSize}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={eliteSize}
                    onChange={(e) => setEliteSize(parseInt(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    En iyi bireyleri koru
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Max Nesil:{" "}
                    <span className="text-green-400 text-lg">
                      {maxGenerations}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={maxGenerations}
                    onChange={(e) =>
                      setMaxGenerations(parseInt(e.target.value))
                    }
                    className="w-full accent-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">Durma kriteri</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Hız:{" "}
                    <span className="text-green-400 text-lg">{speed}ms</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Nesiller arası gecikme
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-lg border-l-4 border-yellow-400">
              <p className="text-yellow-300 font-semibold mb-3 text-lg">
                📋 Algoritma Özeti
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Popülasyon:</span>
                  <span className="text-white font-bold ml-2">
                    {populationSize} birey
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Kromozom:</span>
                  <span className="text-white font-bold ml-2">
                    {chromosomeSize} gen
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Mutasyon:</span>
                  <span className="text-white font-bold ml-2">
                    {(mutationRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Çaprazlama:</span>
                  <span className="text-white font-bold ml-2">
                    {(crossoverRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Elit Koruma:</span>
                  <span className="text-white font-bold ml-2">
                    {eliteSize} birey
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Maksimum:</span>
                  <span className="text-white font-bold ml-2">
                    {maxGenerations} nesil
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettings(false);
                initPopulation();
              }}
              className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 p-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              🚀 Evrimi Başlat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
              🧬 Gen Aktarımı Algoritması
            </h1>
            <p className="text-gray-400">
              Nesil:{" "}
              <span className="text-cyan-400 font-bold">{generation}</span> /{" "}
              {maxGenerations}
              {stopped && (
                <span className="ml-4 text-green-400">✅ Tamamlandı</span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setRunning(false);
              setShowSettings(true);
            }}
            className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg flex items-center gap-2 transition-all"
          >
            <Settings size={20} /> Ayarlar
          </button>
        </div>

        {/* KONTROLLER */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setRunning(!running)}
            disabled={stopped}
            className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 ${
              running
                ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50"
                : stopped
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/50"
            }`}
          >
            {running ? (
              <>
                <Pause size={20} /> DURDUR
              </>
            ) : (
              <>
                <Play size={20} /> BAŞLAT
              </>
            )}
          </button>

          <button
            onClick={() => {
              setRunning(false);
              initPopulation();
            }}
            className="px-8 py-3 rounded-lg font-bold flex items-center gap-2 bg-slate-700 hover:bg-slate-600 transition-all transform hover:scale-105"
          >
            <RotateCcw size={20} /> SIFIRLA
          </button>

          <div className="ml-auto flex gap-3">
            <div className="px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="text-gray-400 text-sm">Hız: </span>
              <span className="text-white font-bold">{speed}ms</span>
            </div>
          </div>
        </div>

        {/* İSTATİSTİKLER */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-900/30 to-slate-900 p-4 rounded-lg border-2 border-green-500/50">
            <p className="text-xs text-gray-400 mb-1">EN İYİ FITNESS</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.best}/{chromosomeSize}
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{ width: `${(stats.best / chromosomeSize) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 p-4 rounded-lg border-2 border-blue-500/50">
            <p className="text-xs text-gray-400 mb-1">ORTALAMA FITNESS</p>
            <p className="text-3xl font-bold text-blue-400">{stats.avg}</p>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all"
                style={{ width: `${(stats.avg / chromosomeSize) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-slate-900 p-4 rounded-lg border-2 border-red-500/50">
            <p className="text-xs text-gray-400 mb-1">EN DÜŞÜK FITNESS</p>
            <p className="text-3xl font-bold text-red-400">
              {stats.worst}/{chromosomeSize}
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2">
              <div
                className="bg-red-400 h-2 rounded-full transition-all"
                style={{ width: `${(stats.worst / chromosomeSize) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 p-4 rounded-lg border-2 border-purple-500/50">
            <p className="text-xs text-gray-400 mb-1">POPÜLASYON</p>
            <p className="text-3xl font-bold text-purple-400">
              {population.length}
            </p>
            <p className="text-xs text-gray-400 mt-2">Elite: {eliteSize}</p>
          </div>
        </div>

        {/* ÇAPRAZLAMA GÖRSELLEŞTİRME */}
        {crossoverVisualization && (
          <div className="bg-gradient-to-br from-yellow-900/20 to-slate-900 border-2 border-yellow-500/50 rounded-xl p-6 mb-6 shadow-xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
              ✂️ Çaprazlama İşlemi
              <span className="text-base font-normal text-gray-400">
                (Kesim Noktası: {crossoverVisualization.crossoverPoint})
              </span>
            </h2>

            <div className="space-y-4">
              {/* Ebeveyn 1 */}
              <div className="bg-slate-800/70 p-5 rounded-lg border border-cyan-500/30">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-cyan-400 font-bold flex items-center gap-2">
                    👤 Ebeveyn 1{" "}
                    <span className="text-xs text-gray-400">
                      ({crossoverVisualization.parent1.id})
                    </span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Fitness:{" "}
                    <span className="font-bold text-cyan-400">
                      {crossoverVisualization.parent1.fitness}
                    </span>
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {crossoverVisualization.parent1.genes.map((gene, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-5 h-10 rounded-sm transition-all ${
                          i < crossoverVisualization.crossoverPoint
                            ? "border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
                            : "border border-gray-600 opacity-40"
                        }`}
                        style={{
                          backgroundColor: gene === 1 ? "#00ff88" : "#1a1a2e",
                          boxShadow:
                            gene === 1 &&
                            i < crossoverVisualization.crossoverPoint
                              ? "0 0 10px rgba(0, 255, 136, 0.8)"
                              : "none",
                        }}
                      />
                      {i === crossoverVisualization.crossoverPoint - 1 && (
                        <div className="text-yellow-400 text-xs mt-1">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Çaprazlama İşareti */}
              <div className="flex justify-center py-2">
                <div className="text-center px-6 py-2 bg-yellow-500/20 rounded-full border border-yellow-400">
                  <p className="text-yellow-400 font-bold">
                    ⬇️ Genler Birleştiriliyor ⬇️
                  </p>
                </div>
              </div>

              {/* Ebeveyn 2 */}
              <div className="bg-slate-800/70 p-5 rounded-lg border border-purple-500/30">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-purple-400 font-bold flex items-center gap-2">
                    👤 Ebeveyn 2{" "}
                    <span className="text-xs text-gray-400">
                      ({crossoverVisualization.parent2.id})
                    </span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Fitness:{" "}
                    <span className="font-bold text-purple-400">
                      {crossoverVisualization.parent2.fitness}
                    </span>
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {crossoverVisualization.parent2.genes.map((gene, i) => (
                    <div key={i} className="flex flex-col items-center">
                      {i === crossoverVisualization.crossoverPoint && (
                        <div className="text-yellow-400 text-xs mb-1">↓</div>
                      )}
                      <div
                        className={`w-5 h-10 rounded-sm transition-all ${
                          i >= crossoverVisualization.crossoverPoint
                            ? "border-2 border-purple-400 shadow-lg shadow-purple-500/50"
                            : "border border-gray-600 opacity-40"
                        }`}
                        style={{
                          backgroundColor: gene === 1 ? "#00ff88" : "#1a1a2e",
                          boxShadow:
                            gene === 1 &&
                            i >= crossoverVisualization.crossoverPoint
                              ? "0 0 10px rgba(0, 255, 136, 0.8)"
                              : "none",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sonuç: Çocuk */}
              <div className="bg-gradient-to-r from-cyan-900/30 via-purple-900/30 to-cyan-900/30 p-5 rounded-lg border-2 border-green-500 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-green-400 font-bold text-lg flex items-center gap-2">
                    👶 Yeni Birey{" "}
                    <span className="text-xs text-gray-400">
                      ({crossoverVisualization.child.id})
                    </span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Fitness:{" "}
                    <span className="font-bold text-green-400">
                      {crossoverVisualization.child.fitness}
                    </span>
                  </p>
                </div>
                <div className="flex gap-0.5 mb-4">
                  {crossoverVisualization.child.genes.map((gene, i) => (
                    <div
                      key={i}
                      className="w-5 h-10 rounded-sm border-2 transition-all shadow-lg"
                      style={{
                        backgroundColor: gene === 1 ? "#00ff88" : "#1a1a2e",
                        borderColor:
                          i < crossoverVisualization.crossoverPoint
                            ? "#22d3ee"
                            : "#c084fc",
                        boxShadow:
                          gene === 1
                            ? "0 0 10px rgba(0, 255, 136, 0.8)"
                            : "none",
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-6 text-sm justify-center">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 rounded"></div>
                    <span className="text-gray-300">
                      Ebeveyn 1'den:{" "}
                      <span className="text-cyan-400 font-bold">
                        {crossoverVisualization.crossoverPoint} gen
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-400 rounded"></div>
                    <span className="text-gray-300">
                      Ebeveyn 2'den:{" "}
                      <span className="text-purple-400 font-bold">
                        {chromosomeSize - crossoverVisualization.crossoverPoint}{" "}
                        gen
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EN İYİ BİREY */}
        {bestIndividual && (
          <div className="bg-gradient-to-br from-green-900/20 to-slate-900 border-2 border-green-500/50 rounded-xl p-6 mb-6 shadow-xl">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              🏆 Şampiyon Birey
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 mb-3 text-sm">Gen Haritası:</p>
                <GeneVisualization genes={bestIndividual.genes} size="small" />
                <p className="text-xs text-gray-400 mt-2">
                  <span className="text-green-400 font-bold">
                    {bestIndividual.genes.filter((g) => g === 1).length}
                  </span>{" "}
                  aktif,{" "}
                  <span className="text-gray-500 font-bold">
                    {bestIndividual.genes.filter((g) => g === 0).length}
                  </span>{" "}
                  inaktif
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Fitness Puanı</p>
                  <p className="text-2xl font-bold text-green-400">
                    {bestIndividual.fitness} / {chromosomeSize}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Oluşturulduğu Nesil</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {bestIndividual.generation}
                  </p>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-gray-400 mb-2 text-sm font-semibold">
                  Birey Bilgisi:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-yellow-400 font-mono text-xs">
                      {bestIndividual.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Başarı Oranı:</span>
                    <span className="text-cyan-400 font-bold">
                      {(
                        (bestIndividual.fitness / chromosomeSize) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* POPÜLASYON GRID */}
          <div>
            <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Users size={24} /> Popülasyon ({population.length} birey)
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {population.map((ind) => (
                <div
                  key={ind.id}
                  onClick={() =>
                    setActiveIndividual(
                      activeIndividual?.id === ind.id ? null : ind
                    )
                  }
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    activeIndividual?.id === ind.id
                      ? "bg-yellow-500/30 border-yellow-400 scale-105 shadow-lg"
                      : "bg-slate-800/50 border-slate-700 hover:border-purple-500/50 hover:scale-102"
                  }`}
                >
                  <div className="mb-2">
                    <GeneVisualization genes={ind.genes} />
                  </div>
                  <p
                    className="text-xs text-center font-bold"
                    style={{
                      color: `hsl(${
                        (ind.fitness / chromosomeSize) * 120
                      }, 100%, 60%)`,
                    }}
                  >
                    {ind.fitness}/{chromosomeSize}
                  </p>
                  <p className="text-xs text-center text-gray-400">
                    Gen {ind.generation}
                  </p>
                </div>
              ))}
            </div>

            {/* Aktif Birey Detayları */}
            {activeIndividual && (
              <div className="mt-4 bg-slate-800/70 p-4 rounded-lg border border-yellow-500/50">
                <p className="text-yellow-400 font-bold mb-3">
                  Seçili Birey Detayları
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-white font-mono">
                      {activeIndividual.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fitness:</span>
                    <span className="text-white font-bold">
                      {activeIndividual.fitness}/{chromosomeSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nesil:</span>
                    <span className="text-white">
                      {activeIndividual.generation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Başarı Oranı:</span>
                    <span className="text-cyan-400 font-bold">
                      {(
                        (activeIndividual.fitness / chromosomeSize) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GRAFİK */}
          {history.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <TrendingUp size={24} /> Gelişim Grafiği
              </h2>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-purple-500/20 shadow-xl">
                <div className="h-64 bg-slate-900/50 rounded flex items-end gap-0.5 p-3">
                  {history.slice(-60).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col justify-end gap-0.5"
                    >
                      <div
                        className="bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all"
                        style={{
                          height: `${(item.best / chromosomeSize) * 100}%`,
                          minHeight: "2px",
                        }}
                        title={`Nesil ${item.gen}: En İyi ${item.best}`}
                      />
                      <div
                        className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all"
                        style={{
                          height: `${(item.avg / chromosomeSize) * 100}%`,
                          minHeight: "2px",
                          opacity: 0.7,
                        }}
                        title={`Nesil ${item.gen}: Ortalama ${item.avg}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-6 justify-center text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span className="text-gray-300">En İyi Fitness</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    <span className="text-gray-300">Ortalama Fitness</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Son {Math.min(history.length, 60)} nesil gösteriliyor
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
