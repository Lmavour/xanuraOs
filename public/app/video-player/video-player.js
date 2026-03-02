class VideoPlayerApp {
  constructor(androidOS) {
    this.androidOS = androidOS;
  }

  async init() {
    await this.loadCSS();
    this.setupEventListeners();
    await this.loadVideoPlayer();
  }

  async loadCSS() {
    if (!document.querySelector('link[href*="video-player.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/app/video-player/video-player.css';
      document.head.appendChild(link);
    }
  }

  setupEventListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('.video-tabs .tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadVideos(tab.dataset.tab);
      });
    });

    // Modal close
    const modalClose = document.querySelector('.video-player-modal .modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeVideoPlayer());
    }

    // Close modal on background click
    const modal = document.getElementById('videoPlayerModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeVideoPlayer();
        }
      });
    }
  }

  async loadVideoPlayer() {
    this.loadVideos('all');
  }

  async loadVideos(tab) {
    try {
      const response = await fetch(`/api/videos?tab=${tab}`);
      const videos = await response.json();
      this.displayVideos(videos);
    } catch (error) {
      console.error('Error loading videos:', error);
      this.androidOS.showError('Failed to load videos');
    }
  }

  displayVideos(videos) {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';

    if (videos.length === 0) {
      videoGrid.innerHTML = '<div class="loading"><div class="loading-text">No videos found</div></div>';
      return;
    }

    videos.forEach(video => {
      const videoItem = document.createElement('div');
      videoItem.className = 'video-item';
      
      const thumbnail = document.createElement('div');
      thumbnail.className = 'video-thumbnail';
      
      const playIcon = document.createElement('div');
      playIcon.className = 'video-play-icon';
      playIcon.textContent = '▶';
      
      thumbnail.appendChild(playIcon);
      
      const videoInfo = document.createElement('div');
      videoInfo.className = 'video-info';
      
      const title = document.createElement('div');
      title.className = 'video-title';
      title.textContent = video.name;
      
      const duration = document.createElement('div');
      duration.className = 'video-duration';
      duration.textContent = this.formatDuration(video.duration) || 'Unknown';
      
      videoInfo.appendChild(title);
      videoInfo.appendChild(duration);
      
      videoItem.appendChild(thumbnail);
      videoItem.appendChild(videoInfo);
      
      videoItem.addEventListener('click', () => this.openVideoPlayer(video));
      
      videoGrid.appendChild(videoItem);
    });
  }

  openVideoPlayer(video) {
    const modal = document.getElementById('videoPlayerModal');
    const modalVideo = document.getElementById('modalVideo');
    const videoName = document.getElementById('videoName');
    const videoDetails = document.getElementById('videoDetails');

    modalVideo.src = `/api/videos/${video.name}`;
    videoName.textContent = video.name;
    videoDetails.textContent = `Size: ${this.androidOS.formatBytes(video.size)} | Modified: ${new Date(video.modified).toLocaleDateString()}`;

    modal.classList.add('active');
    modalVideo.play();
  }

  closeVideoPlayer() {
    const modal = document.getElementById('videoPlayerModal');
    const modalVideo = document.getElementById('modalVideo');
    
    modalVideo.pause();
    modalVideo.src = '';
    modal.classList.remove('active');
  }

  formatDuration(seconds) {
    if (!seconds) return null;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  getHTML() {
    return `
      <div class="app-header">
        <div class="app-title">Videos</div>
        <div class="back-btn">←</div>
      </div>
      <div class="app-content">
        <div class="video-tabs">
          <div class="tab active" data-tab="all">All Videos</div>
          <div class="tab" data-tab="recent">Recent</div>
        </div>
        <div class="video-grid" id="videoGrid">
          <div class="loading">
            <div class="spinner"></div>
            <div class="loading-text">Loading videos...</div>
          </div>
        </div>
      </div>
      <div class="video-player-modal" id="videoPlayerModal">
        <div class="modal-header">
          <div class="modal-close">✕</div>
        </div>
        <div class="modal-content">
          <video id="modalVideo" controls>
            Your browser does not support video tag.
          </video>
          <div class="video-info">
            <div class="video-name" id="videoName"></div>
            <div class="video-details" id="videoDetails"></div>
          </div>
        </div>
      </div>
    `;
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoPlayerApp;
} else {
  window.VideoPlayerApp = VideoPlayerApp;
}