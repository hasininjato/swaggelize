# Use Alpine Linux as the base image
FROM debian:bookworm

# Install necessary packages
RUN apt-get update -y && \
    apt-get install -y vim \
    curl \
    nodejs \
    npm \
    yarn \
    openssl \
    nginx \
    python3 \
    bash \
    python3.11-venv

# Switch back to the root user
WORKDIR /var/www/html/
USER root
RUN bash

RUN npm install -g @vue/cli

# Set up Nginx
RUN mkdir -p /run/nginx

COPY vhosts/nginx.local.conf /etc/nginx/nginx.conf

# Expose ports: 8443 and 443 are used for SSL
EXPOSE 3000 8000 5432

# Start Nginx and keep the container running, useful  for local development
CMD ["nginx", "-g", "daemon off;"]
