<h1 align="center">Welcome to modmail-bot 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-2.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/DaanGamesDG/discordjs-modmail-bot#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/DaanGamesDG/discordjs-modmail-bot/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/DaanGamesDG/discordjs-modmail-bot/blob/master/LICENSE" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/github/license/DaanGamesDG/modmail-bot" />
  </a>
  <a href="https://twitter.com/DaanGamesDG" target="_blank">
    <img alt="Twitter: DaanGamesDG" src="https://img.shields.io/twitter/follow/DaanGamesDG.svg?style=social" />
  </a>
</p>

> The only modmail-bot you need to improve communication in your discord server. Easy to use, requires little permissions, database usage (ticket store) and customisable

## Install

```sh
yarn install / npm install
```

Install all needed dependencies in order to work.

## Setup

❗ **permissions**

The best option is go give the bot `Administrator` permissions, but you can do it the hard way and only give the permissions it needs. Required permissions:

- Read & Send Messages ~ (obivously) If the bot isn't able to read messages or send messages, it doesn't respond to your requests.
- Manage Channels ~ (required) This is needed so the bot is able to create / edit / delete channels.
- Embed Links & Message Attachments ~ (required) Without the bot isn't able to send 9/10 messages.
- Add Reactions ~ (required) This is needed to show that the ticket owner has received the reply and to be able to setup the ticket claim system.

**Starting the bot**

It's a really simple process, first you need to rename the `.env.example` to `.env`. After that fill in the gaps!

This is what you should fill in:

```
TOKEN= <discord bot token>
DB= <mongodb url>

WB_ID= <webhook id> -> used to log errors, check the config.json file to turn it off or on!
WB_TOKEN= <webhook token> -> used to log errors, check the config.json file to turn it off or on!

PREFIX= <prefix>
```

Do **not** add any spaces, everything should be connected to each other. Otherwise you will get an error.
Do the same for the `config.json.example` file, rename it to `config.json.example`. Once you done that you can edit the bot's status, activity etc!

Let me show you what is what exactly:

```js
{
	"owners": ["owner_ids_here"], // ids of the users that a have access to owner only commands
	"error_logging": true, // whether or not to enable webhook logging
	"claimChannel": "claim_channel_id", // channel id to claim tickets
	"category": "category_id_here", // category id for the ticket channels (leave emtpy if none)
	"roleId": "helper_role_here", // role for the people that have access to the tickets (leave emtpy if none)
	"transcript": {
		"enabled": false, // whether or not to enable transcripts
		"channel": "channel_id_here" // transcripts channel id
	},
	"client": {
		"activity": "with your tickets!", // activity message
		"type": "PLAYING", // activity type (PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM_STATUS, COMPETING)
		"status": "online", // status type (online, invisible, dnd, idle)
		"hex": "#4B5E6A" // color for the embeds
	}
}
```

If you remove one of the items / give them the wrong value, the bot might crash.
When transcripts are enabled you should have `.net runtime` installed on your pc, you must have a folder inside the main bot folder called "chatExporter" with the [discordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) program inside it, otherwise it won't work. For more information about it please check [this](https://github.com/Tyrrrz/DiscordChatExporter/wiki). I am **not** responsable for any issues regarding the transcriptor part.

In order to run the bot you need to have [NodeJS](https://nodejs.org/en/), I recommend using the 14.x version. To run the bot open your terminal, go to the correct directory and type `yarn run start / npm run start`, this will make a build and start the bot. After that, your done! Bot should be running without problems, yay 🎉.

## Commands & Features

The bot has the basic commands such as exec, eval, ping, help but also a close, contact, transcript, blacklist command. When running the close command with transcripts turned on, the bot will display a type status, during this period it is transcripting the channel. This may take a while depending on your pc hardware. Once finished it will delete the channel and save the transcript to a channel.

List of commands:

- Close
- Transcript (requires [discordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter))
- Contact
- Blacklist
- whitelist
- Ping
- Help
- Stats
- Eval
- Exec
- Reload

Users with `Manage Channel` permissions bypass the ticket claimer id check, this means they can force close / force transfer a ticket!
The database is only used to save ticket data and blacklists, once a ticket is deleted the data in the database will as well. You can get **512mb** for free, that's enough for a this bot.

## Author

👤 **DaanGamesDG**

- Website: https://daangamesdg.wtf/
- Twitter: [@DaanGamesDG](https://twitter.com/DaanGamesDG)
- Github: [@DaanGamesDG](https://github.com/DaanGamesDG)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/DaanGamesDG/modmail-bot/issues).

## Show your support

Give a ⭐️ if this project helped you!
Feel free to donate me if you want to: <br />
<a href="https://www.paypal.me/DaanGamesDG/">
<img alt="Support via PayPal" src="https://cdn.rawgit.com/twolfson/paypal-github-button/1.0.0/dist/button.svg"/>
</a>

## 📝 License

Copyright © 2021 [DaanGamesDG](https://github.com/DaanGamesDG).<br />
This project is [Apache-2.0](https://github.com/DaanGamesDG/discordjs-modmail-bot/blob/master/LICENSE) licensed.
