FROM elixir:1.6

WORKDIR /opt/console

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y curl sudo
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && sudo apt-get install -y nodejs
RUN mix local.hex --force
RUN mix local.rebar --force

ADD mix.exs mix.exs
ADD mix.lock mix.lock
RUN mix do deps.get

ADD assets/ assets/
RUN cd assets && npm install

RUN mix deps.compile

ADD config/ config/
ADD lib/ lib/
ADD priv/ priv/

RUN mix compile
RUN mix phx.digest

CMD ["mix", "phx.server"]
