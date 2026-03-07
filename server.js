const express = require('express');
const cors = require('cors');
const path = require('path');
const si = require('systeminformation');
const fs = require('fs');
const os = require('os');
const multer = require('multer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4038;

// Setup multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '..', 'main-data'),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit
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
    const cpuTemp = await si.cpuTemperature();
    const cpuFanSpeed = await si.cpuFanSpeed();
    
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
        currentLoad: currentLoad.currentLoad,
        temperature: cpuTemp.main || 0,
        fanSpeed: cpuFanSpeed.speed || 0
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
    } else if (tab === 'favorites') {
      // Get favorites from client-side storage (this is a simplified approach)
      // In a real app, you'd store favorites server-side
      const favorites = req.query.favorites ? req.query.favorites.split(',') : [];
      photos = photos.filter(photo => favorites.includes(photo.name));
    }
    
    res.json(photos);
  } catch (error) {
    console.error('Error loading photos:', error);
    res.status(500).json({ error: 'Failed to load photos' });
  }
});

// Delete photo endpoint
app.delete('/api/photos/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const mainDataPath = path.join(__dirname, '..', 'main-data');
    const filePath = path.join(mainDataPath, filename);
    
    // Security check - ensure file is within main-data directory
    if (!filePath.startsWith(mainDataPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    fs.unlinkSync(filePath);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
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

// Notes endpoints
const notesPath = path.join(__dirname, '..', 'main-data', 'notes.json');

// Ensure notes file exists
if (!fs.existsSync(notesPath)) {
  fs.writeFileSync(notesPath, JSON.stringify([]));
}

// Get all notes
app.get('/api/notes', (req, res) => {
  try {
    if (fs.existsSync(notesPath)) {
      const notesData = fs.readFileSync(notesPath, 'utf8');
      const notes = JSON.parse(notesData);
      res.json(notes);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading notes:', error);
    res.status(500).json({ error: 'Failed to read notes' });
  }
});

// Save or update a note
app.post('/api/notes', (req, res) => {
  try {
    const note = req.body;
    let notes = [];
    
    // Read existing notes
    if (fs.existsSync(notesPath)) {
      const notesData = fs.readFileSync(notesPath, 'utf8');
      notes = JSON.parse(notesData);
    }
    
    // Find if note exists
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      // Update existing note
      notes[existingIndex] = note;
    } else {
      // Add new note
      notes.push(note);
    }
    
    // Sort by modified date (newest first)
    notes.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    // Save notes
    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
    
    res.json(note);
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    let notes = [];
    
    // Read existing notes
    if (fs.existsSync(notesPath)) {
      const notesData = fs.readFileSync(notesPath, 'utf8');
      notes = JSON.parse(notesData);
    }
    
    // Filter out the note to delete
    const filteredNotes = notes.filter(n => n.id !== noteId);
    
    // Save updated notes
    fs.writeFileSync(notesPath, JSON.stringify(filteredNotes, null, 2));
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});


// Apps endpoint - automatically discover available apps
app.get('/api/apps', (req, res) => {
  try {
    const appsDir = path.join(__dirname, 'public', 'app');
    const apps = [];
    
    if (fs.existsSync(appsDir)) {
      const appFolders = fs.readdirSync(appsDir).filter(file => {
        const appPath = path.join(appsDir, file);
        return fs.statSync(appPath).isDirectory();
      });
      
      for (const appFolder of appFolders) {
        const appConfigPath = path.join(appsDir, appFolder, 'app.json');
        if (fs.existsSync(appConfigPath)) {
          try {
            const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
            apps.push({
              id: appFolder,
              ...appConfig
            });
          } catch (err) {
            console.error(`Error reading app config for ${appFolder}:`, err);
          }
        }
      }
    }
    
    res.json(apps);
  } catch (error) {
    console.error('Error discovering apps:', error);
    res.status(500).json({ error: 'Failed to discover apps' });
  }
});

// Settings endpoints
const settingsPath = path.join(__dirname, '..', 'main-data', 'settings.json');

// Ensure settings file exists
if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(settingsPath, JSON.stringify({
    theme: 'light',
    language: 'id-ID',
    notifications: true,
    autoSave: true,
    fontSize: 'medium',
    animationSpeed: 'normal'
  }));
}

// Get settings
app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(settingsData);
      res.json(settings);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

// Save settings
app.post('/api/settings', (req, res) => {
  try {
    const settings = req.body;
    
    // Save settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});


// TikTok Downloader endpoints

// Get TikTok video info
app.post('/api/tiktok/info', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate TikTok URL
    if (!url.includes('tiktok.com')) {
      return res.status(400).json({ error: 'Invalid TikTok URL' });
    }
    
    // Generate random video data for demonstration
    const randomId = Math.floor(Math.random() * 1000000);
    const mockVideoData = {
      id: 'video_' + Date.now(),
      title: `Amazing TikTok Video #${randomId}`,
      author: `TikTok User ${randomId}`,
      authorAvatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      thumbnail: 'https://placehold.co/600x800/ff0050/ffffff?text=TikTok+Video',
      duration: '0:' + (15 + Math.floor(Math.random() * 45)),
      likes: Math.floor(Math.random() * 1000000).toLocaleString(),
      comments: Math.floor(Math.random() * 10000).toLocaleString(),
      shares: Math.floor(Math.random() * 50000).toLocaleString(),
      description: `This is an amazing TikTok video that you'll love! Check out this awesome content from TikTok User ${randomId}.`,
      downloadOptions: [
        { quality: 'HD (1080p)', size: '15-25 MB', url: '#', type: 'video/mp4' },
        { quality: 'SD (720p)', size: '5-10 MB', url: '#', type: 'video/mp4' },
        { quality: 'Audio Only', size: '2-3 MB', url: '#', type: 'audio/mp3' }
      ]
    };
    
    res.json(mockVideoData);
  } catch (error) {
    console.error('Error fetching TikTok info:', error);
    res.status(500).json({ error: 'Failed to fetch TikTok video information' });
  }
});

// Download TikTok video
app.post('/api/tiktok/download', async (req, res) => {
  try {
    const { url, quality } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // In a real implementation, you would:
    // 1. Fetch the video from TikTok
    // 2. Process it (remove watermark, convert format, etc.)
    // 3. Stream it back to the client
    
    // For now, we'll return a mock download URL
    const mockDownloadUrl = `/api/tiktok/mock-download?url=${encodeURIComponent(url)}&quality=${quality}`;
    
    res.json({
      downloadUrl: mockDownloadUrl,
      filename: `tiktok_video_${Date.now()}.mp4`,
      size: quality === 'HD' ? '25 MB' : '10 MB',
      message: 'Video ready for download'
    });
  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    res.status(500).json({ error: 'Failed to download TikTok video' });
  }
});

// Mock download endpoint (serves a sample video)
app.get('/api/tiktok/mock-download', (req, res) => {
  // In a real implementation, you would serve the actual downloaded video
  // For now, we'll redirect to a sample video
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Home Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access locally at: http://localhost:${PORT}`);
  console.log(`Access on network at: http://192.168.0.50:${PORT}`);
});