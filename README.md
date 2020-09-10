# Console

[![Build Status](https://travis-ci.com/helium/console.svg?token=xtWAyYdyp7b1J2ZaarWy&branch=master)](https://travis-ci.com/helium/console)

## Prerequisites
* homebrew (https://brew.sh/)
* elixir (`brew install elixir`)
* postgres (postgres.app on mac)
* yarn (`brew install yarn`)
* libsodium (git clone -b stable https://github.com/jedisct1/libsodium.git) (cd libsodium && ./configure --prefix=/usr && make check && make install && cd ..)

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Install Node.js dependencies with `yarn --cwd "assets" install`
  * Start Phoenix in an interactive shell with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](http://www.phoenixframework.org/docs/deployment).
