const configService = require('../services/configService');

/**
 * Middleware to validate the request body for the generate endpoint
 */
function validateGenerateRequest(req, res, next) {
  const { query, type, format, api_key, provider, transparent } = req.body;
  const defaultProvider = configService.getDefaultProvider();

  try {
    // Check if required fields are present
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: query'
      });
    }

    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: type'
      });
    }

    // Currently only supporting image type
    if (type !== 'image') {
      return res.status(400).json({
        status: 'error',
        message: 'Unsupported asset type. Currently only "image" is supported.'
      });
    }

    // Validate format if provided
    if (format && !['sprite', 'icon', 'component'].includes(format)) {
      return res.status(400).json({
        status: 'error',
        message: 'Unsupported format. Supported formats are: sprite, icon, component'
      });
    }

    // Check for API key (only required if not configured)
    const effectiveProvider = provider || defaultProvider;
    const defaultApiKey = configService.getDefaultApiKey(effectiveProvider);

    if (!api_key && !defaultApiKey) {
      return res.status(400).json({
        status: 'error',
        message: `Missing required field: api_key. You must provide your own API key or configure one using the CLI.`
      });
    }

    // Check for provider (optional, defaults to 'openai')
    if (provider && !['openai', 'stability', 'replicate'].includes(provider)) {
      return res.status(400).json({
        status: 'error',
        message: 'Unsupported provider. Supported providers are: openai, stability, replicate'
      });
    }

    // Validate transparency option if provided (optional, defaults to true)
    if (transparent !== undefined && typeof transparent !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid value for transparent. Must be a boolean (true or false).'
      });
    }

    // If all validations pass, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error in request validation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during request validation.'
    });
  }
}

module.exports = {
  validateGenerateRequest,
};
