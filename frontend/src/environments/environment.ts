export const environment = {
  production: false,
  apiUrl: 'https://backend-rust-seven-42.vercel.app/api',
  cloudinary: {
    cloudName: 'your-cloud-name',
    apiKey: 'your-api-key'
  },
  strava: {
    clientId: '181714',
    redirectUri: 'https://backend-rust-seven-42.vercel.app/api/auth/strava/callback',
    scope: 'read,activity:read_all,profile:read_all'
  }
} as const;
