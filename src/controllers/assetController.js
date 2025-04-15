const assetService = require('../services/assetService');

/**
 * Controller for handling asset generation requests
 */
class AssetController {
  /**
   * Generate an asset based on the request body
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateAsset(req, res) {
    try {
      const { query, type, format, style, api_key, provider, transparent } = req.body;

      // Call the asset service to generate the asset
      const result = await assetService.generateAsset({
        query,
        type,
        format,
        style,
        api_key,
        provider,
        transparent,
      });

      // Return the result
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in generateAsset controller:', error);

      // Determine the appropriate status code based on the error
      let statusCode = 500;
      let errorMessage = 'An error occurred while generating the asset.';

      if (error.message.includes('API key')) {
        statusCode = 401; // Unauthorized
        errorMessage = 'Invalid or missing API key.';
      } else if (error.message.includes('provider')) {
        statusCode = 400; // Bad Request
        errorMessage = 'Invalid provider specified.';
      } else if (error.message.includes('rate limit')) {
        statusCode = 429; // Too Many Requests
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }

      // Return an error response
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
        details: error.message,
      });
    }
  }
}

module.exports = new AssetController();
