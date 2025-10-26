# 🧠 İşlemsel Zeka Algoritmaları Görselleştirme Uygulaması

Bu proje, iki popülasyon tabanlı optimizasyon yaklaşımını etkileşimli olarak görselleştirir:

- 🐜 Karınca Kolonisi Optimizasyonu (Ant Colony Optimization, ACO)
- 🧬 Gen Aktarımı Algoritması (Genetik Algoritma)

Arayüz Türkçe’dir ve parametreleri canlı olarak değiştirip sonuçları anlık görebilirsiniz.

## 🚀 Hocaya Hızlı Başlangıç (Windows/PowerShell)

Aşağıdaki adımlar, zip’tan çıkardıktan sonra projeyi başlatmak için yeterlidir:

```powershell
cd ant-colony-app
npm install
npm start
```

Ardından tarayıcıda otomatik olarak http://localhost:3000 açılır (açılmazsa manuel olarak açabilirsiniz).

## 📦 Gereksinimler

- Node.js 18 LTS veya 20 LTS önerilir
- npm (Node ile birlikte gelir)

Not: Kurumsal makinalarda güvenlik duvarı veya proxy internet erişimini etkiliyorsa, `npm install` aşamasında engellenebilir. Böyle bir durumda çevrimdışı kurulum için bilgi verin.

## 🔧 Kurulum ve Çalıştırma

Projeyi zip’ten çıkardıktan sonra:

```powershell
cd ant-colony-app
npm install
npm start
```

- Geliştirme sunucusu http://localhost:3000 üzerinde çalışır.
- İlk kurulum sırasında bağımlılıklar indirilir; bu adım bağlantı hızına göre zaman alabilir.

## 🗂️ Proje Özeti

Uygulama bir ana sayfa üzerinden iki algoritma arasında geçiş yapmanızı sağlar:

- Karınca Kolonisi Optimizasyonu: Izgara üzerinde başlangıç ve hedef noktası arasında, engelleri dikkate alarak, feromon izleri yardımıyla en kısa yolu bulmaya çalışan karınca ajanlarını simüle eder.
- Gen Aktarımı Algoritması: İkili (0/1) genlerden oluşan kromozomlar üzerinde çaprazlama (crossover), mutasyon ve elit koruma operatörleriyle fitness’i maksimize etmeyi hedefler.

## ✨ Özellikler

### 🐜 Karınca Kolonisi Optimizasyonu (ACO)

- Dinamik parametre kontrolü:
  - Karınca sayısı (1–100)
  - Engel sayısı (0–12)
  - Feromon buharlaşma oranı (%1–%50)
  - Simülasyon hızı
  - α (feromon etkisi), β (mesafe etkisi), bırakılan feromon miktarı
- Canlı metrikler: İterasyon sayısı, bulunan en kısa yol uzunluğu, durum (bulundu/arıyor)
- Görselleştirme:
  - Kırmızı: Arama yapan karıncalar
  - Yeşil: Hedefe ulaşmış karıncalar
  - Mor tonlar: Feromon izlerinin yoğunluğu
- “Nasıl Çalışır?” bölümü ve olasılık formülü açıklaması:
  - P(komşu) = [τ^α] × [η^β]
  - τ: feromon yoğunluğu, η: hedefe yakınlık (1/mesafe)

### 🧬 Gen Aktarımı Algoritması (Genetik Algoritma)

- Parametreler:
  - Kromozom boyutu (8–32 gen)
  - Popülasyon boyutu (4–30 birey)
  - Mutasyon oranı (%1–%30)
  - Çaprazlama oranı (%50–%100)
  - Elit koruma (1–5 birey)
  - Maksimum nesil ve adım hızı (ms)
- Operatörler ve mantık:
  - Turnuva seçim (tournament selection)
  - Tek noktalı çaprazlama (single-point crossover)
  - Bit flip mutasyon
  - Elit koruma ile en iyi bireyleri taşıma
- Görselleştirme:
  - Ebeveynler, kesim noktası ve oluşan çocuk üzerinde adım adım gösterim
  - En iyi/ortalama/en düşük fitness istatistikleri ve ilerleme çubukları

## 📐 Matematiksel Formüller

### 🐜 Karınca Kolonisi Optimizasyonu (ACO)

Geçiş olasılığı (komşu j, karınca i için), normalleştirilmiş olarak:

$$
P_{i\to j}
= \frac{\left(\tau_{ij}\right)^{\alpha}\,\left(\eta_{ij}\right)^{\beta}}
{\sum\limits_{k\in \mathcal{N}(i)}\left(\tau_{ik}\right)^{\alpha}\,\left(\eta_{ik}\right)^{\beta}}
\quad \text{, burada } \eta_{ij} = \frac{1}{d_{ij}}.
$$

