import { ListenerHandler } from "discord-akairo";
import { AkairoClient, CommandHandler } from "discord-akairo";
import { WebhookClient } from "discord.js";
import { Message } from "discord.js";
import { connect, connection } from "mongoose";
import { join } from "path";
import util from "./util";
import { error_logging, client } from "../config.json";

// declare
declare module "discord-akairo" {
	interface AkairoClient {
		commandHandler: CommandHandler;
		listenerHandler: ListenerHandler;
		log(msg: string): void;
		utils: util;
		tickets: boolean;
		hex: string;
	}
}

// client
export default class Client extends AkairoClient {
	private wb: WebhookClient = new WebhookClient(process.env.WB_ID, process.env.WB_TOKEN);
	public utils: util = new util(this);

	public tickets: boolean = true;
	public hex = client?.hex || "#4B5E6A";

	public listenHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, "..", "events"),
	});
	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, "..", "commands"),
		prefix: process.env.PREFIX,
		automateCategories: true,
		allowMention: true,
		blockBots: true,
		blockClient: true,
		commandUtil: true,
		handleEdits: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 1e3,
		argumentDefaults: {
			prompt: {
				modifyStart: (_: Message, str: string): string =>
					`${str} \n\nType \`cancel\` to cancel the command!`,
				modifyRetry: (_: Message, str: string): string =>
					`${str} \n\nType \`cancel\` to cancel the command!`,
				timeout: "This took longer then expected, the command is canceled now!",
				ended: "Please take a break, try again later.",
				cancel: "Command is canceled!",
				retries: 3,
				time: 3e4,
			},
			otherwise: "",
		},
		ignorePermissions: this.ownerID,
		ignoreCooldown: this.ownerID,
	});
	public constructor({ ownerID }: { ownerID: string[] }) {
		super({
			ownerID,
			disableMentions: "everyone",
			messageCacheMaxSize: 50,
			messageCacheLifetime: 60,
			messageSweepInterval: 100,
			ws: {
				intents: [
					"GUILDS",
					"GUILD_MESSAGES",
					"DIRECT_MESSAGES",
					"DIRECT_MESSAGE_REACTIONS",
					"GUILD_MESSAGE_REACTIONS",
				],
			},
			partials: ["REACTION", "USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE"],
		});
	}

	private async _init(): Promise<void> {
		this.commandHandler.useListenerHandler(this.listenHandler);
		this.listenHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenHandler,
			process,
		});

		this.commandHandler.loadAll();
		this.listenHandler.loadAll();
	}

	private connect(): void {
		connect(process.env.DB, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});

		connection
			.on("connecting", () => this.log(`⏳ | Connecting to **${connection.name}** database...`))
			.once("connected", () =>
				this.log(`📁 | Successfully conntected to database: **${connection.name}**!`)
			)
			.on("reconnected", () =>
				this.log(`📁 | Successfully re-connected to database: **${connection.name}**!`)
			)
			.on("disconnected", () =>
				this.log(`❌ | Disconnected from **${connection.name}**! Waiting to reconnect...`)
			)
			.on("error", (error: Error) =>
				this.log(`⚠ | New error - **${connection.name}** - Error: \`${error.message}\``)
			);
	}

	public async start(): Promise<string> {
		await this._init();
		this.connect();
		return this.login(process.env.TOKEN);
	}

	public log(msg: string): void {
		if (typeof error_logging === "boolean" && error_logging) this.wb.send(">>> " + msg);
		console.log(msg.replace(/\*/g, "").replace(/`/g, ""));
	}
}
