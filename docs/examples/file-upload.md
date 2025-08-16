# File Upload and Media Management Example

This example demonstrates how to implement file uploads and media management in a CodeWithDanko application.

## File Upload Component

### Frontend Implementation

```tsx
// app/components/FileUpload.tsx
import { useState, useRef } from 'react';
import { Button, Alert, Progress } from '@codewithdanko/ui';

interface FileUploadProps {
  onUploadComplete: (fileData: any) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string;
  buttonText?: string;
}

export function FileUpload({
  onUploadComplete,
  maxSizeMB = 50,
  acceptedFileTypes = '*/*',
  buttonText = 'Upload File'
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });
      
      // Handle response
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response.file);
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.error?.message || errorMessage;
          } catch (e) {
            // Parsing error, use default message
          }
          setError(errorMessage);
          setIsUploading(false);
        }
      };
      
      // Handle network errors
      xhr.onerror = () => {
        setError('Network error occurred during upload');
        setIsUploading(false);
      };
      
      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
      />
      
      {isUploading ? (
        <div className="space-y-2">
          <Progress value={progress} max={100} />
          <p className="text-sm text-gray-600">{progress}% uploaded</p>
        </div>
      ) : (
        <Button
          onClick={triggerFileInput}
          variant="outline"
          className="w-full py-8 border-dashed"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
```

## Media Gallery Component

```tsx
// app/components/MediaGallery.tsx
import { useState, useEffect } from 'react';
import { Card, Button } from '@codewithdanko/ui';
import { FileUpload } from './FileUpload';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
}

export function MediaGallery() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/media');
      
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      setMediaItems(data.files || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMedia();
  }, []);
  
  const handleUploadComplete = (fileData: MediaItem) => {
    setMediaItems((prev) => [fileData, ...prev]);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      setMediaItems((prev) => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const isImage = (contentType: string) => contentType.startsWith('image/');
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Media Gallery</h2>
      
      <FileUpload
        onUploadComplete={handleUploadComplete}
        acceptedFileTypes="image/*,application/pdf"
        buttonText="Upload Media (Images, PDFs)"
      />
      
      {error && (
        <div className="text-red-500 py-2">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">Loading media...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No media files found. Upload your first file above.
            </div>
          ) : (
            mediaItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {isImage(item.contentType) ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm font-medium">{item.filename}</p>
                    </div>
                  )}
                </div>
                <Card.Content className="p-4">
                  <p className="font-medium truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(item.size)}
                  </p>
                </Card.Content>
                <Card.Footer className="flex justify-between p-4 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    as="a"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </Card.Footer>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

## Backend Implementation

### Media Routes

```typescript
// apps/api/src/routes/media.ts
import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all media routes
router.all('*', verifyAuth);

// Upload file
router.post('/upload', async (request, env) => {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'No file provided' } 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check file size
    const maxSize = parseInt(env.UPLOAD_MAX_BYTES) || 52428800; // Default 50MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: `File size exceeds the maximum limit of ${maxSize / 1024 / 1024}MB` } 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a unique ID and sanitize filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const sanitizedFilename = file.name
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, '-');
    
    // Store file metadata in database
    const { userId } = request.user;
    
    await env.DB.prepare(`
      INSERT INTO media (id, user_id, filename, content_type, size)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      fileId,
      userId,
      sanitizedFilename,
      file.type,
      file.size
    ).run();
    
    // Upload to R2
    const objectKey = `${userId}/${fileId}-${sanitizedFilename}`;
    await env.MEDIA.put(objectKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Generate public URL
    const url = `https://codewithdanko-media.tidepeng.workers.dev/${objectKey}`;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        file: {
          id: fileId,
          filename: sanitizedFilename,
          url,
          contentType: file.type,
          size: file.size
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'File upload failed' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Get all media files for the current user
router.get('/', async (request, env) => {
  try {
    const { userId } = request.user;
    
    const files = await env.DB.prepare(`
      SELECT id, filename, content_type, size, created_at
      FROM media
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();
    
    // Add URLs to each file
    const filesWithUrls = files.results.map(file => ({
      ...file,
      url: `https://codewithdanko-media.tidepeng.workers.dev/${userId}/${file.id}-${file.filename}`
    }));
    
    return new Response(
      JSON.stringify({ 
        success: true,
        files: filesWithUrls
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Failed to fetch media files' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Get a specific media file
router.get('/:id', async (request, env) => {
  try {
    const { id } = request.params;
    const { userId } = request.user;
    
    const file = await env.DB.prepare(`
      SELECT id, filename, content_type, size
      FROM media
      WHERE id = ? AND user_id = ?
    `).bind(id, userId).first();
    
    if (!file) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'File not found' } 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const objectKey = `${userId}/${file.id}-${file.filename}`;
    const url = `https://codewithdanko-media.tidepeng.workers.dev/${objectKey}`;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        file: {
          ...file,
          url
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Failed to fetch file' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Delete a media file
router.delete('/:id', async (request, env) => {
  try {
    const { id } = request.params;
    const { userId } = request.user;
    
    // Get file info
    const file = await env.DB.prepare(`
      SELECT id, filename
      FROM media
      WHERE id = ? AND user_id = ?
    `).bind(id, userId).first();
    
    if (!file) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'File not found' } 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Delete from R2
    const objectKey = `${userId}/${file.id}-${file.filename}`;
    await env.MEDIA.delete(objectKey);
    
    // Delete from database
    await env.DB.prepare(`
      DELETE FROM media
      WHERE id = ? AND user_id = ?
    `).bind(id, userId).run();
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'File deleted successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Failed to delete file' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

export default router;
```

### Database Schema

```sql
-- Migration file: create_media_table.sql
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_media_user_id ON media(user_id);
```

## Usage in a Page Component

```tsx
// app/routes/dashboard/media.tsx
import { MediaGallery } from '~/components/MediaGallery';
import { requireAuth } from '~/lib/auth.server';

export const loader = async ({ request }) => {
  // Ensure user is authenticated
  await requireAuth(request);
  return null;
};

export default function MediaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Media Library</h1>
      <MediaGallery />
    </div>
  );
}
```

## Media Worker for Serving Files

For serving media files from R2, you can create a separate Worker:

```typescript
// codewithdanko-media/src/index.ts
export interface Env {
  MEDIA: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const objectKey = url.pathname.slice(1); // Remove leading slash
    
    if (!objectKey) {
      return new Response('Not Found', { status: 404 });
    }
    
    // Handle OPTIONS for CORS
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }
    
    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    
    // Get object from R2
    const object = await env.MEDIA.get(objectKey);
    
    if (!object) {
      return new Response('Not Found', { status: 404 });
    }
    
    // Return the file with appropriate headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Add cache control for better performance
    headers.set('Cache-Control', 'public, max-age=31536000');
    
    return new Response(object.body, {
      headers
    });
  }
};

function handleCORS(request: Request): Response {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  });
  
  return new Response(null, { headers });
}
```

## Complete Media Management Flow

1. User uploads a file through the `FileUpload` component
2. File is sent to the backend API as multipart/form-data
3. Backend validates the file, stores metadata in D1 database, and uploads the file to R2
4. The `MediaGallery` component displays all uploaded files with options to view or delete
5. When a user views a file, it's served from the media Worker with appropriate caching and CORS headers
6. When a user deletes a file, it's removed from both the database and R2 storage

This example demonstrates a complete media management system with progress tracking, error handling, and proper backend implementation.
