# Modmail Bot
A simple modmail bot created with typescript and discord.js.

# Installation
```js npm install``` you will need to do this in order to install the required packages.

# Using the bot
run `npm run dev` if you want to edit the bot and want it to restart everytime it saves.
run `npm run build` to create a build and than `npm run start` to start the bot.

# dotenv Example
```ts
DISCORD_BOT_TOKEN= //bot token here
DISCORD_BOT_PREFIX= //prefix here
GUILD_ID= // guild id here
TICKET_LOGS= // ticket log channel here
```

You will need to add a `.env` file if you want to run your bot on a vps or your own pc, if you want to use heroku, I would recommend using the built-in envoirment variables system. Don't forget to copy the exact names of the enviorment variables, if you don't dont that, you will break the system.