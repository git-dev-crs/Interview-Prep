# Production Dockerfile for InterviewPrep Backend
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# ── Security: run as unprivileged 'node' user (not root) ──────────────────────
# node:18-alpine ships a built-in 'node' user (uid 1000).
# Give it ownership of /app then drop root privileges permanently.
RUN chown -R node:node /app
USER node

# Expose backend port
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
