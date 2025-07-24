# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (needed for build)
RUN yarn install --frozen-lockfile --silent

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxt -u 1001

# Change ownership of the app directory
RUN chown -R nuxt:nodejs /app
USER nuxt

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: 3000, path: '/api/healthcheck', timeout: 3000 }; const req = http.get(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); });"

# Start the application
CMD ["node", ".output/server/index.mjs"]