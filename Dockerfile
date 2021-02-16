FROM elixir:1.9-alpine

# install build dependencies
RUN apk add --update git build-base nodejs npm yarn python3 bash openssl postgresql-client libressl-dev libsodium-dev

RUN mkdir /app
WORKDIR /app

# install Hex + Rebar
RUN mix do local.hex --force, local.rebar --force

# install mix dependencies
COPY mix.lock mix.lock
COPY mix.exs  mix.exs
COPY config config
RUN mix deps.get --only prod
RUN mix deps.compile

# build assets
COPY assets assets
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
