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

    SECRET_KEY_BASE= [Random 64 char secret key]\
    CLOAK_SECRET_KEY= [Run in iex: 32 |> :crypto.strong_rand_bytes()]\
    GUARDIAN_SECRET_KEY = [Random 64 char secret key]\
    ROUTER_SECRETS= [Random 64 char secret key]\
    OUI=1\
    SELF_HOSTED=true\
    AUTH_0_CLIENT_ID= [Client ID under Auth0 app settings]\
    AUTH_0_DOMAIN= [Domain under Auth0 app settings]\
    AUTH0_BASE_URL= [https:// + Auth0 Domain]\
    MAILGUN_API_KEY= [Your Mailgun api key (optional)]\
    SITE_DOMAIN_MAILGUN= [Your host domain (optional)]

  * Build with `docker-compose build`
  * Run with `docker-compose up`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.
