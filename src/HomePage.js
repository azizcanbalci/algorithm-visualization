import React, { useState } from "react";
import { Bug, Dna } from "lucide-react";

export default function HomePage({ onSelectAlgorithm }) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🧠 İşlemsel Zeka Algoritmaları
          </h1>
          <p className="text-2xl text-gray-400 mb-4">
            Optimizasyon Algoritmalarını Görselleştir
          </p>
          <p className="text-gray-500">
            İki farklı popülasyon tabanlı optimizasyon algoritmasını keşfedin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Karınca Kolonisi Optimizasyonu */}
          <div
            onClick={() => onSelectAlgorithm("ant")}
            className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-purple-500/30 hover:border-purple-500 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
              🐜
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bug size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Karınca Kolonisi Optimizasyonu
              </h2>
              <p className="text-purple-400 font-semibold mb-4">
                Ant Colony Optimization (ACO)
              </p>
            </div>

            <div className="space-y-3 text-gray-300 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>
                  Karıncaların feromon izi bırakarak en kısa yolu bulma
                  davranışı
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>Dinamik engel haritasında yol bulma problemi</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>Gerçek zamanlı feromon buharlaşması ve güncelleme</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>Geri izleme (backtracking) özelliği ile tıkanma engelleme</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Ayarlanabilir Parametreler:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>• Karınca Sayısı</div>
                <div>• Engel Sayısı</div>
                <div>• Buharlaşma Oranı</div>
                <div>• Simülasyon Hızı</div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
              <Bug size={20} />
              Karınca Algoritmasını Başlat
            </button>
          </div>

          {/* Gen Aktarımı Algoritması */}
          <div
            onClick={() => onSelectAlgorithm("gene")}
            className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
          >
            <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
              🧬
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Dna size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Gen Aktarımı Algoritması
              </h2>
              <p className="text-cyan-400 font-semibold mb-4">
                Genetic Algorithm (GA)
              </p>
            </div>

            <div className="space-y-3 text-gray-300 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>Doğal seçilim ve evrim prensipleriyle optimizasyon</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>Çaprazlama ve mutasyon ile yeni nesiller oluşturma</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>Elit koruma stratejisi ile en iyi bireyleri saklama</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <p>Detaylı görselleştirme ile evrim sürecini izleme</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Ayarlanabilir Parametreler:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>• Popülasyon Boyutu</div>
                <div>• Kromozom Boyutu</div>
                <div>• Mutasyon Oranı</div>
                <div>• Çaprazlama Oranı</div>
                <div>• Elit Koruma</div>
                <div>• Maksimum Nesil</div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
              <Dna size={20} />
              Genetik Algoritmayı Başlat
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">
              📚 Öğrenme Hedefleri
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">
                  🎯 Algoritmik Düşünce
                </h4>
                <p className="text-sm text-gray-400">
                  Doğadan esinlenen optimizasyon algoritmalarının çalışma
                  prensiplerini görsel olarak anlayın
                </p>
              </div>
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">
                  🔬 Parametrelendirme
                </h4>
                <p className="text-sm text-gray-400">
                  Farklı parametre değerlerinin algoritma performansına etkisini
                  gerçek zamanlı gözlemleyin
                </p>
              </div>
              <div>
                <h4 className="text-pink-400 font-semibold mb-2">
                  💡 Pratik Uygulamalar
                </h4>
                <p className="text-sm text-gray-400">
                  Yol bulma ve optimizasyon problemlerine evrimsel yaklaşımları
                  keşfedin
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Her algoritmanın kendi kontrol paneli ve görselleştirme özellikleri
            bulunmaktadır
          </p>
        </div>
      </div>
    </div>
  );
}
