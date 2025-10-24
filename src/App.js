import React, { useState } from "react";
import HomePage from "./HomePage";
import AntColonySimulation from "./AntColonySimulation";
import GeneTransferAlgorithm from "./GeneTransferAlgorithm";
import { Home } from "lucide-react";

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  const handleSelectAlgorithm = (algorithm) => {
    setSelectedAlgorithm(algorithm);
  };

  const handleBackToHome = () => {
    setSelectedAlgorithm(null);
  };

  if (selectedAlgorithm === null) {
    return <HomePage onSelectAlgorithm={handleSelectAlgorithm} />;
  }

  return (
    <div className="relative">
      {/* Ana Sayfaya Dön Butonu */}
      <button
        onClick={handleBackToHome}
        className="fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg border border-slate-600 hover:border-slate-500"
      >
        <Home size={20} />
        <span className="font-semibold">Ana Sayfa</span>
      </button>

      {/* Seçilen Algoritma */}
      {selectedAlgorithm === "ant" && <AntColonySimulation />}
      {selectedAlgorithm === "gene" && <GeneTransferAlgorithm />}
    </div>
  );
}

export default App;
