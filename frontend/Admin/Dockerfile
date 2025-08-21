# Note: Exposing port 80 inside the container is standard. To avoid conflicts when running multiple containers,
# map each container's port 80 to a different host port, e.g.:
#   docker run -p 8081:80 admin-frontend
#   docker run -p 8080:80 user-frontend

# Dockerfile for Admin Frontend (Vite + React + Tailwind)
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install

COPY . .

RUN npm run build

# Production image
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./
COPY --from=build /app/dist .

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
