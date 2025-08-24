// Export all API services and types
export * from './types';
export * from './base';
export * from './ssf-api';

// Create and export a default instance of the SSF API service
import { SsfApiService } from './ssf-api';
export const ssfApi = new SsfApiService();