Feromon güncellemesi (buharlaşma ve birikim):

$$
	au_{ij} \leftarrow (1-\rho)\,\tau_{ij}
\; + \; \sum_{k=1}^{m} \Delta \tau_{ij}^{(k)},
\qquad
\Delta \tau_{ij}^{(k)}=
\begin{cases}
\dfrac{Q}{L_k}, & \text{eğer karınca } k \text{ yolu } (i,j) \text{ üzerinden geçtiyse}\\
0, & \text{aksi halde}
\end{cases}
$$

Burada: $\rho$ buharlaşma oranı, $Q$ birim feromon sabiti, $L_k$ karınca $k$’nın yol uzunluğu ve $\mathcal{N}(i)$ düğüm $i$’nin erişilebilir komşularıdır.

### 🧬 Gen Aktarımı Algoritması (Genetik Algoritma)

Temsil ve uygunluk (fitness):

$$
\mathbf{x} = (x_1,\dots,x_n),\; x_i\in\{0,1\},
\qquad
f(\mathbf{x}) = \sum_{i=1}^{n} x_i.
$$

Turnuva seçimi (boyut t): rastgele seçilen $t$ birey arasından $\arg\max f$ seçilir.

Tek noktalı çaprazlama (kesim noktası $c$):

$$
	ext{child} = (x^{(1)}_{1:c},\; x^{(2)}_{c+1:n})
$$

Bit-flip mutasyon (olasılık $p_m$):

$$
x_i' =
\begin{cases}
1-x_i, & \text{olasılık } p_m \\
x_i, & \text{olasılık } 1-p_m
\end{cases}
$$

Elit koruma: her nesilde en iyi $e$ birey doğrudan bir sonraki nesle kopyalanır.

## 🧭 Kullanım

1. Uygulama açıldığında ana sayfadan algoritma seçin:

   - “Karınca Kolonisi Optimizasyonu” veya “Gen Aktarımı Algoritması”

2. ACO için:

   - Slaytırlardan parametreleri ayarlayın (karınca, engel, buharlaşma, hız, α, β, feromon miktarı).
   - “Başlat/Durdur” ile simülasyonu kontrol edin, “Yeniden Başlat” ile temiz bir koşu yapın.
   - En kısa yol bulunduğunda durum kısmında “Bulundu!” görünür.

3. Gen Algoritması için:
   - “Ayarlar” ekranında popülasyon ve operatör parametrelerini belirleyin.
   - “Evrimi Başlat” deyin; ardından “BAŞLAT/DURDUR” ve “SIFIRLA” düğmeleriyle akışı yönetin.
   - Çaprazlama görselleştirmesinde kesim noktası ve gen akışı adım adım gösterilir.

## 🧪 Komutlar

Proje kökünde (ant-colony-app) şu komutlar kullanılabilir:

```powershell
# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat (http://localhost:3000)
npm start

# Testleri çalıştır (interaktif mod)
npm test

# Üretim için derle
npm run build
```

## 📁 Klasör Yapısı (özet)

```
ant-colony-app/
├─ public/
│  └─ index.html
├─ src/
│  ├─ App.js                 # Ana yönlendirme; ana sayfa / algoritma ekranları
│  ├─ HomePage.js            # Algoritma seçim ekranı
│  ├─ AntColonySimulation.js # ACO simülasyonu ve görselleştirme
│  ├─ GeneTransferAlgorithm.js # Genetik algoritma ve görselleştirme
│  ├─ index.js, index.css    # Uygulama girişi ve Tailwind stilleri
│  └─ App.css, test dosyaları vb.
├─ package.json              # Komutlar ve bağımlılıklar
├─ tailwind.config.js        # Tailwind CSS ayarları
└─ postcss.config.js         # PostCSS/Tailwind entegrasyonu
```

## 🛠️ Notlar ve Sorun Giderme

- Port meşgulse: `npm start` sırasında 3000 portu doluysa, sistem sizden farklı bir port kullanma izni isteyebilir. “Y” diyerek onaylayabilirsiniz.
- Node sürümü: Node 18 veya 20 LTS tavsiye edilir. Çok eski bir sürüm, bağımlılıkların kurulmasını veya çalışmasını engelleyebilir.
- Güvenlik yazılımları: Bazı kurum bilgisayarlarında `npm install` internet erişimi nedeniyle takılabilir. Gerekirse offline kurulum seçenekleri konuşulabilir.
