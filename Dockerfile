FROM elixir:1.12-alpine

# install build dependencies
RUN apk add --update git build-base nodejs npm yarn python3 bash openssl postgresql-client openssl-dev libsodium-dev curl
RUN apk --no-cache --update add gmp-dev automake libtool inotify-tools autoconf

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup update

RUN mkdir /app
WORKDIR /app

# install Hex + Rebar
RUN mix do local.hex --force, local.rebar --force

# Alpine Linux uses MUSL libc instead of the more common GNU libc
# (glibc). MUSL is generally meant for static linking, and rustc
# follows that convention. However, rustc cannot compile crates into
# dylibs when statically linking to MUSL. Rust NIFs are .so's
# (dylibs), therefore we force the compiler to dynamically link to
# MUSL by telling it to not statically link (the minus sign before
# crt-static means negate the following option).
ENV CARGO_BUILD_RUSTFLAGS="-C target-feature=-crt-static"

# set build ENV
ENV MIX_ENV=prod

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
