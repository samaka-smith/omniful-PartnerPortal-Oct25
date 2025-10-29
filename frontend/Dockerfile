# Frontend Dockerfile for Omniful Partner Portal
FROM node:22-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Create patches directory if needed
RUN mkdir -p patches

# Install dependencies (skip patches if missing)
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

