// Production-ready logger utility
// Only logs in development mode to avoid performance issues in production

// Production mode: Set to true when building for production
const PRODUCTION_MODE = false; // TODO: Set to true before production build

// Control which logs to show - Disabled in production for performance
const ENABLE_DEBUG = !PRODUCTION_MODE;
const ENABLE_INFO = !PRODUCTION_MODE;
const ENABLE_WARN = true; // Keep warnings in production
const ENABLE_ERROR = true; // Always show errors

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (__DEV__ && ENABLE_DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (__DEV__ && ENABLE_INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (__DEV__ && ENABLE_WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (__DEV__ && ENABLE_ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
};