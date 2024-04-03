# SoilAPT

SoilAPT is a Discord bot made for friends and intended to be used on our Discord server. But if you're interested, you can reuse it and self host it (pretty easy using Docker, too). It uses ChatGPT and has basically 2 functions:

- Start a message with `@SoilAPT` to prompt something to ChatGPT as you normally would.
- Create a response message starting with `@SoilAPT` from another message and prompt something about it as context. The bot will get all the responses of responses too, so you can have a conversation as in the web UI.
- SoilAPT comes with a variety of personalities you can switch to using Discord slash commands (all for french language for now), and you can add more yourself by editing the [persona file](https://github.com/DrKabum/soil-apt/blob/main/api/data/personas.toml)

ℹ️ The first persona of that list will be considered the default personality. When changing SoilAPT's personality, it will keep it until nobody prompted it for one hour. After that, it will go back to its default personnality.

## Pre-requirements

- Create a Discord App in the [developer portal](https://discord.com/developers/applications)
- [Create a link](https://discord.com/developers/docs/getting-started#step-1-creating-an-app) to invite your bot in your server
- Create an account and get an API key from [OpenAi](https://openai.com/blog/openai-api)

## Get started
### Run with Docker

- get the following files from this repository:
    - `.env.dist`
    - `docker-compose.yaml`
- copy and rename the environment file

```bash
cp .env.dist .env
```

- edit it with your own keys and values
- run with [docker compose](https://docs.docker.com/reference/cli/docker/compose/up/)

```bash
docker compose up
```

## Dev

Edit the environment file as above with values from your development Discord server

### API

To start the API, use the following command

```bash
cd api && bun api:dev
```

This will start the server on `localhost:API_PORT` (by default, port 3001)

### Bot

Deploy the commands on you dev server (only the first time and each time you create a new command):

- [Get your dev server ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-#:~:text=Obtaining%20Server%20IDs%20%2D%20Mobile%20App,name%20and%20select%20Copy%20ID.)
- Add it as `DISCORD_GUILD_ID` in your environment or `.env` file
- run the command deployment script. :warning: The API should be online as the bot needs the list of personas available.

```bash 
cd bot && bun bot:deploy
```

Start the bot in watch mode

```bash
cd bot && bun bot:dev
```

### Frontend

/TBD
