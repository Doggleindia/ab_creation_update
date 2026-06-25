# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (build tools like react-scripts/tailwind/typescript
# live in devDependencies and are required for `npm run build`).
RUN npm ci

# Copy source code
COPY . .

# CRA bakes REACT_APP_* vars at build time — pass the backend URL as a build arg:
#   docker build --build-arg REACT_APP_MAIN_BACKEND=https://api.example.com .
ARG REACT_APP_MAIN_BACKEND
ENV REACT_APP_MAIN_BACKEND=$REACT_APP_MAIN_BACKEND

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration (optional, using default for now)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
