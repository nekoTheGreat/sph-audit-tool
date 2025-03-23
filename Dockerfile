FROM ubuntu:24.04

ENV TZ=UTC

RUN apt-get update && \
    apt-get install --assume-yes --no-install-recommends --quiet \
    software-properties-common \
    libzip-dev zip unzip curl \
    build-essential libmagickwand-dev \
    libc-client-dev libkrb5-dev

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y apache2 && apt-get clean

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2

RUN apt-get install -y php libapache2-mod-php php-cli php-cgi php-pgsql

RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
RUN HASH=`curl -sS https://composer.github.io/installer.sig`
RUN php -r "if (hash_file('SHA384', '/tmp/composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
RUN php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install -y nodejs

COPY ./docker/vhost.conf /etc/apache2/sites-available

RUN a2ensite vhost
RUN a2dissite 000-default
RUN a2enmod rewrite
RUN a2enmod proxy
RUN a2enmod proxy_http
RUN a2enmod proxy_balancer
RUN a2enmod lbmethod_byrequests
RUN a2enmod ssl
RUN service apache2 restart

RUN mkdir /var/www/sph && \
    chmod -R 777 /var/www/sph

WORKDIR /var/www/sph

COPY ./package.json /var/www/sph/package.json

RUN npm install --include=dev --audit=false

RUN npm install pm2 -g

COPY ./ecosystem.config.cjs /var/www/sph/ecosystem.config.cjs

EXPOSE 80

CMD ["./docker/start.sh"]