# 🤖 Android OS - Web Based Operating System

A modular, web-based Android OS interface built with Node.js, Express, and vanilla JavaScript. Features a full-screen Android-like experience with multiple apps, file management, and media viewing capabilities.

## 📚 Documentation

- **[Development Guide](DEVELOPMENT.md)** - Complete guide for developing new applications
- **[API Reference](API-REFERENCE.md)** - Available APIs for application development

## � Screenshots

### Desktop View
![Home Screen - Desktop](https://iili.io/qB34FMx.md.png)

### Mobile View
![Home Screen - Mobile](https://iili.io/qB36pIe.png)

### Application Screenshots

#### File Explorer
- Full folder navigation with breadcrumb trail
- File upload with progress tracking
- Create folders and manage files

#### Photo Viewer
- Grid layout with lazy loading
- Modal viewer with zoom capabilities
- Tab filtering (All Photos, Recent)

#### Video Player
- HTML5 video player with controls
- Video gallery with metadata
- Responsive design for all devices

#### System Info
- Real-time system monitoring
- CPU, Memory, and Storage information
- Visual progress bars and charts

## 🚀 Features

### 🏠 Home Screen
- **Android-style launcher** with app grid
- **Real-time clock** with date display
- **Widget system** for quick information
- **Smooth navigation** between apps

### 📱 Applications

#### 1. System Info 💻
- Real-time CPU monitoring with usage percentage
- Memory usage with visual progress bars
- Storage information with file system details
- Auto-refresh every 5 seconds

#### 2. File Explorer 📁
- **Full folder navigation** with breadcrumb trail
- **Create folders** in any directory
- **Upload files** with progress tracking
- **File type detection** with appropriate icons
- **Directory traversal** with security validation

#### 3. Photos 🖼️
- **Gallery view** with grid layout
- **Tab system** (All Photos, Recent)
- **Modal viewer** with zoom capabilities
- **Lazy loading** for performance
- **Metadata display** (size, date modified)

#### 4. Videos 🎬
- **Video gallery** with thumbnail placeholders
- **HTML5 video player** with full controls
- **Tab filtering** (All Videos, Recent)
- **Responsive design** for all screen sizes
- **Video metadata** display

## 🏗️ Architecture

### 📁 Modular Structure
```
public/
├── app/                    # Modular applications
│   ├── system-info/        # System monitoring app
│   ├── file-explorer/      # File management app
│   ├── photo-viewer/       # Photo gallery app
│   └── video-player/       # Video player app
├── css/
│   └── style.css          # Main styles
├── js/
│   └── app.js             # Main application loader
└── index.html            # Entry point
```

### 🔧 Technology Stack
- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with Flexbox/Grid
- **File Handling**: Multer for uploads
- **System Info**: systeminformation library
- **Architecture**: Modular design pattern

## 🛠️ Installation

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Modern web browser

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd main-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create data directory**
   ```bash
   mkdir -p ../main-data
   ```

4. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

5. **Access the application**
   ```
   Open http://localhost:4038 in your browser
   ```

## 📁 File Structure

### Main Components
- **`server.js`** - Express server with API endpoints
- **`public/index.html`** - Main HTML structure
- **`public/js/app.js`** - Application loader and navigation
- **`public/css/style.css`** - Global styles and layout

### App Modules
Each app is self-contained with:
- **JavaScript module** (`app-name.js`)
- **CSS styles** (`app-name.css`)
- **HTML template** (via `getHTML()` method)
- **Independent functionality** and styling

## 🔌 API Endpoints

### System Information
```http
GET /api/system
```
Returns CPU, memory, storage, and system information.

### File Management
```http
GET /api/files?path=<directory>
POST /api/files/folder
POST /api/files/upload
```
Handle file browsing, folder creation, and file uploads.

### Media Files
```http
GET /api/photos?tab=<all|recent>
GET /api/videos?tab=<all|recent>
GET /api/photos/<filename>
GET /api/videos/<filename>
```
Serve and manage media files.

### Server Control
```http
POST /api/restart
```
Gracefully restart the server.

## 🎨 Customization

### Adding New Apps
1. **Create app directory** in `public/app/`
2. **Create JavaScript module** with class structure
3. **Create CSS file** for app-specific styling
4. **Add app to home screen** in `index.html`
5. **Register in main app.js** loader

### Styling
- **Global styles** in `public/css/style.css`
- **App-specific styles** in respective app CSS files
- **Android Material Design** principles followed
- **Responsive design** for all screen sizes

## 🔧 Configuration

### Environment Variables
```bash
PORT=4038                    # Server port
NODE_ENV=development          # Environment mode
```

### File Storage
- **Default data directory**: `../main-data`
- **Upload limit**: 100MB per file
- **Supported formats**: Images, videos, documents

## 🚀 Performance

### Optimization Features
- **Lazy loading** for images and videos
- **Modular loading** - CSS loaded on-demand
- **Efficient DOM manipulation**
- **Memory management** for large file lists
- **Responsive images** with proper sizing

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🛡️ Security

### Features
- **Path validation** for file access
- **Directory traversal protection**
- **File type restrictions**
- **Upload size limits**
- **XSS protection** in file rendering

## 🐛 Troubleshooting

### Common Issues

#### Server Won't Start
```bash
# Check if port is in use
lsof -i :4038

# Kill existing process
pkill -f "node server.js"
```

#### File Upload Issues
- Check `../main-data` directory permissions
- Verify disk space availability
- Check file size limits

#### App Loading Problems
- Check browser console for errors
- Verify file paths in app modules
- Clear browser cache

### Debug Mode
```bash
DEBUG=* node server.js
```

## 🤝 Contributing

### Development Workflow
1. **Fork the repository**
2. **Create feature branch**
3. **Make changes** with proper testing
4. **Submit pull request** with description

### Code Style
- **ES6+ JavaScript** with proper class structure
- **Modular CSS** with scoped styles
- **Semantic HTML5** structure
- **Consistent naming** conventions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Android Material Design** guidelines
- **systeminformation** library for system stats
- **Multer** for file upload handling
- **Express.js** framework for backend

## 📞 Support

For issues and questions:
- **GitHub Issues**: Create new issue with detailed description
- **Documentation**: Check this README and inline comments
- **Community**: Join discussions for feature requests

---

**Built with ❤️ by xanura teams**