# 🤖 Android OS - Web Based Operating System

A web-based Android OS interface built with Node.js and vanilla JavaScript. Features a full-screen Android-like experience with multiple apps and file management.

## 📸 Screenshots

### Desktop View
![Home Screen - Desktop](https://iili.io/qB34FMx.md.png)

### Mobile View
![Home Screen - Mobile](https://iili.io/qB36pIe.png)

## � Quick Start

### Prerequisites
- Node.js 14+ 
- Modern web browser

### Installation
1. Clone the repository
   ```bash
   git clone <repository-url>
   cd main-server
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create data directory
   ```bash
   mkdir -p ../main-data
   ```

4. Start the server
   ```bash
   npm start
   ```

5. Open your browser and go to `http://localhost:4038`

## 📱 Features

- **Android-style launcher** with app grid
- **File Explorer** - Browse, upload, and manage files
- **Photo Viewer** - View and manage your photos
- **Video Player** - Watch videos with built-in player
- **System Info** - Monitor CPU, memory, and storage
- **Responsive design** - Works on desktop and mobile
- **High-performance caching** - Sub-3 second load times with advanced caching
- **Offline capability** - Works without internet connection
- **Performance monitoring** - Real-time performance metrics

## ⚡ Performance Features

### Caching Strategy
- **Multi-layered caching** with Service Worker (STATIC_CACHE, DYNAMIC_CACHE)
- **Browser cache optimization** with Cache-Control and Expires headers
- **Cache-busting mechanism** with version control (v1.0.0)
- **Lazy loading** for wallpapers and non-critical resources
- **Preloading** for critical icons and assets

### Performance Metrics
- **Load time < 3 seconds** for optimal user experience
- **Offline-first architecture** for reliability
- **Resource optimization** with compression and minification
- **Performance monitoring** with real-time analytics

### Testing & Monitoring
- **Performance test suite** at `/performance-test.html`
- **Automated performance scoring** with recommendations
- **Real-time metrics** via `/api/analytics/metrics`
- **Cache status monitoring** via `/api/cache/status`

## 📚 Documentation

- **[Development Guide](DEVELOPMENT.md)** - How to build new apps
- **[API Reference](API-REFERENCE.md)** - API documentation
- **[Performance Guide](#performance-guide)** - Caching and optimization details

## ⚡ Performance Guide

### Browser Cache Configuration
The application implements advanced browser caching with optimal headers:

```javascript
// Static assets (1 year cache)
Cache-Control: public, max-age=31536000, immutable

// HTML files (no cache)
Cache-Control: public, max-age=0, must-revalidate

// Images (1 year cache)
Cache-Control: public, max-age=31536000, immutable
```

### Service Worker Implementation
Multi-layered caching strategy:

```javascript
// Static cache for core assets
const STATIC_CACHE = 'android-os-static-v1.0.0';

// Dynamic cache for API responses
const DYNAMIC_CACHE = 'android-os-dynamic-v1.0.0';
```

### Cache-Busting Mechanism
Version control for cache invalidation:

```html
<!-- Versioned assets -->
<link rel="stylesheet" href="/css/style.css?v=1.0.0">
<script src="/js/app.js?v=1.0.0"></script>
```

### Lazy Loading Implementation
Progressive loading for wallpapers:

```javascript
// Lazy load non-critical wallpapers
const img = new Image();
img.loading = 'lazy';
img.src = wallpaperUrl;
```

### Performance Monitoring
Real-time performance tracking:

```javascript
// Monitor load times
const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
console.log(`Page load time: ${loadTime}ms`);
```

### Testing Performance
Access the performance test suite:
```
http://localhost:4038/performance-test.html
```

Run comprehensive tests:
- Cache status verification
- Load time measurement
- Service worker functionality
- Resource loading optimization
- Performance metrics analysis

## 🛠️ Project Structure

```
public/
├── app/                    # Application modules
│   ├── system-info/        # System monitoring
│   ├── file-explorer/      # File management
│   ├── photo-viewer/       # Photo gallery
│   └── video-player/       # Video player
├── css/
│   └── style.css          # Main styles
├── js/
│   └── app.js             # Main application
└── index.html            # Entry point
```

## 🔧 Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla JavaScript
- **Styling**: CSS3
- **File Handling**: Multer
- **Caching**: Service Worker + Browser Cache
- **Performance**: Resource Optimization + Monitoring
- **Offline**: PWA capabilities

## 📞 Support

For issues and questions:
- Create a GitHub issue with detailed description
- Check the documentation for common solutions
- Run performance tests at `/performance-test.html`
- Monitor metrics at `/api/analytics/metrics`

## 🚀 Performance Tips

### For Developers
1. **Use version control** for cache-busting
2. **Implement lazy loading** for heavy resources
3. **Monitor performance** metrics regularly
4. **Test offline functionality** with Service Worker
5. **Optimize images** and use WebP format

### For Users
1. **Enable Service Worker** for offline access
2. **Check browser compatibility** for best performance
3. **Clear cache** if experiencing issues
4. **Monitor load times** via browser dev tools
5. **Report performance issues** with detailed information

---

**Built with ❤️ by xanura teams**