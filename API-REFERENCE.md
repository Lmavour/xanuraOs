# API Reference

This document provides detailed information about all available API endpoints in the Android OS Web Based Operating System.

## Table of Contents

- [System Information](#system-information)
- [File Management](#file-management)
- [Media Files](#media-files)
- [Server Control](#server-control)

## System Information

### Get System Information

```http
GET /api/system
```

**Description**: Retrieves current system information including CPU, memory, and storage details.

**Response**:
```json
{
  "cpu": {
    "manufacturer": "Intel",
    "brand": "Core i7",
    "speed": 2.8,
    "cores": 8,
    "usage": 45.2
  },
  "memory": {
    "total": 16777216000,
    "free": 8388608000,
    "used": 8388608000,
    "usage": 50.0
  },
  "storage": [
    {
      "fs": "ext4",
      "mount": "/",
      "size": 500000000000,
      "used": 250000000000,
      "available": 250000000000,
      "usage": 50.0
    }
  ],
  "os": {
    "platform": "linux",
    "distro": "Ubuntu",
    "release": "20.04",
    "arch": "x64"
  }
}
```

## File Management

### Get Directory Contents

```http
GET /api/files?path=<directory>
```

**Parameters**:
- `path` (query): Directory path to browse (default: root directory)

**Response**:
```json
{
  "currentPath": "/home/user",
  "parentPath": "/home",
  "files": [
    {
      "name": "document.txt",
      "path": "/home/user/document.txt",
      "isDirectory": false,
      "size": 1024,
      "modified": "2023-01-01T12:00:00Z",
      "type": "text"
    },
    {
      "name": "photos",
      "path": "/home/user/photos",
      "isDirectory": true,
      "size": 0,
      "modified": "2023-01-01T12:00:00Z"
    }
  ]
}
```

### Create Folder

```http
POST /api/files/folder
```

**Body**:
```json
{
  "path": "/home/user",
  "folderName": "new-folder"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Folder created successfully",
  "path": "/home/user/new-folder"
}
```

### Upload File

```http
POST /api/files/upload
```

**Content-Type**: `multipart/form-data`

**Body**:
- `file`: File to upload
- `path`: Target directory path

**Response**:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "name": "example.jpg",
    "path": "/home/user/example.jpg",
    "size": 2048576
  }
}
```

## Media Files

### Get Photos

```http
GET /api/photos?tab=<all|recent>
```

**Parameters**:
- `tab` (query): Filter photos by "all" or "recent" (default: "all")

**Response**:
```json
{
  "photos": [
    {
      "name": "photo1.jpg",
      "path": "/home/user/photos/photo1.jpg",
      "size": 2048576,
      "modified": "2023-01-01T12:00:00Z",
      "url": "/api/photos/photo1.jpg"
    }
  ],
  "total": 1
}
```

### Get Videos

```http
GET /api/videos?tab=<all|recent>
```

**Parameters**:
- `tab` (query): Filter videos by "all" or "recent" (default: "all")

**Response**:
```json
{
  "videos": [
    {
      "name": "video1.mp4",
      "path": "/home/user/videos/video1.mp4",
      "size": 10485760,
      "modified": "2023-01-01T12:00:00Z",
      "url": "/api/videos/video1.mp4"
    }
  ],
  "total": 1
}
```

### Serve Photo File

```http
GET /api/photos/<filename>
```

**Parameters**:
- `filename` (path): Name of the photo file

**Response**: Binary image file with appropriate MIME type

### Serve Video File

```http
GET /api/videos/<filename>
```

**Parameters**:
- `filename` (path): Name of the video file

**Response**: Binary video file with appropriate MIME type

## Server Control

### Restart Server

```http
POST /api/restart
```

**Description**: Gracefully restarts the server

**Response**:
```json
{
  "success": true,
  "message": "Server restart initiated"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `INVALID_PATH`: Invalid file or directory path
- `PERMISSION_DENIED`: Insufficient permissions
- `FILE_NOT_FOUND`: File or directory not found
- `UPLOAD_FAILED`: File upload failed
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse:

- System information: 1 request per 5 seconds
- File operations: 10 requests per minute
- Media serving: No limit (bandwidth throttling applies)

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## WebSocket Events

The server also provides WebSocket connections for real-time updates:

### System Updates

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:4038');

// Listen for system updates
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'system-update') {
    // Handle system information updates
    updateSystemInfo(data.payload);
  }
};
```

### File System Events

```javascript
// Listen for file system changes
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'fs-change') {
    // Handle file system changes
    handleFileSystemChange(data.payload);
  }
};
```

## SDK Examples

### JavaScript

```javascript
// Get system information
fetch('/api/system')
  .then(response => response.json())
  .then(data => console.log(data));

// Upload a file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('path', '/uploads');

fetch('/api/files/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Python

```python
import requests

# Get system information
response = requests.get('http://localhost:4038/api/system')
data = response.json()
print(data)

# Upload a file
files = {'file': open('example.jpg', 'rb')}
data = {'path': '/uploads'}
response = requests.post('http://localhost:4038/api/files/upload', files=files, data=data)
print(response.json())
```

### cURL

```bash
# Get system information
curl -X GET http://localhost:4038/api/system

# Create a folder
curl -X POST http://localhost:4038/api/files/folder \
  -H "Content-Type: application/json" \
  -d '{"path": "/home/user", "folderName": "new-folder"}'

# Upload a file
curl -X POST http://localhost:4038/api/files/upload \
  -F "file=@example.jpg" \
  -F "path=/uploads"