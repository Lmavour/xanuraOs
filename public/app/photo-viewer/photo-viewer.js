class PhotoViewerApp {
  constructor(androidOS) {
    this.androidOS = androidOS;
  }

  async init() {
    await this.loadCSS();
    this.setupEventListeners();
    await this.loadPhotoViewer();
  }

  async loadCSS() {
    if (!document.querySelector('link[href*="photo-viewer.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/app/photo-viewer/photo-viewer.css';
      document.head.appendChild(link);
    }
  }

  setupEventListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('.photo-tabs .tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadPhotos(tab.dataset.tab);
      });
    });

    // Modal close
    const modalClose = document.querySelector('.photo-viewer-modal .modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closePhotoViewer());
    }

    // Close modal on background click
    const modal = document.getElementById('photoViewerModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closePhotoViewer();
        }
      });
    }
  }

  async loadPhotoViewer() {
    this.loadPhotos('all');
  }

  async loadPhotos(tab) {
    try {
      const response = await fetch(`/api/photos?tab=${tab}`);
      const photos = await response.json();
      this.displayPhotos(photos);
    } catch (error) {
      console.error('Error loading photos:', error);
      this.androidOS.showError('Failed to load photos');
    }
  }

  displayPhotos(photos) {
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';

    if (photos.length === 0) {
      photoGrid.innerHTML = '<div class="loading"><div class="loading-text">No photos found</div></div>';
      return;
    }

    photos.forEach(photo => {
      const photoItem = document.createElement('div');
      photoItem.className = 'photo-item';
      
      const img = document.createElement('img');
      img.src = `/api/photos/${photo.name}`;
      img.alt = photo.name;
      img.loading = 'lazy';
      
      photoItem.appendChild(img);
      photoItem.addEventListener('click', () => this.openPhotoViewer(photo));
      
      photoGrid.appendChild(photoItem);
    });
  }

  openPhotoViewer(photo) {
    const modal = document.getElementById('photoViewerModal');
    const modalImage = document.getElementById('modalImage');
    const photoName = document.getElementById('photoName');
    const photoDetails = document.getElementById('photoDetails');

    modalImage.src = `/api/photos/${photo.name}`;
    photoName.textContent = photo.name;
    photoDetails.textContent = `Size: ${this.androidOS.formatBytes(photo.size)} | Modified: ${new Date(photo.modified).toLocaleDateString()}`;

    modal.classList.add('active');
  }

  closePhotoViewer() {
    const modal = document.getElementById('photoViewerModal');
    modal.classList.remove('active');
  }

  getHTML() {
    return `
      <div class="app-header">
        <div class="app-title">Photos</div>
        <div class="back-btn">←</div>
      </div>
      <div class="app-content">
        <div class="photo-tabs">
          <div class="tab active" data-tab="all">All Photos</div>
          <div class="tab" data-tab="recent">Recent</div>
        </div>
        <div class="photo-grid" id="photoGrid">
          <div class="loading">
            <div class="spinner"></div>
            <div class="loading-text">Loading photos...</div>
          </div>
        </div>
      </div>
      <div class="photo-viewer-modal" id="photoViewerModal">
        <div class="modal-header">
          <div class="modal-close">✕</div>
        </div>
        <div class="modal-content">
          <img id="modalImage" src="" alt="">
          <div class="photo-info">
            <div class="photo-name" id="photoName"></div>
            <div class="photo-details" id="photoDetails"></div>
          </div>
        </div>
      </div>
    `;
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhotoViewerApp;
} else {
  window.PhotoViewerApp = PhotoViewerApp;
}