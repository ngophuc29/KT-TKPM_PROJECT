# E-Commerce Client Application

## Development

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`

3. Start the development server:

```bash
npm run dev
```

## Production Build

Create a production build:

```bash
npm run build
```

This will generate a `dist` folder with optimized files for production.

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD. The workflow:

1. Automatically builds the application when code is pushed to main, master, or develop branches
2. Deploys the built application to GitHub Pages (or your configured deployment target)

### Deployment Configuration

The GitHub Actions workflow supports multiple deployment targets:

- GitHub Pages (default)
- VPS via SSH (commented out)
- Netlify (commented out)
- Vercel (commented out)

To configure a specific deployment target, edit the `.github/workflows/client-ci-cd.yml` file.

### Environment Variables

For GitHub Actions to work properly, you may need to set the following secrets in your GitHub repository:

- `VITE_APP_API_GATEWAY_URL`: URL of your API Gateway

If using alternative deployment methods, additional secrets may be required as specified in the comments of the workflow file.
