FROM elixir:1.9-alpine as build

# install build dependencies
RUN apk add --no-cache build-base npm git python3 curl nodejs yarn bash openssl postgresql-client openssl-dev libsodium-dev

# prepare build dir
WORKDIR /app

# install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

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
COPY priv priv

# Note: if your project uses a tool like https://purgecss.com/,
# which customizes asset compilation based on what it finds in
# your Elixir templates, you will need to move the asset compilation step
# down so that `lib` is available.
COPY assets assets
# use webpack to compile npm dependencies - https://www.npmjs.com/package/webpack-deploy
RUN cd assets && yarn && yarn run deploy
# COPY package.json package-lock.json ./assets/
RUN mix phx.digest

# compile and build the release
COPY lib lib
RUN mix compile
# changes to config/releases.exs don't require recompiling the code
COPY config/releases.exs config/
# uncomment COPY if rel/ exists
# COPY rel rel
RUN mix release

# Start a new build stage so that the final image will only contain
# the compiled release and other runtime necessities
FROM alpine:3.12.1 AS app
RUN apk add --no-cache libstdc++ openssl ncurses-libs

ARG MIX_ENV
ENV USER="nobody"

WORKDIR "/home/nobody/app"

COPY --from=build --chown="${USER}" /app/_build/prod/rel/console ./
RUN chown -R nobody: .
USER nobody

ENTRYPOINT ["bin/console"]
CMD ["start"]