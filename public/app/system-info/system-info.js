class SystemInfoApp {
  constructor(androidOS) {
    this.androidOS = androidOS;
    this.systemData = null;
  }

  async init() {
    await this.loadCSS();
    await this.loadSystemInfo();
  }

  async loadCSS() {
    if (!document.querySelector('link[href*="system-info.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/app/system-info/system-info.css';
      document.head.appendChild(link);
    }
  }

  async loadSystemInfo() {
    try {
      const response = await fetch('/api/system');
      this.systemData = await response.json();
      this.updateSystemInfoUI();
    } catch (error) {
      console.error('Error loading system info:', error);
      this.androidOS.showError('Gagal memuat informasi sistem');
    }
  }

  updateSystemInfoUI() {
    if (!this.systemData || !this.systemData.cpu) return;

    // Update CPU info
    this.updateCard('cpu', [
      { label: 'Processor', value: `${this.systemData.cpu.brand || 'Unknown'}` },
      { label: 'Core', value: `${this.systemData.cpu.cores || 0} core` },
      { label: 'Kecepatan', value: `${this.systemData.cpu.speed || 0} GHz` },
      { label: 'Suhu', value: `${this.systemData.cpu.temperature || 0}°C` },
      { label: 'Kipas (RPM)', value: this.systemData.cpu.fanSpeed ? `${this.systemData.cpu.fanSpeed} RPM` : 'Tidak tersedia' },
      { label: 'Pemakaian', value: `${(this.systemData.cpu.currentLoad || 0).toFixed(2)}%` }
    ], this.systemData.cpu.currentLoad || 0);

    // Update Memory info
    this.updateCard('memory', [
      { label: 'Total RAM', value: this.androidOS.formatBytes(this.systemData.memory.total) },
      { label: 'Digunakan', value: this.androidOS.formatBytes(this.systemData.memory.used) },
      { label: 'Tersedia', value: this.androidOS.formatBytes(this.systemData.memory.free) },
      { label: 'Pemakaian', value: `${this.systemData.memory.usagePercent}%` }
    ], this.systemData.memory.usagePercent);

    // Update Storage info
    const storageInfo = this.systemData.storage.fsSize[0];
    if (storageInfo) {
      this.updateCard('storage', [
        { label: 'Total', value: this.androidOS.formatBytes(storageInfo.size) },
        { label: 'Digunakan', value: this.androidOS.formatBytes(storageInfo.used) },
        { label: 'Tersedia', value: this.androidOS.formatBytes(storageInfo.available) },
        { label: 'Tipe', value: storageInfo.type }
      ], storageInfo.use);
    }
  }

  updateCard(cardId, items, progressPercent = null) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const contentDiv = card.querySelector('.card-content');
    contentDiv.innerHTML = '';

    items.forEach(item => {
      const infoItem = document.createElement('div');
      infoItem.className = 'info-item';
      
      const label = document.createElement('span');
      label.className = 'info-label';
      label.textContent = item.label;
      
      const value = document.createElement('span');
      value.className = 'info-value';
      value.textContent = item.value;
      
      infoItem.appendChild(label);
      infoItem.appendChild(value);
      contentDiv.appendChild(infoItem);
    });

    // Add progress bar if percentage is provided
    if (progressPercent !== null) {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-bar';
      
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
      
      progressContainer.appendChild(progressFill);
      contentDiv.appendChild(progressContainer);
    }
  }

  getHTML() {
    return `
      <div class="app-header">
        <div class="app-title">System Information</div>
        <div class="back-btn">←</div>
      </div>
      <div class="app-content">
        <div class="dashboard">
          <!-- CPU Card -->
          <div class="card" id="cpu">
            <h3>
              <div class="icon">💻</div>
              CPU
            </h3>
            <div class="card-content">
              <div class="loading">
                <div class="spinner"></div>
                <div class="loading-text">Loading...</div>
              </div>
            </div>
          </div>

          <!-- Memory Card -->
          <div class="card" id="memory">
            <h3>
              <div class="icon">🧠</div>
              Memory
            </h3>
            <div class="card-content">
              <div class="loading">
                <div class="spinner"></div>
                <div class="loading-text">Loading...</div>
              </div>
            </div>
          </div>

          <!-- Storage Card -->
          <div class="card" id="storage">
            <h3>
              <div class="icon">💾</div>
              Storage
            </h3>
            <div class="card-content">
              <div class="loading">
                <div class="spinner"></div>
                <div class="loading-text">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SystemInfoApp;
} else {
  window.SystemInfoApp = SystemInfoApp;
}