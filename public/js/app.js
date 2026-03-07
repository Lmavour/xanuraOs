class AndroidOS {
  constructor() {
    this.currentScreen = 'home';
    this.currentApp = null;
    this.apps = {};
    this.appLoader = new AutoAppLoader(this);
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.updateClock();
    this.updateDateTime();
    setInterval(() => this.updateClock(), 1000);
    setInterval(() => this.updateDateTime(), 60000);
    
    // Load app modules automatically
    this.apps = await this.appLoader.loadApps();
    
    // Render app grid automatically
    await this.appLoader.renderAppGrid();
  }

  setupEventListeners() {
    // App launchers
    document.querySelectorAll('.app-item').forEach(app => {
      app.addEventListener('click', () => {
        const appName = app.dataset.app;
        this.launchApp(appName);
      });
    });

    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleNavigation(action);
      });
    });

    // Back buttons in apps
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('back-btn')) {
        this.goHome();
      }
    });
  }

  async launchApp(appName) {
    if (!this.apps[appName]) {
      this.showError(`App ${appName} not found`);
      return;
    }

    this.hideAllScreens();
    this.showAppScreen(appName);
    
    try {
      this.currentApp = this.apps[appName];
      await this.currentApp.init();
      
      // Call render if the app has this method (for apps that need additional setup after HTML is loaded)
      if (this.currentApp.render && typeof this.currentApp.render === 'function') {
        await this.currentApp.render();
      }
      
      this.currentScreen = appName;
    } catch (error) {
      console.error(`Error launching app ${appName}:`, error);
      this.showError(`Failed to launch ${appName}`);
    }
  }

  showAppScreen(appName) {
    const appContainer = document.getElementById('appContainer');
    if (!appContainer) {
      // Create app container if it doesn't exist
      const container = document.createElement('div');
      container.id = 'appContainer';
      container.className = 'screen active';
      document.querySelector('.android-container').appendChild(container);
    }
    
    const app = this.apps[appName];
    if (app && app.getHTML) {
      const appContainer = document.getElementById('appContainer');
      appContainer.innerHTML = app.getHTML();
      // Add app-specific class for styling
      appContainer.className = `screen active ${appName}`;
      
      // Load app-specific CSS
      this.loadAppCSS(appName);
    }
  }

  loadAppCSS(appName) {
    // Check if CSS is already loaded
    const existingLink = document.getElementById(`app-css-${appName}`);
    if (existingLink) {
      return; // CSS already loaded
    }
    
    // Create and append CSS link
    const link = document.createElement('link');
    link.id = `app-css-${appName}`;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `/app/${appName}/${appName}.css`;
    document.head.appendChild(link);
  }

  handleNavigation(action) {
    switch(action) {
      case 'home':
        this.goHome();
        break;
      case 'back':
        this.goBack();
        break;
      case 'apps':
        this.showAppDrawer();
        break;
    }
  }

  goHome() {
    this.hideAllScreens();
    this.showScreen('homeScreen');
    this.currentScreen = 'home';
    this.currentApp = null;
  }

  goBack() {
    if (this.currentScreen !== 'home') {
      this.goHome();
    }
  }

  showAppDrawer() {
    if (this.currentScreen === 'home') {
      this.showNotification('App drawer', 'info');
    } else {
      this.goHome();
    }
  }

  hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
  }

  showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add('active');
    }
  }

  updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    document.querySelector('.time').textContent = timeString;
    document.querySelector('.time-display').textContent = timeString;
  }

  updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('id-ID', options);
    
    document.querySelector('.date-display').textContent = dateString;
  }

  getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
      'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬',
      'mp3': '🎵', 'wav': '🎵', 'flac': '🎵',
      'pdf': '📄', 'doc': '📄', 'docx': '📄', 'txt': '📄',
      'zip': '📦', 'rar': '📦', '7z': '📦'
    };
    return iconMap[extension] || '📄';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.querySelector('.android-container').appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AndroidOS();
});