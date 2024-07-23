# syntax=docker/dockerfile:1
FROM ruby:3.2.2

RUN apt-get update -qq && apt-get install -y mariadb-client libsqlite3-0 libvips

# Default directory
ENV INSTALL_PATH /zelucash
RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH
RUN gem install rails bundler
COPY Gemfile* ./
RUN bundle install
ADD ../.. ./

# Start server
# CMD bundle exec unicorn -c config/unicorn.rb
CMD bundle exec puma -C config/puma.rb
