#!/bin/bash

mix ecto.create && mix ecto.migrate
mix phx.server
