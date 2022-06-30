# Console

Code that powers the official [Helium Console](https://console.helium.com/).

## Development and Contribution

Any and all contributions from the community are encouraged.

- Guidelines for how to contribute to this repository [are here](https://github.com/helium/console/blob/master/CONTRIBUTING.md).
- Discussion about the development and usage of the Helium Console takes place in the [official Helium Discord Server](https://discord.gg/helium), specifically in the `#console` channel. Join us!
- To post feature requests or see a list of current issues please go [here](https://github.com/helium/console/issues).

## Common setup steps for Docker

- Clone the repo and `cd console`
- Sign up with Magic Link (https://magic.link/) or Auth0 (https://auth0.com/) for user authentication
- Sign up with Mapbox (https://mapbox.com/)
- In root directory, copy environment templates

```
cp templates/.env .env
cp templates/.env-router .env-router
```

- Populate your newly copied .env file and .env-router file

## Option 1: Running Console+Router with prebuilt Console image

```
cp templates/docker-compose-quay.yaml docker-compose.yaml
cp templates/nginx-default.conf nginx.conf
```

- Get a certificate (https://certbot.eff.org/instructions)
- Update `nginx.conf` with cert and key information
- In `.env`, set `SOCKET_CHECK_ORIGIN` to your host domain
- Run with `docker-compose up`

## Option 2: Running Console+Router and build your own Console image

```
cp templates/docker-compose-server.yaml docker-compose.yaml
cp templates/nginx-default.conf nginx.conf
```

- Get a certificate (https://certbot.eff.org/instructions)
- Update `nginx.conf` with cert and key information
- In `.env`, set `SOCKET_CHECK_ORIGIN` to your host domain
- Build with `docker-compose build`
- Run with `docker-compose up`

## Option 3: Running Console+Router with Docker locally

```
cp templates/docker-compose-local.yaml docker-compose.yaml
```

- Build with `docker-compose build`
- Run with `docker-compose up`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Opt in to use an IP Filter for Stripe Transactions

In the event that Stripe requires you to restrict credit card payments to certain countries or cities, you may opt in to use the IP filter implemented in the `ConsoleWeb.IPFilter` module.

To do so, please obtain a MaxMind key and download the database onto the host machine:
(https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&suffix=tar.gz&license_key=${MAXMIND_KEY})

Please note you'll have to regularly update this database.

In your `docker-compose` file under `console`, add the following:

```
volumes:
  - "/host/path/to/GeoLite2-City.mmdb:/app/GeoLite2-City.mmdb"
```

Then, you may set the following variables in your `.env` file.

```
UNSUPPORTED_COUNTRIES=CU,IR,KP,SY,RU # or a comma-separated list of the ISO Alpha-2 codes of countries to be restricted
UNSUPPORTED_CITIES=Luhansk,Donetsk # or a comma-separated list of the names of cities to be restricted
UNSUPPORTED_UKR_SUBDIVISIONS=43,40 # or a comma-separated list of the ISO codes for Ukranian subdivisions to be restricted
```

## Upgrading your open source Console+Router (Applies to Option 1 only)

- Bring down your server with `docker-compose down`
- Pull down and run the latest released Quay images with `docker-compose up`
- If there are db migrations in the upgrade commits, `docker-compose up` will run these migrations (Keep an eye on the logs for migration errors to file a GH issue, you should not have to manually migrate the db)
- If needed, you can manually migrate the db with `docker exec -it helium_console /bin/bash`, then `_build/prod/rel/console/bin/console eval "Console.Release.migrate"`

## Upgrading your open source Console+Router (Applies to Option 2 and 3 only)

- Pull down the latest master branch with git
- Build with `docker-compose build`, you do not have to bring down your server until this completes
- Bring down your server with `docker-compose down`, then run your new build with `docker-compose up`
- If there are db migrations in the upgrade commits, `docker-compose up` will run these migrations (Keep an eye on the logs for migration errors to file a GH issue, you should not have to manually migrate the db)
- If needed, you can manually migrate the db with `docker exec -it helium_console /bin/bash`, then `_build/prod/rel/console/bin/console eval "Console.Release.migrate"`

## Keep your Console invite only

- Set `USER_INVTE_ONLY` to true in your .env file
- Add approved users to your db `INSERT INTO users (id, email, password_hash, inserted_at, updated_at) values (1, 'email@provider.com', 'hash', NOW(), NOW());`

## Running Console Development Environment without Router

- Install homebrew (https://brew.sh/)
- Install postgres (postgres.app on mac)
- Install yarn (`brew install yarn`)
- Install libsodium (`brew install libsodium`)
- Install erlang (https://thinkingelixir.com/install-elixir-using-asdf/) (asdf install erlang 23.3.4.10, asdf local erlang 23.3.4.10)
- Install elixir (https://thinkingelixir.com/install-elixir-using-asdf/) (asdf install elixir 1.12.1-otp-23, asdf local elixir 1.12.1-otp-23)

To start your Phoenix server:

- Install dependencies with `mix deps.get`
- Create and migrate your database with `mix ecto.setup`
- Install Node.js dependencies with `cd assets && yarn`
- Start Phoenix with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Questions

If you run into any issues or you have any questions about how to get started contributing, feel free to reach out on the `#console` channel in [the official Helium Community Discord server](http://discord.gg/helium)!
