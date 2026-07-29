/**
 * Configuration Module
 * Loads environment variables and sets global API endpoints.
 * All sensitive keys are sourced from process.env with fallback defaults.
 */

require('dotenv').config();

// ============================================================
//  GLOBAL API ENDPOINTS
// ============================================================
global.APIs = {
    xteam: 'https://api.xteam.xyz',
    dzx: 'https://api.dhamzxploit.my.id',
    lol: 'https://api.lolhuman.xyz',
    violetics: 'https://violetics.pw',
    neoxr: 'https://api.neoxr.my.id',
    zenzapis: 'https://zenzapis.xyz',
    akuari: 'https://api.akuari.my.id',
    akuari2: 'https://apimu.my.id',
    nrtm: 'https://fg-nrtm.ddns.net',
    bg: 'http://bochil.ddns.net',
    fgmods: 'https://api-fgmods.ddns.net'
};

// ============================================================
//  API KEYS (ENV Override with Fallback)
//  Recommended: Set these in your .env file for security.
// ============================================================
const API_KEYS = {
    'https://api.xteam.xyz': process.env.XTEAM_KEY || 'd90a9e986e18778b',
    'https://api.lolhuman.xyz': process.env.LOL_KEY || '85faf717d0545d14074659ad',
    'https://api.neoxr.my.id': process.env.NEOXR_KEY || 'yourkey',
    'https://violetics.pw': process.env.VIOLETICS_KEY || 'beta',
    'https://zenzapis.xyz': process.env.ZENZAPIS_KEY || 'yourkey',
    'https://api-fgmods.ddns.net': process.env.FGMODS_KEY || 'fg-dylux'
};

global.APIKeys = API_KEYS;

// ============================================================
//  BOT CONFIGURATION (Can be overridden via .env)
// ============================================================
const config = {
    // Warning system
    warnCount: parseInt(process.env.WARN_COUNT, 10) || 3,

    // Request timeouts (in milliseconds)
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT, 10) || 15000,
    mediaTimeout: parseInt(process.env.MEDIA_TIMEOUT, 10) || 30000,

    // Retry settings
    maxRetries: parseInt(process.env.MAX_RETRIES, 10) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY, 10) || 2000
};

// ============================================================
//  EXPORTS
// ============================================================
module.exports = {
    WARN_COUNT: config.warnCount,
    APIs: global.APIs,
    APIKeys: global.APIKeys,
    timeout: config.defaultTimeout,
    mediaTimeout: config.mediaTimeout,
    maxRetries: config.maxRetries,
    retryDelay: config.retryDelay
};