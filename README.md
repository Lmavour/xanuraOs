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

## 📚 Documentation

- **[Development Guide](DEVELOPMENT.md)** - How to build new apps
- **[API Reference](API-REFERENCE.md)** - API documentation

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

## 📞 Support

For issues and questions:
- Create a GitHub issue with detailed description
- Check the documentation for common solutions

---

**Built with ❤️ by xanura teams**