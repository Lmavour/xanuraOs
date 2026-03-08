# Android OS Web - Panduan Pengembangan Aplikasi

## Overview

Android OS Web adalah sistem berbasis web yang mensimulasikan antarmuka Android OS. Sistem ini menggunakan arsitektur modular di mana setiap aplikasi adalah modul independen yang dapat dimuat secara dinamis.

## Struktur Proyek

```
main-server/
├── server.js                 # Server backend Node.js/Express
├── public/
│   ├── index.html            # Halaman utama
│   ├── css/
│   │   └── style.css        # CSS global
│   ├── js/
│   │   ├── app.js           # Logika utama aplikasi
│   │   └── auto-app-loader.js # Loader otomatis aplikasi
│   └── app/                # Direktori aplikasi
│       ├── system-info/       # Contoh aplikasi
│       │   ├── app.json      # Konfigurasi aplikasi
│       │   ├── system-info.js # Logika aplikasi
│       │   └── system-info.css # Style aplikasi
│       └── [nama-aplikasi]/  # Aplikasi lainnya
└── main-data/               # Data aplikasi (file upload, settings, dll)
```

## Cara Menambah Aplikasi Baru

### 1. Buat Direktori Aplikasi

Buat direktori baru di `public/app/` dengan nama aplikasi Anda:

```bash
mkdir public/app/nama-aplikasi
```

### 2. Buat File Konfigurasi (app.json)

Setiap aplikasi memerlukan file `app.json` untuk konfigurasi:

```json
{
  "name": "Nama Aplikasi",
  "icon": "🎯",
  "description": "Deskripsi singkat aplikasi",
  "entry": "nama-aplikasi.js",
  "className": "NamaAplikasiApp"
}
```

**Field yang diperlukan:**
- `name`: Nama aplikasi yang akan ditampilkan
- `icon`: Emoji atau ikon untuk aplikasi
- `description`: Deskripsi singkat aplikasi
- `entry`: Nama file JavaScript utama aplikasi
- `className`: Nama class JavaScript aplikasi

### 3. Buat File JavaScript Aplikasi

Buat file JavaScript dengan class yang mengextends pola aplikasi dasar:

```javascript
class NamaAplikasiApp {
  constructor(mainApp) {
    this.mainApp = mainApp;
  }

  async init() {
    // Inisialisasi aplikasi
    console.log('Aplikasi dimuat');
  }

  getHTML() {
    return `
      <div class="nama-aplikasi-app">
        <h1>Selamat Datang di Aplikasi Saya</h1>
        <!-- Konten aplikasi Anda -->
      </div>
    `;
  }

  // Method lain yang diperlukan
  showNotification(message, type = 'info') {
    this.mainApp.showNotification(message, type);
  }

  showError(message) {
    this.mainApp.showError(message);
  }

  showSuccess(message) {
    this.mainApp.showSuccess(message);
  }
}
```

### 4. Buat File CSS (Opsional)

Buat file CSS untuk styling aplikasi:

```css
.nama-aplikasi-app {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.nama-aplikasi-app h1 {
  color: #333;
  margin-bottom: 20px;
}
```

## API yang Tersedia

### 1. System Information

```javascript
// GET /api/system
const response = await fetch('/api/system');
const systemInfo = await response.json();
```

### 2. File Management

```javascript
// List files
const response = await fetch('/api/files?path=/path/to/directory');
const files = await response.json();

// Upload file
const formData = new FormData();
formData.append('file', file);
await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

// Delete file
await fetch('/api/files?path=/path/to/file', {
  method: 'DELETE'
});
```

### 3. Settings

```javascript
// Get settings
const response = await fetch('/api/settings');
const settings = await response.json();

// Save settings
await fetch('/api/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(settings)
});
```

## Konvensi Penamaan

### File dan Folder
- Gunakan lowercase dengan hyphen untuk nama folder: `nama-aplikasi`
- Gunakan lowercase dengan hyphen untuk nama file: `nama-aplikasi.js`, `nama-aplikasi.css`

### Class JavaScript
- Gunakan PascalCase dengan suffix "App": `NamaAplikasiApp`

### CSS Classes
- Gunakan kebab-case dengan prefix nama aplikasi: `nama-aplikasi-app`, `nama-aplikasi-button`

## Best Practices

### 1. Struktur Kode
- Pisahkan logika dari presentasi
- Gunakan method yang deskriptif
- Handle error dengan baik

### 2. Performance
- Minimalkan DOM manipulation
- Gunakan event delegation
- Lazy load resources jika diperlukan

### 3. User Experience
- Berikan feedback visual untuk semua aksi
- Gunakan loading indicators untuk operasi async
- Pastikan responsive design

