FROM elixir:1.9-alpine

# install build dependencies
RUN apk add --update git build-base nodejs npm yarn python3 bash openssl postgresql-client openssl-dev libsodium-dev
RUN apk --no-cache --update add gmp-dev automake libtool inotify-tools autoconf 

RUN mkdir /app
WORKDIR /app

# install Hex + Rebar
RUN mix do local.hex --force, local.rebar --force

# set build ENV
ENV MIX_ENV=prod
ARG socket_check_origin
ENV SOCKET_CHECK_ORIGIN=$socket_check_origin

# install mix dependencies
COPY mix.lock mix.lock
COPY mix.exs  mix.exs
COPY config config
RUN rm config/prod.exs
RUN mv config/prod-docker.exs config/prod.exs
RUN mix deps.get --only $MIX_ENV
RUN mix deps.compile

# build assets
COPY assets assets
RUN rm assets/webpack.config.js
RUN mv assets/webpack-docker.config.js assets/webpack.config.js
RUN cd assets && yarn && yarn run deploy
RUN mix phx.digest

# build project
COPY priv priv
COPY lib lib
RUN mix compile

RUN mix release

EXPOSE 4000
COPY entrypoint.sh .
RUN chown -R nobody: /app
USER nobody

CMD ["bash", "/app/entrypoint.sh"]
