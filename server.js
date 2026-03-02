const express = require('express');
const cors = require('cors');
const path = require('path');
const si = require('systeminformation');
const fs = require('fs');
const os = require('os');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4038;

// Setup multer for file uploads
const upload = multer({ 
  dest: path.join(__dirname, '..', 'main-data'),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files from main-data directory
app.use('/api/photos', express.static(path.join(__dirname, '..', 'main-data')));
app.use('/api/videos', express.static(path.join(__dirname, '..', 'main-data')));

// System information endpoint
app.get('/api/system', async (req, res) => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const osInfo = await si.osInfo();
    const currentLoad = await si.currentLoad();
    const networkStats = await si.networkStats();
    const diskLayout = await si.diskLayout();
    const fsSize = await si.fsSize();
    
    // Calculate uptime in human readable format
    const uptime = process.uptime();
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    
    res.json({
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed,
        currentLoad: currentLoad.currentLoad
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname
      },
      network: networkStats.map(net => ({
        iface: net.iface,
        rx_bytes: net.rx_bytes,
        tx_bytes: net.tx_bytes,
        rx_sec: net.rx_sec,
        tx_sec: net.tx_sec
      })),
      storage: {
        diskLayout: diskLayout.map(disk => ({
          device: disk.device,
          type: disk.type,
          size: disk.size,
          interfaceType: disk.interfaceType
        })),
        fsSize: fsSize.map(fs => ({
          fs: fs.fs,
          type: fs.type,
          size: fs.size,
          used: fs.used,
          available: fs.available,
          usePercent: fs.use
        }))
      },
      uptime: {
        days,
        hours,
        minutes,
        formatted: `${days}d ${hours}h ${minutes}m`
      }
    });
  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

// Files endpoint for File Explorer
app.get('/api/files', (req, res) => {
  try {
    const { path: folderPath = '' } = req.query;
    const mainDataPath = path.join(__dirname, '..', 'main-data');
    const currentPath = path.join(mainDataPath, folderPath);
    
    // Security check - ensure we're still within main-data
    if (!currentPath.startsWith(mainDataPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if directory exists
    if (!fs.existsSync(currentPath)) {
      return res.json([]);
    }
    
    // Read directory contents
    const files = fs.readdirSync(currentPath);
    const fileList = files.map(fileName => {
      const filePath = path.join(currentPath, fileName);
      const stats = fs.statSync(filePath);
      
      return {
        name: fileName,
        size: stats.size,
        isDirectory: stats.isDirectory(),
        modified: stats.mtime,
        path: folderPath ? `${folderPath}/${fileName}` : fileName
      };
    });
    
    // Sort by name, directories first
    fileList.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    res.json({
      files: fileList,
      currentPath: folderPath,
      parentPath: folderPath ? folderPath.split('/').slice(0, -1).join('/') : null
    });
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Create folder endpoint
app.post('/api/files/folder', (req, res) => {
  try {
    const { name, currentPath = '' } = req.body;
    const mainDataPath = path.join(__dirname, '..', 'main-data');
    const basePath = path.join(mainDataPath, currentPath);
    const folderPath = path.join(basePath, name);
    
    // Security check
    if (!basePath.startsWith(mainDataPath) || !folderPath.startsWith(mainDataPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (fs.existsSync(folderPath)) {
      return res.status(400).json({ error: 'Folder already exists' });
    }
    
    fs.mkdirSync(folderPath);
    res.json({ message: 'Folder created successfully' });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Upload file endpoint
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const currentPath = req.body.currentPath || '';
    const mainDataPath = path.join(__dirname, '..', 'main-data');
    const basePath = path.join(mainDataPath, currentPath);
    const tempPath = req.file.path;
    const targetPath = path.join(basePath, req.file.originalname);
    
    // Security check
    if (!basePath.startsWith(mainDataPath) || !targetPath.startsWith(mainDataPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Move file from temp location to target directory
    fs.renameSync(tempPath, targetPath);
    
    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Photos endpoint
app.get('/api/photos', (req, res) => {
  try {
    const { tab } = req.query;
    const mainDataPath = path.join(__dirname, '..', 'main-data');
    
    if (!fs.existsSync(mainDataPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(mainDataPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    
    let photos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(fileName => {
        const filePath = path.join(mainDataPath, fileName);
        const stats = fs.statSync(filePath);
        
        return {
          name: fileName,
          size: stats.size,
          modified: stats.mtime
        };
      });
    
    // Sort by modification date, newest first
    photos.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    // Filter by tab if specified
    if (tab === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      photos = photos.filter(photo => new Date(photo.modified) > oneWeekAgo);
    }
    
    res.json(photos);
  } catch (error) {
    console.error('Error loading photos:', error);
    res.status(500).json({ error: 'Failed to load photos' });
  }
});

// Videos endpoint
app.get('/api/videos', (req, res) => {
  try {
    const { tab } = req.query;
    const mainDataPath = path.join(__dirname, '..', 'main-data');
    
    if (!fs.existsSync(mainDataPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(mainDataPath);
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'];
    
    let videos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
      })
      .map(fileName => {
        const filePath = path.join(mainDataPath, fileName);
        const stats = fs.statSync(filePath);
        
        return {
          name: fileName,
          size: stats.size,
          modified: stats.mtime,
          duration: null // Could be enhanced with video metadata extraction
        };
      });
    
    // Sort by modification date, newest first
    videos.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    // Filter by tab if specified
    if (tab === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      videos = videos.filter(video => new Date(video.modified) > oneWeekAgo);
    }
    
    res.json(videos);
  } catch (error) {
    console.error('Error loading videos:', error);
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

// Restart server endpoint
app.post('/api/restart', (req, res) => {
  res.json({ message: 'Server restarting...' });
  
  // Graceful restart
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Home Server running on http://localhost:${PORT}`);
});