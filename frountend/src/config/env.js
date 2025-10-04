// Environment configuration loader
const loadEnvConfig = () => {
  // Try to load from env.frontend file
  try {
    const envContent = `
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Expense Management System
VITE_APP_VERSION=1.0.0
    `.trim();
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn('Could not load env.frontend, using defaults');
    return {
      VITE_API_URL: 'http://localhost:5000',
      VITE_APP_NAME: 'Expense Management System',
      VITE_APP_VERSION: '1.0.0'
    };
  }
};

export const envConfig = loadEnvConfig();

// Export individual environment variables
export const API_URL = envConfig.VITE_API_URL || 'http://localhost:5000';
export const APP_NAME = envConfig.VITE_APP_NAME || 'Expense Management System';
export const APP_VERSION = envConfig.VITE_APP_VERSION || '1.0.0';
