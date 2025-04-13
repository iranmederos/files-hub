# syntax=docker/dockerfile:1
FROM ruby:3.2.2

# Instala las dependencias necesarias
RUN apt-get update -qq && apt-get install -y \
  mariadb-client \
  libsqlite3-0 \
  libvips \
  nodejs \
  npm \
  curl

# Instala yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

# Default directory
ENV INSTALL_PATH /filehub
RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

# Instala Rails y Bundler
RUN gem install rails bundler

# Copia el Gemfile y Gemfile.lock
COPY Gemfile* ./
RUN bundle install

# Copia el resto de la aplicación
COPY .. ./

# Inicia el servidor
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]


