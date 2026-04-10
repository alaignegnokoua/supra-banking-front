// Environment variables for development
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  jwt: {
    tokenKey: 'auth_token'
  },
  api: {
    timeout: 30000
  }
};
