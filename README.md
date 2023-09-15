# SoilAPT

SoilAPT is a Discord bot made for friends. It uses ChatGPT and has basically 2 functions:

- Start a message with `@SoilAPT` to prompt something to ChatGPT as you normally would.
- Create a response message starting with `@SoilAPT` from another message and prompt something about it as context. The bot will get all the responses of responses too, so you can have a conversation as in the web UI.
- SoilAPT has a personality disorder. Everyday at midnight, it will randomly pick from a list of personas made by my community of friends.

## Pre-requirements

- Create a Discord App in the [developer portal](https://discord.com/developers/applications)
- [Create a link](https://discord.com/developers/docs/getting-started#step-1-creating-an-app) to invite your bot in your server
- Create an account and get an API key from [OpenAi](https://openai.com/blog/openai-api)

## Get started

- clone this repository
- edit the .env file with your own keys

```
cp .env.dist .env
```

## Dev

- Deploy the commands on you dev server (only the first time and each time you create a new command):
  - [Get your dev server ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-#:~:text=Obtaining%20Server%20IDs%20%2D%20Mobile%20App,name%20and%20select%20Copy%20ID.)
  - Add it as `DISCORD_GUILD_ID` in your environment or `.env` file
  - run the deployment script
  ```
  bun src/helpers/deploy-commands.ts
  ```
- Start the bot in watch mode

  ```
  bun dev
  ```

- To force the use of a specific persona, first get its ID from the list of personas in `src/data/personas.yml`, then pass it with the `--force-persona <ID>` flag

  Example

  ```
  bun dev --force-persona 3
  ```

## Prod

- No need to transpile with Bun

```
bun src/index.ts
```
