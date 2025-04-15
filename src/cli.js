#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const minimist = require('minimist');

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
  string: ['api-key', 'provider', 'storage-path'],
  boolean: ['help', 'version'],
  alias: {
    h: 'help',
    v: 'version',
    k: 'api-key',
    p: 'provider',
    s: 'storage-path',
  },
  default: {
    provider: 'openai',
    'storage-path': './generated-assets',
  },
});

// Display help message
if (argv.help) {
  console.log(`
AssetGen - Generate visual assets from text descriptions

Usage:
  npx -y assetgen [options]

Options:
  -h, --help                 Show this help message
  -v, --version              Show version information
  -k, --api-key=KEY          Set the API key for the provider (required)
  -p, --provider=PROVIDER    Set the provider (default: openai, options: openai, stability, replicate)
  -s, --storage-path=PATH    Set the storage path for generated assets (default: ./generated-assets)

Examples:
  # Set up AssetGen with OpenAI API key
  npx -y assetgen --api-key=YOUR_OPENAI_API_KEY

  # Set up AssetGen with Stability API key
  npx -y assetgen --api-key=YOUR_STABILITY_API_KEY --provider=stability

  # Set up AssetGen with custom storage path
  npx -y assetgen --api-key=YOUR_API_KEY --storage-path=./assets
  `);
  process.exit(0);
}

// Display version information
if (argv.version) {
  const packageJson = require('../package.json');
  console.log(`AssetGen v${packageJson.version}`);
  process.exit(0);
}

// Check if API key is provided
if (!argv['api-key']) {
  console.error('Error: API key is required');
  console.log('Use --help for usage information');
  process.exit(1);
}

// Validate provider
const validProviders = ['openai', 'stability', 'replicate'];
if (!validProviders.includes(argv.provider)) {
  console.error(`Error: Invalid provider "${argv.provider}"`);
  console.log(`Valid providers are: ${validProviders.join(', ')}`);
  process.exit(1);
}

// Create .env file with configuration
function setupEnvironment() {
  try {
    console.log('Setting up AssetGen...');

    // Create storage directory if it doesn't exist
    const storagePath = path.resolve(process.cwd(), argv['storage-path']);
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
      console.log(`Created storage directory: ${storagePath}`);
    }

    // Create or update .env file
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      // Load existing .env file
      envContent = fs.readFileSync(envPath, 'utf8');
      const envConfig = dotenv.parse(envContent);

      // Update values
      envConfig.ASSET_STORAGE_PATH = argv['storage-path'];

      // Convert back to string
      envContent = Object.entries(envConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    } else {
      // Create new .env file
      envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Asset Storage Configuration
ASSET_STORAGE_PATH=${argv['storage-path']}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
`;
    }

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('Updated environment configuration');

    // Create a configuration file for storing API keys securely
    const configDir = path.resolve(process.cwd(), '.assetgen');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.resolve(configDir, 'config.json');
    const config = {
      provider: argv.provider,
      apiKey: argv['api-key'],
      storagePath: argv['storage-path'],
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Saved API configuration');

    // Add .assetgen directory to .gitignore to prevent committing API keys
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    let gitignoreContent = '';

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.assetgen/')) {
        gitignoreContent += '\n# AssetGen configuration\n.assetgen/\n';
      }
    } else {
      gitignoreContent = '# AssetGen configuration\n.assetgen/\n';
    }

    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('Updated .gitignore to exclude API keys');

    console.log('\nAssetGen setup complete!');
    console.log(`\nTo start the server, run: npm start`);
    console.log(`To generate an asset, use the API endpoint: POST http://localhost:3000/api/generate`);

  } catch (error) {
    console.error('Error setting up AssetGen:', error.message);
    process.exit(1);
  }
}

// Run setup
setupEnvironment();
