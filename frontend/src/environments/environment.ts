export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  cloudinary: {
    cloudName: 'your-cloud-name',
    apiKey: 'your-api-key'
  },
  strava: {
    clientId: '181714',
    redirectUri: 'http://localhost:4200/auth/strava/callback',
    scope: 'read,activity:read_all,profile:read_all'
  }
} as const;
