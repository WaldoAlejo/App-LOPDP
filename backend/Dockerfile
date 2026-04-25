FROM node:20-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .
RUN npx prisma generate

# Build the application
RUN npm run build

# Change ownership to non-root user
RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 3001

CMD ["node", "dist/main"]
