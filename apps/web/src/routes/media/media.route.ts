export const MEDIA_ROUTES = {
  GET_FILE: (id: number) => `media/files/${id}`,
  POST_FILE_UPLOAD: 'media/files/upload',
} as const;
