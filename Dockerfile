# syntax=docker/dockerfile:1
FROM ruby:3.2.2

# Set working directory
ENV INSTALL_PATH /filehub
WORKDIR $INSTALL_PATH

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
  mariadb-client \
  libsqlite3-0 \
  libvips \
  nodejs \
  npm \
  curl \
  openssh-server  # Install OpenSSH

# Install Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

# Install Bundler and Rails
RUN gem install rails bundler

# Copy Gemfile first (cache dependencies)
COPY Gemfile* ./
RUN bundle install --without development test

# Copy application files
COPY . .

# Set environment variables
ENV RAILS_ENV production
ENV RAILS_LOG_TO_STDOUT true
ENV RAILS_SERVE_STATIC_FILES true

# Precompile assets (ignores errors)
RUN bundle exec rails assets:precompile || echo "Skipping assets precompilation"

# SSH Configuration
RUN mkdir /var/run/sshd
RUN echo 'root:Docker!' | chpasswd  # Set root password (change in production)
RUN sed -i 's/^#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Expose Ports
EXPOSE 3000 2222

# Start SSH and Puma server
CMD service ssh start && bundle exec puma -C config/puma.rb