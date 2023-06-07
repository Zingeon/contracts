# docker/api/Dockerfile

# Use an official PHP runtime as the base image
FROM php:8.2-cli

# Set the working directory in the container to /app
WORKDIR /app

# Install Symfony requirements
RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    libicu-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    git \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && docker-php-ext-install \
    pdo_mysql \
    zip \
    intl \
    && docker-php-ext-configure gd \
    && docker-php-ext-install gd


# Install Composer
COPY --from=composer /usr/bin/composer /usr/bin/composer

# Copy the current directory contents into the container at /app
COPY ./api /app

# Install dependencies
RUN composer install

# This command will run your application
CMD php -S 0.0.0.0:8000 -t public/
