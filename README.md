# Console

## Development Environment

  * Install homebrew (https://brew.sh/)
  * Install postgres (postgres.app on mac)
  * Install yarn (`brew install yarn`)
  * Install libsodium (`brew install libsodium`)
  * Install erlang (https://thinkingelixir.com/install-elixir-using-asdf/) (asdf install erlang 21.1, asdf local erlang 21.1)
  * Install elixir (https://thinkingelixir.com/install-elixir-using-asdf/) (asdf install elixir 1.9.0, asdf local elixir 1.9.0)

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Install Node.js dependencies with `cd assets && yarn`
  * Start Phoenix with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Running with Docker

  * Clone the repo and `cd console`
  * Follow instructions at the top of `/config/prod.exs`
  * Follow instructions at the bottom of `/assets/webpack.config.js`
  * Update host at the top of `/config/releases.exs`
  * Create .env file in root folder as well as in `/assets`
  * Populate both .env files with the following

    SECRET_KEY_BASE=
    CLOAK_SECRET_KEY=
    ROUTER_SECRETS=
    OUI=1
    SELF_HOSTED=true
    AUTH0_BASE_URL=
    AUTH_0_CLIENT_ID=
    AUTH_0_DOMAIN=
    MAILGUN_API_KEY=
    SITE_DOMAIN_MAILGUN=

  * Build with `docker-compose build`
  * Run with `docker-compose up`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.
