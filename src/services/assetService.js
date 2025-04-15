const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const configService = require('./configService');

/**
 * Service for generating and managing assets
 */
class AssetService {
  /**
   * Generate an asset based on the provided query
   * @param {Object} params - Parameters for asset generation
   * @param {string} params.query - Natural language description of the asset
   * @param {string} params.type - Type of asset (e.g., "image")
   * @param {string} params.format - Specific format (e.g., "sprite", "icon")
   * @param {string} params.style - Optional stylistic direction
   * @param {string} params.api_key - User-provided API key for the generation service
   * @param {string} params.provider - Provider to use (e.g., "openai", "stability")
   * @param {boolean} params.transparent - Whether the image should have transparency (default: true)
   * @returns {Promise<Object>} - Generated asset metadata
   */
  async generateAsset({ query, type, format, style, api_key, provider = null, transparent = true }) {
    // Use the provided API key or fall back to the default API key from config
    provider = provider || configService.getDefaultProvider();
    api_key = api_key || configService.getDefaultApiKey(provider);

    // Check if we have an API key
    if (!api_key) {
      throw new Error(`No API key provided for ${provider}. Please provide an API key or configure one using the CLI.`);
    }
    try {
      // For now, we'll only handle image generation
      if (type === 'image') {
        return await this.generateImage({ query, format, style, api_key, provider, transparent });
      }

      throw new Error(`Unsupported asset type: ${type}`);
    } catch (error) {
      console.error('Error generating asset:', error);
      throw error;
    }
  }

  /**
   * Generate an image based on the provided query
   * @param {Object} params - Parameters for image generation
   * @param {string} params.api_key - User-provided API key for the generation service
   * @param {string} params.provider - Provider to use (e.g., "openai", "stability")
   * @param {boolean} params.transparent - Whether the image should have transparency
   * @returns {Promise<Object>} - Generated image metadata
   */
  async generateImage({ query, format, style, api_key, provider, transparent }) {
    try {
      // Generate a unique filename
      const filename = this.generateFilename(query, format);
      const filePath = path.join(config.assetStorage.path, filename);

      // Call the appropriate API based on the provider
      let imageData;

      if (provider === 'openai') {
        console.log(`Generating image with OpenAI for query: "${query}"`);
        const response = await this.callOpenAIImageAPI(query, api_key, transparent);

        if (response && response.data && response.data.length > 0) {
          // Download the image from the URL
          const imageUrl = response.data[0].url;
          console.log(`Downloading image from: ${imageUrl}`);
          imageData = await this.downloadImage(imageUrl);
        } else {
          throw new Error('No image data returned from OpenAI API');
        }
      } else {
        // For other providers, use placeholder for now
        console.log(`Using placeholder for provider: ${provider}`);
        imageData = this.getPlaceholderImageData(transparent);
      }

      // Save the image to disk
      await this.saveImageToDisk(filePath, imageData);

      // Return metadata about the generated image
      return {
        status: 'success',
        file_path: filePath,
        file_name: filename,
        meta: {
          format: 'png',
          style: style || 'default',
          dimensions: '256x256',
          transparent,
          query,
        },
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Generate a filename based on the query and format
   * @param {string} query - The query used to generate the asset
   * @param {string} format - The format of the asset
   * @returns {string} - Generated filename
   */
  generateFilename(query, format) {
    // Create a slug from the query
    const slug = query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50);

    // Add a unique identifier to prevent collisions
    const uniqueId = uuidv4().substring(0, 8);

    return `${slug}_${format || 'image'}_${uniqueId}.png`;
  }

  /**
   * Get placeholder image data
   * @param {boolean} transparent - Whether the image should have transparency
   * @returns {Buffer} - Image data as a buffer
   */
  getPlaceholderImageData(transparent = true) {
    if (transparent) {
      // Create a simple 1x1 pixel transparent PNG
      return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    } else {
      // Create a simple 1x1 pixel white (non-transparent) PNG
      return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC', 'base64');
    }
  }

  /**
   * Save image data to disk
   * @param {string} filePath - Path to save the image
   * @param {Buffer} imageData - Image data as a buffer
   * @returns {Promise<void>}
   */
  async saveImageToDisk(filePath, imageData) {
    try {
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, imageData);

      console.log(`Image saved at: ${filePath}`);
    } catch (error) {
      console.error('Error saving image to disk:', error);
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  /**
   * Download an image from a URL
   * @param {string} url - URL of the image to download
   * @returns {Promise<Buffer>} - Image data as a buffer
   */
  async downloadImage(url) {
    try {
      console.log(`Downloading image from URL: ${url}`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error('Error downloading image:', error);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * In a real implementation, this would call OpenAI's DALL-E API
   * @param {string} prompt - The prompt to generate an image from
   * @param {string} api_key - User-provided API key for OpenAI
   * @param {boolean} transparent - Whether the image should have transparency
   * @returns {Promise<Object>} - API response
   */
  async callOpenAIImageAPI(prompt, api_key, transparent = true) {
    try {
      // Adjust the prompt based on transparency
      const adjustedPrompt = transparent
        ? `${prompt} with transparent background`
        : prompt;

      console.log(`Calling OpenAI API with prompt: "${adjustedPrompt}"`);

      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: adjustedPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`,
          },
        }
      );

      console.log('OpenAI API response received');
      return response.data;
    } catch (error) {
      console.error('Error calling OpenAI API:', error.response?.data || error.message);

      // Handle specific API errors
      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          throw new Error('API key is invalid or expired.');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Bad request: ${data.error?.message || 'Unknown error'}`);
        } else {
          throw new Error(`OpenAI API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      }

      throw new Error(`Failed to call OpenAI API: ${error.message}`);
    }
  }
}

module.exports = new AssetService();
