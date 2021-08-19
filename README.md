# Console

Code that powers the official [Helium Console](https://console.helium.com/).

## Development and Contribution

Any and all contributions from the community are encouraged.

- Guidelines for how to contribute to this repository [are here](https://github.com/helium/console/blob/master/CONTRIBUTING.md).
- Discussion about the development and usage of the Helium Console takes place in the [official Helium Discord Server](https://discord.gg/helium), specifically in the `#console` channel. Join us!
- For a list of issues and prioritization, please go to our [Project page](https://github.com/orgs/helium/projects/15).

## Running Console Development Environment

- Install homebrew (https://brew.sh/)
- Install postgres (postgres.app on mac)
- Install yarn (`brew install yarn`)
- Install libsodium (`brew install libsodium`)
- Install erlang (https://thinkingelixir.com/install-elixir-using-asdf/) (asdf install erlang 21.1, asdf local erlang 21.1)
- Install elixir (https://thinkingelixir.com/install-elixir-using-asdf/) (asdf install elixir 1.9.0, asdf local elixir 1.9.0)

To start your Phoenix server:

- Install dependencies with `mix deps.get`
- Create and migrate your database with `mix ecto.setup`
- Install Node.js dependencies with `cd assets && yarn`
- Start Phoenix with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Running Console+Router with Docker locally

- Clone the repo and `cd console`
- Sign up with Auth0 (https://auth0.com/)
- In root directory, copy environment templates

```
cp templates/.env .env
cp templates/.env-router .env-router
cp templates/docker-compose-local.yaml docker-compose.yaml
```

- Populate your newly copied .env file and .env-router file
- Build with `docker-compose build`
- Run with `docker-compose up`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Running Console+Router with Docker on a Server

- Follow steps in the [previous section](#running-console+router-with-docker)
- In root directory, copy server environment templates

```
cp templates/docker-compose-server.yaml docker-compose.yaml
cp templates/nginx-default.conf nginx.conf
```

- Get a certificate (https://certbot.eff.org/instructions)
- Update `nginx.conf` with cert and key information
- In `.env`, set `SOCKET_CHECK_ORIGIN` to your host domain
- Build with `docker-compose build`
- Run with `docker-compose up`

## Upgrading your open source Console+Router

- Pull down the latest master branch with git
- Build with `docker-compose build`, you do not have to bring down your server until this completes
- Bring down your server with `docker-compose down`, then run your new build with `docker-compose up`
- If there are db migrations in the upgrade commits, `docker-compose up` will run these migrations (Keep an eye on the logs for migration errors to file a GH issue, you should not have to manually migrate the db)
- If needed, you can manually migrate the db with `docker exec -it helium_console /bin/bash`, then `_build/prod/rel/console/bin/console eval "Console.Release.migrate"`

## Upgrading your v1 Console to v2 (originally released 07/29/2021)

- Prior to upgrading, we recommend making a backup of your database as a precaution. This will only be used if something unexpected happens during the db migration process.
- Follow the update [instructions](https://github.com/helium/console/releases/tag/2021.07.29)

## Questions

If you run into any issues or you have any questions about how to get started contributing, feel free to reach out on the `#console` channel in [the official Helium Community Discord server](http://discord.gg/helium)!
