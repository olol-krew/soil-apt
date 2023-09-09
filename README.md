# SoilAPT

SoilAPT is a Discord bot made for friends. It uses ChatGPT and has basically 2 functions:

- Start a message with `@SoilAPT` to prompt something to ChatGPT as you normally would. ChatGPT will have the personnality of a slightly rude friend.
- Create a response message starting with `@SoilAPT` from another message and prompt something about it as context.

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

- Start the bot in watch mode

```
bun dev
```

## Prod

- No need to transpile with Bun

```
bun src/index.ts
```

- if you have [`forever`](https://www.npmjs.com/package/forever) installed, you can use `bun prod` to run the bot in the background.
