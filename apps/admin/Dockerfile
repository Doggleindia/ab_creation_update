# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (build tools like vite/tailwind/typescript live in
# devDependencies and are required for `npm run build`).
RUN npm ci

# Copy source code
COPY . .

# Vite bakes VITE_* vars at build time — pass the backend URL as a build arg:
#   docker build --build-arg VITE_MAIN_BACKEND=https://api.example.com .
ARG VITE_MAIN_BACKEND
ENV VITE_MAIN_BACKEND=$VITE_MAIN_BACKEND

# Build the application (outputs to dist/)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional, using default for now)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
