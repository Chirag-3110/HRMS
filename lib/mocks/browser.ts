/**
 * MSW Browser Setup
 * 
 * This file initializes Mock Service Worker for browser-side API mocking.
 * Use this in development to test the frontend without a real backend.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW service worker with our API handlers
export const worker = setupWorker(...handlers);