### 4. Security
- Validasi input user
- Escape HTML untuk mencegah XSS
- Gunakan HTTPS untuk komunikasi sensitif

## Contoh Aplikasi Lengkap

### Simple Calculator App

**app.json:**
```json
{
  "name": "Calculator",
  "icon": "🧮",
  "description": "Simple calculator app",
  "entry": "calculator.js",
  "className": "CalculatorApp"
}
```

**calculator.js:**
```javascript
class CalculatorApp {
  constructor(mainApp) {
    this.mainApp = mainApp;
    this.currentValue = '0';
    this.previousValue = '';
    this.operation = null;
    this.shouldResetScreen = false;
  }

  async init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const container = document.getElementById('appContainer');
    container.innerHTML = this.getHTML();
  }

  getHTML() {
    return `
      <div class="calculator-app">
        <div class="calculator-screen">${this.currentValue}</div>
        <div class="calculator-buttons">
          <button class="calc-btn" data-action="clear">C</button>
          <button class="calc-btn" data-action="divide">÷</button>
          <button class="calc-btn" data-action="multiply">×</button>
          <button class="calc-btn" data-action="delete">←</button>
          
          <button class="calc-btn" data-number="7">7</button>
          <button class="calc-btn" data-number="8">8</button>
          <button class="calc-btn" data-number="9">9</button>
          <button class="calc-btn" data-action="subtract">-</button>
          
          <button class="calc-btn" data-number="4">4</button>
          <button class="calc-btn" data-number="5">5</button>
          <button class="calc-btn" data-number="6">6</button>
          <button class="calc-btn" data-action="add">+</button>
          
          <button class="calc-btn" data-number="1">1</button>
          <button class="calc-btn" data-number="2">2</button>
          <button class="calc-btn" data-number="3">3</button>
          <button class="calc-btn" data-action="equals" rowspan="2">=</button>
          
          <button class="calc-btn" data-number="0" colspan="2">0</button>
          <button class="calc-btn" data-action="decimal">.</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const number = e.target.dataset.number;
        
        if (number) {
          this.appendNumber(number);
        } else if (action) {
          this.handleAction(action);
        }
      });
    });
  }

  appendNumber(num) {
    if (this.shouldResetScreen) {
      this.currentValue = '0';
      this.shouldResetScreen = false;
    }
    
    if (this.currentValue === '0') {
      this.currentValue = num;
    } else {
      this.currentValue += num;
    }
    
    this.updateScreen();
  }

  handleAction(action) {
    switch(action) {
      case 'clear':
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        break;
      case 'delete':
        this.currentValue = this.currentValue.slice(0, -1) || '0';
        break;
      case 'decimal':
        if (!this.currentValue.includes('.')) {
          this.currentValue += '.';
        }
        break;
      case 'equals':
        this.calculate();
        break;
      default:
        this.setOperation(action);
    }
    
    this.updateScreen();
  }

  setOperation(op) {
    if (this.operation && !this.shouldResetScreen) {
      this.calculate();
    }
    
    this.previousValue = this.currentValue;
    this.operation = op;
    this.shouldResetScreen = true;
  }

  calculate() {
    if (!this.operation || !this.previousValue) return;
    
    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    let result;
    
    switch(this.operation) {
      case 'add':
        result = prev + current;
        break;
      case 'subtract':
        result = prev - current;
        break;
      case 'multiply':
        result = prev * current;
        break;
      case 'divide':
        result = prev / current;
        break;
    }
    
    this.currentValue = result.toString();
    this.operation = null;
    this.previousValue = '';
    this.shouldResetScreen = true;
  }

  updateScreen() {
    document.querySelector('.calculator-screen').textContent = this.currentValue;
  }
}
```

**calculator.css:**
```css
.calculator-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background-color: #f5f5f5;
}

.calculator-screen {
  width: 100%;
  max-width: 320px;
  height: 80px;
  background-color: #333;
  color: white;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 320px;
}

