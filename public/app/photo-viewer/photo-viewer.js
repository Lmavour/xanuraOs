class PhotoViewerApp {
  constructor(androidOS) {
    this.androidOS = androidOS;
    this.currentPhoto = null;
    this.favorites = JSON.parse(localStorage.getItem('favoritePhotos') || '[]');
  }

  async init() {
    await this.loadCSS();
    this.setupEventListeners();
    await this.loadPhotoViewer();
    this.loadSavedPreferences();
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

    // Search functionality
    const searchInput = document.getElementById('photoSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchPhotos(e.target.value);
      });
    }

    // Grid view options
    const gridOptions = document.querySelectorAll('.grid-option');
    gridOptions.forEach(option => {
      option.addEventListener('click', () => {
        gridOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        this.changeGridView(option.dataset.columns);
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

    // Photo action buttons
    const favoriteBtn = document.querySelector('.favorite-btn');
    const downloadBtn = document.querySelector('.download-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => this.toggleFavorite());
    }
    
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadPhoto());
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deletePhoto());
    }
  }

  async loadPhotoViewer() {
    this.loadPhotos('all');
  }

  async loadPhotos(tab) {
    this.currentTab = tab;
    try {
      let url = `/api/photos?tab=${tab}`;
      
      // Add favorites to query if favorites tab
      if (tab === 'favorites') {
        url += `&favorites=${this.favorites.join(',')}`;
      }
      
      const response = await fetch(url);
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
      
      // Add favorite indicator
      if (this.favorites.includes(photo.name)) {
        const favoriteIndicator = document.createElement('div');
        favoriteIndicator.className = 'favorite-indicator';
        favoriteIndicator.innerHTML = '⭐';
        photoItem.appendChild(favoriteIndicator);
      }
      
      photoItem.appendChild(img);
      photoItem.addEventListener('click', () => this.openPhotoViewer(photo));
      
      photoGrid.appendChild(photoItem);
    });
  }

  openPhotoViewer(photo) {
    this.currentPhoto = photo;
    const modal = document.getElementById('photoViewerModal');
    const modalImage = document.getElementById('modalImage');
    const photoName = document.getElementById('photoName');
    const photoDetails = document.getElementById('photoDetails');
    const favoriteBtn = document.querySelector('.favorite-btn');

    modalImage.src = `/api/photos/${photo.name}`;
    photoName.textContent = photo.name;
    photoDetails.textContent = `Size: ${this.androidOS.formatBytes(photo.size)} | Modified: ${new Date(photo.modified).toLocaleDateString()}`;

    // Update favorite button state
    const isFavorite = this.favorites.includes(photo.name);
    favoriteBtn.classList.toggle('active', isFavorite);
    favoriteBtn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';

    modal.classList.add('active');
  }

  closePhotoViewer() {
    const modal = document.getElementById('photoViewerModal');
    modal.classList.remove('active');
  }

  async searchPhotos(query) {
    if (!query) {
      this.loadPhotos(this.currentTab || 'all');
      return;
    }

    try {
      const response = await fetch(`/api/photos?tab=${this.currentTab || 'all'}`);
      const photos = await response.json();
      
      const filteredPhotos = photos.filter(photo =>
        photo.name.toLowerCase().includes(query.toLowerCase())
      );
      
      this.displayPhotos(filteredPhotos);
    } catch (error) {
      console.error('Error searching photos:', error);
      this.androidOS.showError('Failed to search photos');
    }
  }

  changeGridView(columns) {
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // Save preference
    localStorage.setItem('photoGridColumns', columns);
  }

  loadSavedPreferences() {
    const savedColumns = localStorage.getItem('photoGridColumns');
    if (savedColumns) {
      this.changeGridView(savedColumns);
      // Update active state in UI
      document.querySelectorAll('.grid-option').forEach(option => {
        option.classList.toggle('active', option.dataset.columns === savedColumns);
      });
    }
  }

  toggleFavorite() {
    if (!this.currentPhoto) return;
    
    const index = this.favorites.indexOf(this.currentPhoto.name);
    const favoriteBtn = document.querySelector('.favorite-btn');
    
    if (index > -1) {
      // Remove from favorites
      this.favorites.splice(index, 1);
      favoriteBtn.classList.remove('active');
      favoriteBtn.title = 'Add to favorites';
      this.androidOS.showSuccess('Removed from favorites');
    } else {
      // Add to favorites
      this.favorites.push(this.currentPhoto.name);
      favoriteBtn.classList.add('active');
      favoriteBtn.title = 'Remove from favorites';
      this.androidOS.showSuccess('Added to favorites');
    }
    
    // Save to localStorage
    localStorage.setItem('favoritePhotos', JSON.stringify(this.favorites));
    
    // Refresh the current view to update favorite indicators
    this.loadPhotos(this.currentTab || 'all');
  }

  downloadPhoto() {
    if (!this.currentPhoto) return;
    
    const link = document.createElement('a');
    link.href = `/api/photos/${this.currentPhoto.name}`;
    link.download = this.currentPhoto.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.androidOS.showSuccess('Download started');
  }

  async deletePhoto() {
    if (!this.currentPhoto) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${this.currentPhoto.name}?`);
    if (!confirmed) return;
    
    try {
      const response = await fetch(`/api/photos/${this.currentPhoto.name}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from favorites if it was there
        const index = this.favorites.indexOf(this.currentPhoto.name);
        if (index > -1) {
          this.favorites.splice(index, 1);
          localStorage.setItem('favoritePhotos', JSON.stringify(this.favorites));
        }
        
        this.androidOS.showSuccess('Photo deleted successfully');
        this.closePhotoViewer();
        this.loadPhotos(this.currentTab || 'all');
      } else {
        this.androidOS.showError('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      this.androidOS.showError('Failed to delete photo');
    }
  }

  getHTML() {
    return `
      <div class="app-header">
        <div class="app-title">Photos</div>
        <div class="back-btn">←</div>
      </div>
      <div class="app-content">
        <div class="photo-controls">
          <div class="search-container">
            <input type="text" id="photoSearch" placeholder="Search photos..." class="search-input">
            <div class="search-icon">🔍</div>
          </div>
          <div class="grid-options">
            <div class="grid-option" data-columns="2" title="2 columns">⚏</div>
            <div class="grid-option active" data-columns="3" title="3 columns">⚎</div>
            <div class="grid-option" data-columns="4" title="4 columns">⚏</div>
            <div class="grid-option" data-columns="5" title="5 columns">⚎</div>
          </div>
        </div>
        <div class="photo-tabs">
          <div class="tab active" data-tab="all">All Photos</div>
          <div class="tab" data-tab="recent">Recent</div>
          <div class="tab" data-tab="favorites">Favorites</div>
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
            <div class="photo-actions">
              <button class="action-btn favorite-btn" title="Add to favorites">⭐</button>
              <button class="action-btn download-btn" title="Download">⬇️</button>
              <button class="action-btn delete-btn" title="Delete">🗑️</button>
            </div>
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