import { Listener } from "discord-akairo";
import { ActivityType, PresenceStatusData } from "discord.js";
import { client } from "../config.json";

export default class ready extends Listener {
	constructor() {
		super("ready", {
			emitter: "client",
			event: "ready",
			category: "client",
		});
	}

	async exec() {
		if (client) {
			await this.client.user.setActivity(
				typeof client.activity === "string" ? client.activity : "Activity(config) is not a string",
				{
					type:
						typeof client.type === "string" &&
						[
							"PLAYING",
							"STREAMING",
							"LISTENING",
							"WATCHING",
							"CUSTOM_STATUS",
							"COMPETING",
						].includes(client.type.toUpperCase())
							? (client.type.toUpperCase() as ActivityType)
							: "PLAYING",
				}
			);

			await this.client.user.setStatus(
				typeof client.status === "string" &&
					["online", "idle", "dnd", "invisible"].includes(client.status.toLowerCase())
					? (client.status.toLowerCase() as PresenceStatusData)
					: "online"
			);
		} else this.client.log("⚠ | config.client is missing properties.");

		this.client.log(`✅ | **${this.client.user.tag}** has logged in!`);
	}
}