.calc-btn {
  height: 80px;
  border: none;
  border-radius: 10px;
  font-size: 1.5rem;
  background-color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.calc-btn:hover {
  background-color: #d0d0d0;
  transform: translateY(-2px);
}

.calc-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.calc-btn[data-action="equals"] {
  grid-row: span 2;
  background-color: #4CAF50;
  color: white;
}

.calc-btn[data-action="equals"]:hover {
  background-color: #45a049;
}

.calc-btn[data-number="0"] {
  grid-column: span 2;
}
```

## Debugging

### 1. Console Logging
Gunakan console.log untuk debugging:
```javascript
console.log('App initialized', { appName: 'MyApp' });
```

### 2. Error Handling
Wrap async operations dalam try-catch:
```javascript
try {
  const result = await someAsyncOperation();
  this.handleResult(result);
} catch (error) {
  console.error('Operation failed:', error);
  this.showError('Operation failed: ' + error.message);
}
```

### 3. Network Debugging
Gunakan Network tab di browser dev tools untuk inspect API calls.

## Deployment

### 1. Development
```bash
npm run dev
```

### 2. Production
```bash
npm start
```

Server akan berjalan di:
- Local: http://localhost:4038
- Network: http://192.168.0.50:4038 (atau IP Anda)

## Troubleshooting

### Aplikasi tidak muncul
1. Pastikan `app.json` ada dan valid
2. Check console untuk error JavaScript
3. Pastikan file JavaScript ada di folder yang benar

### Error saat loading
1. Check network tab untuk failed requests
2. Pastikan server berjalan
3. Restart server jika perlu

### Styling tidak berfungsi
1. Pastikan file CSS di-load dengan benar
2. Check CSS specificity
3. Gunakan browser dev tools untuk inspect elements

## Contributing

1. Fork proyek
2. Buat branch untuk fitur baru
3. Test perubahan
4. Submit pull request

## 🚀 Performance & Caching Implementation

### Overview
Android OS Web mengimplementasikan sistem caching multi-layer untuk memastikan load time < 3 detik dan offline capability.

### 1. Browser Cache Configuration

#### Cache-Control Headers
Server mengkonfigurasi header cache yang berbeda untuk setiap jenis file:

```javascript
// Static assets (CSS, JS, Images)
Cache-Control: public, max-age=31536000, immutable

// HTML files
Cache-Control: public, max-age=0, must-revalidate

// API responses
Cache-Control: public, max-age=86400
```

#### Implementation di server.js
```javascript
const staticOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // ... lainnya
  }
};

app.use(express.static('public', staticOptions));
```

### 2. Service Worker Implementation

#### Multi-Layer Caching Strategy
```javascript
// Static cache untuk core assets
const STATIC_CACHE = 'android-os-static-v1.0.0';

// Dynamic cache untuk API responses
const DYNAMIC_CACHE = 'android-os-dynamic-v1.0.0';

// Files yang di-cache secara statis
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/auto-app-loader.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css'
];
```

#### Cache Strategy
- **Static assets**: Cache permanen dengan version control
- **API responses**: Cache dinamis dengan background sync
- **Images**: Cache dengan lazy loading
- **Offline capability**: Fallback ke cache saat offline

### 3. Cache-Busting Mechanism

#### Version Control
Semua aset menggunakan version parameter untuk cache invalidation:

```html
<!-- Versioned assets -->
<link rel="stylesheet" href="/css/style.css?v=1.0.0">
<script src="/js/app.js?v=1.0.0"></script>
```

#### Service Worker Versioning
```javascript
// Register dengan version
navigator.serviceWorker.register('/sw.js?v=1.0.0')

// Cache naming dengan version
const CACHE_NAME = 'android-os-v1.0.0';
```

### 4. Lazy Loading Implementation

#### Wallpaper Loading di settings.js
```javascript
async cacheWallpaper(wallpaper) {
  // Check cache dulu
  if (this.wallpaperCache.has(wallpaper.id)) {
    return this.wallpaperCache.get(wallpaper.id);
  }
  
  // Lazy loading dengan performance monitoring
  const img = new Image();
  img.loading = 'lazy';
  img.src = `${wallpaper.url}?v=1.0.0`;
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      console.log(`Wallpaper loaded in ${loadTime.toFixed(2)}ms`);
      resolve(this.wallpaperCache.set(wallpaper.id, img));
    };
  });
}
```

#### Progressive Loading Strategy
```javascript
async preloadWallpapers() {
  // Load 3 wallpaper prioritas dulu
  const priorityWallpapers = this.unsplashWallpapers.slice(0, 3);
  await Promise.all(priorityWallpapers.map(w => this.cacheWallpaper(w)));
  
  // Lazy load sisanya setelah 2 detik
  setTimeout(() => {
    const remaining = this.unsplashWallpapers.slice(3);
    remaining.forEach(w => this.cacheWallpaper(w));
  }, 2000);
}
```

### 5. Icon Preloading

#### Critical Icons Preload
```javascript
preloadCriticalIcons() {
  const criticalIcons = [
    'bi-house', 'bi-arrow-left', 'bi-grid-3x3-gap',
    'bi-gear', 'bi-folder', 'bi-image'
  ];
  
  // Preload dengan DOM manipulation
  const preloadDiv = document.createElement('div');
  criticalIcons.forEach(iconClass => {
    const icon = document.createElement('i');
    icon.className = `bi ${iconClass}`;
    preloadDiv.appendChild(icon);
  });
  
  document.body.appendChild(preloadDiv);
  // Remove setelah 1 detik
  setTimeout(() => document.body.removeChild(preloadDiv), 1000);
}
```

#### Resource Hints di HTML
```html
<!-- Preload critical resources -->
<link rel="preload" href="/js/app.js?v=1.0.0" as="script">
<link rel="preload" href="/js/auto-app-loader.js?v=1.0.0" as="script">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/fonts/bootstrap-icons.woff2" as="font" type="font/woff2" crossorigin>

