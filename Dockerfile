FROM node:16-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./
COPY packages/engine/package*.json ./packages/engine/
COPY packages/server/package*.json ./packages/server/

# Install all dependencies (yarn is already in node:16-slim)
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/engine ./packages/engine
COPY packages/server ./packages/server

# Set working directory to server
WORKDIR /app/packages/server

# Expose port
EXPOSE 8081

# Start server (use node instead of nodemon for production)
CMD ["node", "src/index.js"]
