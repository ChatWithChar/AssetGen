const express = require('express');
const assetController = require('../controllers/assetController');
const { validateGenerateRequest } = require('../middleware/validateRequest');
const { apiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route POST /api/generate
 * @desc Generate an asset based on the provided query
 * @access Public (with rate limiting)
 */
router.post('/generate', apiRateLimiter, validateGenerateRequest, assetController.generateAsset);

module.exports = router;
