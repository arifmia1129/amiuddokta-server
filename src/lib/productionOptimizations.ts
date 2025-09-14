/**
 * Production Optimizations
 * Disable console logs and other development features in production
 */

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Disable console logs in production
  global.console.log = () => {};
  global.console.info = () => {};
  global.console.warn = () => {};
  global.console.debug = () => {};
  // Keep console.error for critical error logging
  // global.console.error = () => {};
  
  // Disable other development features
  global.console.trace = () => {};
  global.console.time = () => {};
  global.console.timeEnd = () => {};
  global.console.table = () => {};
}

export const isDevelopment = !isProduction;
export const isProductionMode = isProduction;

// Export helper functions for conditional logging
export const devLog = (...args: any[]) => {
  if (!isProduction) {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (!isProduction) {
    console.warn(...args);
  }
};

export const devInfo = (...args: any[]) => {
  if (!isProduction) {
    console.info(...args);
  }
};

// Always log errors regardless of environment
export const errorLog = (...args: any[]) => {
  console.error(...args);
};