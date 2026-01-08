# File Upload System

Dokumentation für das File-Upload-System mit S3-Integration.

## Architektur

```
Client → POST /api/upload → Server → S3 → Return URL
```

## Server-API

### POST /api/upload

Upload eine Datei zu S3.

**Request:**

- Method: `POST`
- Headers: `Authorization: Bearer <sessionId>`
- Body: `multipart/form-data`
  - `file`: File
  - `folder`: string (optional, default: "uploads")

**Response:**

```json
{
  "success": true,
  "file": {
    "id": "uuid",
    "url": "https://...",
    "key": "uploads/uuid.ext",
    "size": 12345,
    "mimeType": "image/png",
    "originalName": "image.png"
  }
}
```

### GET /api/files/:id

Get file information (Placeholder für MVP).

### DELETE /api/files/:key

Delete file from S3.

**Request:**

- Method: `DELETE`
- Headers: `Authorization: Bearer <sessionId>`
- Params: `key` (S3 key)

**Response:**

```json
{
  "success": true,
  "message": "File deleted"
}
```

## Client-Integration

### FileUploadUI Component

```tsx
<FileUploadUI
  onUpload={(file) => console.log(file)}
  visible={true}
  onToggle={() => {}}
  serverUrl="https://realtime.wattwelten.de"
  sessionId="session-id"
/>
```

### FileUploadPanel Component

```tsx
<FileUploadPanel
  visible={true}
  onClose={() => {}}
  serverUrl="https://realtime.wattwelten.de"
  sessionId="session-id"
  onFileUploaded={(file) => world.shareFile(file)}
/>
```

## File-Sharing

Nach Upload können Files über Socket.io geteilt werden:

```typescript
world.shareFile(file, position);
```

Files werden automatisch an alle User im Room broadcastet.

## Konfiguration

### Server Environment Variables

```env
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=wattwelten-metaverse-files
S3_ENDPOINT=  # Optional
FILE_UPLOAD_MAX_SIZE=10485760  # 10MB
FILE_UPLOAD_ALLOWED_TYPES=image/*,video/*,application/pdf
```

### Client Environment Variables

```env
VITE_FILE_UPLOAD_ENABLED=true
VITE_FILE_UPLOAD_MAX_SIZE=10485760
VITE_FILE_UPLOAD_ALLOWED_TYPES=image/*,video/*,application/pdf
```

## Unterstützte Dateitypen

- Images: `image/*`
- Videos: `video/*`
- PDFs: `application/pdf`

## Limits

- Max File Size: 10MB (konfigurierbar)
- File Types: Konfigurierbar über `FILE_UPLOAD_ALLOWED_TYPES`

## Sicherheit

1. **Authentication**: Upload erfordert gültige Session
2. **File-Type-Validierung**: MIME-Type + Extension
3. **Size-Limits**: Konfigurierbare Limits
4. **Virus-Scanning**: Später implementierbar

## S3-kompatible Services

Das System unterstützt S3-kompatible Services (z.B. DigitalOcean Spaces):

```env
S3_ENDPOINT=https://fra1.digitaloceanspaces.com
```
