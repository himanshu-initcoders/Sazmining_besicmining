export const uploadConfig = {
  // File size limits (in bytes)
  maxFileSize: {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
  },

  // Allowed MIME types
  allowedMimeTypes: {
    images: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    videos: ['video/mp4', 'video/webm', 'video/ogg'],
  },

  // Default folders
  defaultFolders: {
    images: 'images',
    documents: 'documents',
    videos: 'videos',
    avatars: 'avatars',
    products: 'products',
  },

  // Local storage settings
  local: {
    uploadDir: 'uploads',
    serveStaticPath: '/uploads',
  },
};
