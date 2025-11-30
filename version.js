// App version - update this when deploying changes
const APP_VERSION = '1.0.3';
const BUILD_DATE = '2024-11-30';

// Make version available globally
if (typeof window !== 'undefined') {
    window.APP_VERSION = APP_VERSION;
    window.BUILD_DATE = BUILD_DATE;
}

