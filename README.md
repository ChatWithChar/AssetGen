# AssetGen

AssetGen serves as an intermediary between AI agents and asset generation APIs. Its main function is to generate or retrieve visual assets (like components, sprites, or icons) from text descriptions, and save them locally in the project for agents to use as placeholders during app or UI development.

## Features

- Generate visual assets from text descriptions
- Save generated assets locally in the project
- Support for different asset types and styles
- Option for transparent or non-transparent images
- Comprehensive error handling
- Rate limiting to prevent abuse

## Installation

### Option 1: Install from npm (once published)

You can install and configure AssetGen using npx:

```bash
# Set up AssetGen with OpenAI API key
npx -y assetgen --api-key=YOUR_OPENAI_API_KEY

# Set up AssetGen with Stability API key
npx -y assetgen --api-key=YOUR_STABILITY_API_KEY --provider=stability

# Set up AssetGen with custom storage path
npx -y assetgen --api-key=YOUR_API_KEY --storage-path=./assets
```

### Option 2: Install from GitHub

You can install AssetGen directly from GitHub:

```bash
# Install directly from GitHub
npx -y github:ChatWithChar/AssetGen --api-key=YOUR_API_KEY
```

### Option 3: Manual Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the `.env.example` file to `.env` and update the values:
   ```
   cp .env.example .env
   ```
4. Start the server:
   ```
   npm start
   ```

## Development

To start the server in development mode with hot reloading:
```
npm run dev
```

## API Documentation

### Generate Asset

```
POST /api/generate
```

#### Request Body

```json
{
  "query": "pixelated sprite component of a carrot",
  "type": "image",
  "format": "sprite",
  "style": "pixel-art",
  "api_key": "your_api_key_here",
  "provider": "openai",
  "transparent": true
}
```

- `query`: Natural language description of the asset (required)
- `type`: Type of asset (e.g., "image") (required, currently only "image" is supported)
- `format`: Specific format like "sprite", "icon", or "component" (optional)
- `style`: Optional stylistic direction ("pixel-art", "3D", "flat", etc.) (optional)
- `api_key`: Your API key for the selected provider (optional if configured via CLI, otherwise required)
- `provider`: The provider to use for generation (optional, defaults to the provider configured via CLI or "openai", supported: "openai", "stability", "replicate")
- `transparent`: Whether the generated image should have transparency (optional, defaults to `true`)

#### Response

```json
{
  "status": "success",
  "file_path": "./generated-assets/carrot_sprite_001.png",
  "file_name": "carrot_sprite_001.png",
  "meta": {
    "format": "png",
    "style": "pixel-art",
    "dimensions": "256x256",
    "transparent": true,
    "query": "pixelated sprite component of a carrot"
  }
}
```

## Error Handling

The API includes comprehensive error handling for various scenarios:

### Error Response Format

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "details": "Detailed error information"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Invalid or missing API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server error

## License

ISC
