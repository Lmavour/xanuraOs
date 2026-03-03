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

## License

MIT License - lihat file LICENSE untuk detail