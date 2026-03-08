class AndroidOS {
  constructor() {
    this.currentScreen = 'home';
    this.currentApp = null;
    this.apps = {};
    this.appLoader = new AutoAppLoader(this);
    this.settings = null; // Store global settings
    this.init();
  }

  async init() {
    console.log('[PERF] AndroidOS init() started');
    const initStartTime = performance.now();
    
    this.setupEventListeners();
    this.updateClock();
    this.updateDateTime();
    setInterval(() => this.updateClock(), 1000);
    setInterval(() => this.updateDateTime(), 60000);
    
    // Preload critical icons
    this.preloadCriticalIcons();
    
    // Load app modules automatically
    this.apps = await this.appLoader.loadApps();
    console.log('[PERF] Apps loaded:', Object.keys(this.apps));
    
    // Render app grid automatically
    await this.appLoader.renderAppGrid();
    
    // Load and apply settings (including wallpaper) on page load
    await this.loadGlobalSettings();
    
    const initTime = performance.now() - initStartTime;
    console.log(`[PERF] AndroidOS init() completed in ${initTime.toFixed(2)}ms`);
    
    // Log performance warning if initialization takes too long
    if (initTime > 3000) {
      console.warn(`[PERF] Slow initialization detected: ${initTime.toFixed(2)}ms`);
    }
  }

  async loadGlobalSettings() {
    try {
      console.log('[DEBUG] Loading global settings...');
      // Fetch settings from server
      const response = await fetch('/api/settings');
      const settings = await response.json();
      
      console.log('[DEBUG] Settings received from server:', settings);
      this.settings = settings;
      
      // Apply wallpaper on page load
      if (settings.wallpaper) {
        console.log('[DEBUG] Applying wallpaper:', settings.wallpaper);
        this.applyWallpaper(settings.wallpaper);
      } else {
        console.log('[DEBUG] No wallpaper setting found, using default');
      }
      
      // Apply theme on page load
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      }
      
      console.log('[DEBUG] Global settings loaded and applied:', settings);
    } catch (error) {
      console.error('[DEBUG] Error loading global settings:', error);
    }
  }

  async applyWallpaper(wallpaperId) {
    console.log('[PERF] Applying wallpaper:', wallpaperId);
    const startTime = performance.now();
    const homeScreen = document.getElementById('homeScreen');
    const androidContainer = document.querySelector('.android-container');
    
    if (!homeScreen) {
      console.log('[PERF] Home screen element not found');
      return;
    }
    
    console.log('[PERF] Home screen element found:', homeScreen);
    
    // Predefined dynamic wallpapers (same as in SettingsApp)
    const unsplashWallpapers = {
      'unsplash-1': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      'unsplash-2': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&h=1080&fit=crop',
      'unsplash-3': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
      'unsplash-4': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&h=1080&fit=crop',
      'unsplash-5': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&h=1080&fit=crop'
    };
    
    // Remove existing wallpaper classes
    homeScreen.classList.remove('wallpaper-default', 'wallpaper-nature', 'wallpaper-city', 'wallpaper-abstract', 'wallpaper-custom');
    
    // Check if it's a dynamic wallpaper
    if (unsplashWallpapers[wallpaperId]) {
      console.log('[PERF] Applying dynamic wallpaper:', wallpaperId);
      
      // Create image element for lazy loading
      const img = new Image();
      img.loading = 'lazy';
      
      // Add cache-busting parameter
      const wallpaperUrl = `${unsplashWallpapers[wallpaperId]}?v=1.0.0`;
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        console.log(`[PERF] Dynamic wallpaper loaded in ${loadTime.toFixed(2)}ms`);
        
        homeScreen.style.backgroundImage = `url(${wallpaperUrl})`;
        homeScreen.style.backgroundSize = 'cover';
        homeScreen.style.backgroundPosition = 'center';
        homeScreen.style.backgroundAttachment = 'fixed';
        
        if (androidContainer) {
          androidContainer.style.backgroundColor = 'transparent';
        }
      };
      
      img.onerror = () => {
        const loadTime = performance.now() - startTime;
        console.error(`[PERF] Failed to load dynamic wallpaper after ${loadTime.toFixed(2)}ms`);
        
        // Fallback to default wallpaper
        homeScreen.style.backgroundImage = '';
        homeScreen.classList.add('wallpaper-default');
      };
      
      // Start loading the image
      img.src = wallpaperUrl;
      
    } else {
      console.log('[PERF] Applying static wallpaper:', wallpaperId);
      // Apply static wallpaper
      homeScreen.style.backgroundImage = '';
      homeScreen.classList.add(`wallpaper-${wallpaperId}`);
      
      if (androidContainer) {
        androidContainer.style.backgroundColor = 'transparent';
      }
      
      const loadTime = performance.now() - startTime;
      console.log(`[PERF] Static wallpaper applied in ${loadTime.toFixed(2)}ms`);
    }
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
  
  preloadCriticalIcons() {
    console.log('[PERF] Preloading critical icons...');
    const startTime = performance.now();
    
    // Critical Bootstrap icons to preload
    const criticalIcons = [
      'bi-house',
      'bi-arrow-left',
      'bi-grid-3x3-gap',
      'bi-gear',
      'bi-folder',
      'bi-image',
      'bi-play-circle',
      'bi-file-text',
      'bi-info-circle'
    ];
    
    // Create a temporary div to preload icons
    const preloadDiv = document.createElement('div');
    preloadDiv.style.position = 'absolute';
    preloadDiv.style.left = '-9999px';
    preloadDiv.style.visibility = 'hidden';
    
    criticalIcons.forEach(iconClass => {
      const iconElement = document.createElement('i');
      iconElement.className = `bi ${iconClass}`;
      preloadDiv.appendChild(iconElement);
    });
    
    document.body.appendChild(preloadDiv);
    
    // Remove the preload div after icons are loaded
    setTimeout(() => {
      document.body.removeChild(preloadDiv);
      const loadTime = performance.now() - startTime;
      console.log(`[PERF] Critical icons preloaded in ${loadTime.toFixed(2)}ms`);
    }, 1000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[PERF] DOM content loaded, initializing AndroidOS...');
  new AndroidOS();
});