<!-- DNS prefetch untuk external resources -->
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<link rel="dns-prefetch" href="//images.unsplash.com">
```

### 6. Performance Monitoring

#### Client-side Monitoring
```javascript
// Load time measurement
window.addEventListener('load', () => {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  console.log(`Page load time: ${loadTime}ms`);
  
  // Send ke server
  if (navigator.sendBeacon) {
    const data = new FormData();
    data.append('loadTime', loadTime);
    data.append('timestamp', Date.now());
    navigator.sendBeacon('/api/analytics/performance', data);
  }
});

// Resource loading monitoring
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.duration > 1000) {
      console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
    }
  });
});
observer.observe({ entryTypes: ['resource'] });
```

#### Server-side Monitoring
```javascript
// Performance data endpoint
app.post('/api/analytics/performance', (req, res) => {
  const { loadTime, timestamp } = req.body;
  
  console.log(`Performance: ${loadTime}ms from ${req.ip}`);
  
  // Log warning jika slow
  if (loadTime > 3000) {
    console.warn(`Slow load time: ${loadTime}ms`);
  }
});

// Metrics endpoint
app.get('/api/analytics/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    timestamp: Date.now()
  });
});
```

### 7. Performance Testing

#### Test Suite Implementation
File: `public/performance-test.html`

Test categories:
1. **Cache Status Check** - Verifikasi cache configuration
2. **Load Time Test** - Pengukuran load time
3. **Service Worker Test** - Offline capability testing
4. **Resource Loading Test** - Resource optimization testing
5. **Performance Metrics** - Real-time metrics
6. **Overall Score** - Comprehensive performance scoring

#### Usage
```bash
# Akses test suite
http://localhost:4038/performance-test.html

# Check cache status
curl http://localhost:4038/api/cache/status

# Get performance metrics
curl http://localhost:4038/api/analytics/metrics
```

### 8. Best Practices untuk Caching

#### Untuk Developers
1. **Gunakan version control** untuk semua aset statis
2. **Implement lazy loading** untuk resources berat
3. **Monitor performance** secara berkala
4. **Test offline functionality** dengan Service Worker
5. **Optimize images** dengan format WebP

#### Configuration Parameters
```javascript
// Cache duration settings
const CACHE_CONFIG = {
  STATIC_ASSETS: 365 * 24 * 60 * 60 * 1000, // 1 year
  API_RESPONSES: 24 * 60 * 60 * 1000,     // 1 day
  HTML_FILES: 0,                           // no cache
  IMAGES: 365 * 24 * 60 * 60 * 1000       // 1 year
};

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  EXCELLENT_LOAD_TIME: 1000,  // 1 second
  GOOD_LOAD_TIME: 3000,        // 3 seconds
  SLOW_RESOURCE: 1000,         // 1 second
  WARNING_MEMORY: 100 * 1024 * 1024  // 100MB
};
```

#### Usage Examples
```javascript
// Cache wallpaper dengan performance monitoring
async applyWallpaper(wallpaperId) {
  const startTime = performance.now();
  
  // Lazy loading implementation
  const img = new Image();
  img.loading = 'lazy';
  img.src = `${wallpaperUrl}?v=1.0.0`;
  
  img.onload = () => {
    const loadTime = performance.now() - startTime;
    console.log(`Wallpaper applied in ${loadTime.toFixed(2)}ms`);
  };
}

// Service worker cache management
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 9. Troubleshooting Performance

#### Common Issues
1. **Cache tidak update**: Increment version number
2. **Service Worker tidak register**: Check HTTPS requirement
3. **Load time lambat**: Check network tab untuk large resources
4. **Offline tidak berfungsi**: Verify cache storage

#### Debug Tools
```javascript
// Check cache status
caches.keys().then(keys => console.log('Cache keys:', keys));

// Check service worker status
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW state:', reg.active?.state);
});

// Monitor performance
performance.getEntriesByType('navigation').forEach(entry => {
  console.log('Load metrics:', {
    domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
    loadComplete: entry.loadEventEnd - entry.loadEventStart,
    totalTime: entry.loadEventEnd - entry.navigationStart
  });
});
```

## License

MIT License - lihat file LICENSE untuk detail