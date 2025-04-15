const fs = require('fs');
const path = require('path');

/**
 * Service for loading and managing configuration
 */
class ConfigService {
  constructor() {
    this.config = null;
    this.loadConfig();
  }

  /**
   * Load configuration from the .assetgen/config.json file
   */
  loadConfig() {
    try {
      const configPath = path.resolve(process.cwd(), '.assetgen', 'config.json');

      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        this.config = JSON.parse(configData);
        console.log('Loaded configuration from .assetgen/config.json');
      } else {
        console.log('No configuration file found at .assetgen/config.json');
        this.config = {
          provider: 'openai',
          apiKey: null,
          storagePath: './generated-assets',
        };
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      this.config = {
        provider: 'openai',
        apiKey: null,
        storagePath: './generated-assets',
      };
    }
  }

  /**
   * Get the default API key for the specified provider
   * @param {string} provider - The provider to get the API key for
   * @returns {string|null} - The API key or null if not found
   */
  getDefaultApiKey(provider) {
    if (!this.config) {
      return null;
    }

    // If the provider matches the configured provider, return the API key
    if (provider === this.config.provider) {
      return this.config.apiKey;
    }

    return null;
  }

  /**
   * Get the default provider
   * @returns {string} - The default provider
   */
  getDefaultProvider() {
    return this.config?.provider || 'openai';
  }
}

module.exports = new ConfigService();
