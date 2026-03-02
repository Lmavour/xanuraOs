class FileExplorerApp {
  constructor(androidOS) {
    this.androidOS = androidOS;
    this.currentPath = '';
  }

  async init() {
    await this.loadCSS();
    this.setupEventListeners();
    await this.loadFileExplorer();
  }

  async loadCSS() {
    if (!document.querySelector('link[href*="file-explorer.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/app/file-explorer/file-explorer.css';
      document.head.appendChild(link);
    }
  }

  setupEventListeners() {
    // Create folder button
    const createFolderBtn = document.getElementById('createFolderBtn');
    if (createFolderBtn) {
      createFolderBtn.addEventListener('click', () => this.createFolder());
    }

    // File upload
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
      fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
    }
  }

  async loadFileExplorer(path = '') {
    try {
      this.currentPath = path;
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      this.displayFiles(data.files);
      this.updateBreadcrumb(path);
    } catch (error) {
      console.error('Error loading files:', error);
      this.androidOS.showError('Gagal memuat file');
    }
  }

  displayFiles(files) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    if (files.length === 0) {
      fileList.innerHTML = '<div class="loading"><div class="loading-text">Tidak ada file</div></div>';
      return;
    }

    files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      
      const fileIcon = document.createElement('div');
      fileIcon.className = 'file-icon';
      fileIcon.textContent = file.isDirectory ? '📁' : this.androidOS.getFileIcon(file.name);
      
      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info';
      
      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.textContent = file.name;
      
      const fileSize = document.createElement('div');
      fileSize.className = 'file-size';
      fileSize.textContent = file.isDirectory ? 'Folder' : this.androidOS.formatBytes(file.size);
      
      fileInfo.appendChild(fileName);
      fileInfo.appendChild(fileSize);
      
      fileItem.appendChild(fileIcon);
      fileItem.appendChild(fileInfo);
      
      fileItem.addEventListener('click', () => {
        this.handleFileClick(file);
      });
      
      fileList.appendChild(fileItem);
    });
  }

  handleFileClick(file) {
    if (file.isDirectory) {
      // Navigate into folder
      this.loadFileExplorer(file.path);
    } else {
      // Handle file click
      this.androidOS.showNotification(`File: ${file.name}`, 'info');
    }
  }

  async createFolder() {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const response = await fetch('/api/files/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: folderName, currentPath: this.currentPath })
      });

      if (response.ok) {
        this.androidOS.showSuccess('Folder created successfully');
        this.loadFileExplorer(this.currentPath);
      } else {
        this.androidOS.showError('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      this.androidOS.showError('Failed to create folder');
    }
  }

  async handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.querySelector('.progress-percent');

    uploadProgress.style.display = 'block';

    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('currentPath', this.currentPath);

      try {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progressFill.style.width = percentComplete + '%';
            progressPercent.textContent = Math.round(percentComplete) + '%';
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            this.androidOS.showSuccess(`${file.name} uploaded successfully`);
          } else {
            this.androidOS.showError(`Failed to upload ${file.name}`);
          }
        });

        xhr.addEventListener('error', () => {
          this.androidOS.showError(`Failed to upload ${file.name}`);
        });

        xhr.open('POST', '/api/files/upload');
        xhr.send(formData);
      } catch (error) {
        console.error('Error uploading file:', error);
        this.androidOS.showError(`Failed to upload ${file.name}`);
      }
    }

    // Reset progress after a delay
    setTimeout(() => {
      uploadProgress.style.display = 'none';
      progressFill.style.width = '0%';
      progressPercent.textContent = '0%';
      this.loadFileExplorer(this.currentPath);
    }, 2000);

    // Reset file input
    event.target.value = '';
  }

  updateBreadcrumb(path) {
    const breadcrumbNav = document.getElementById('breadcrumbNav');
    breadcrumbNav.innerHTML = '';

    // Add main-data root
    const rootItem = document.createElement('span');
    rootItem.className = 'breadcrumb-item';
    rootItem.textContent = 'main-data';
    rootItem.dataset.path = '';
    rootItem.addEventListener('click', () => this.loadFileExplorer(''));
    breadcrumbNav.appendChild(rootItem);

    if (path) {
      const pathParts = path.split('/');
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        const separator = document.createElement('span');
        separator.textContent = '/';
        breadcrumbNav.appendChild(separator);
        
        const item = document.createElement('span');
        item.className = 'breadcrumb-item';
        item.textContent = part;
        item.dataset.path = currentPath;
        item.addEventListener('click', () => this.loadFileExplorer(currentPath));
        breadcrumbNav.appendChild(item);
      });
    }
  }

  getHTML() {
    return `
      <div class="app-header">
        <div class="app-title">File Explorer</div>
        <div class="back-btn">←</div>
      </div>
      <div class="app-content">
        <div class="breadcrumb">
          <div class="breadcrumb-nav" id="breadcrumbNav">
            <span class="breadcrumb-item" data-path="">main-data</span>
          </div>
        </div>
        <div class="file-actions">
          <button class="action-btn" id="createFolderBtn">
            <span class="btn-icon">📁</span>
            <span class="btn-text">New Folder</span>
          </button>
          <label class="action-btn" for="fileUpload">
            <span class="btn-icon">📤</span>
            <span class="btn-text">Upload</span>
          </label>
          <input type="file" id="fileUpload" multiple style="display: none;">
        </div>
        <div class="file-list" id="fileList">
          <div class="loading">
            <div class="spinner"></div>
            <div class="loading-text">Loading files...</div>
          </div>
        </div>
        <div class="upload-progress" id="uploadProgress" style="display: none;">
          <div class="progress-info">
            <span class="progress-text">Uploading...</span>
            <span class="progress-percent">0%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
        </div>
      </div>
    `;
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileExplorerApp;
} else {
  window.FileExplorerApp = FileExplorerApp;
}