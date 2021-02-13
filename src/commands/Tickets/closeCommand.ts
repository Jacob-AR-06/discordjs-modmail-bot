import { Command } from "discord-akairo";
import { Message, MessageAttachment, TextChannel } from "discord.js";
import Ticket from "../../models/Ticket";
import { transcript } from "../../config.json";
import { join } from "path";
import { exec } from "child_process";
import { unlink } from "fs/promises";

export default class closeCommand extends Command {
	public constructor() {
		super("close", {
			aliases: ["close"],
			channel: "guild",
			description: {
				content: "Closes a ticket and transcripts the channel if enabled",
				usage: "close",
			},
		});
	}

	async exec(message: Message) {
		if (message.channel.type !== "text") return;
		if (message.channel.name !== "ticket") return;

		const config = await Ticket.findOne({ channelId: message.channel.id });
		if (!config) return;

		if (transcript.enabled) {
			message.channel.startTyping();
			const channel = await this.client.utils.getChannel(transcript.channel);
			if (channel) {
				exec(
					`${
						process.platform === "win32"
							? "DiscordChatExporter.Cli.exe"
							: "dotnet DiscordChatExporter.Cli.dll"
					} export -c ${message.channel.id} -t ${this.client.token} -o ${join(
						__dirname,
						"..",
						"..",
						"..",
						"transcripts"
					)} -b`,
					{
						cwd: join(process.cwd(), "transcriptor"),
					},
					async (e, stdout) => {
						if (e) return this.client.log(`⚠ | Transcript error: \`${e}\``);

						const dir = join(
							__dirname,
							"..",
							"..",
							"..",
							"transcripts",
							`${message.guild.name} - ${
								(message.channel as TextChannel).parent?.name || "text"
							} - ${(message.channel as TextChannel).name} [${message.channel.id}].html`
						);

						channel.send(new MessageAttachment(dir));

						config.status = "closed";
						await config.save();
						message.channel.stopTyping();

						setTimeout(() => {
							config.delete();
							message.channel.delete("deleted by user");
							unlink(dir);
						}, 5e3);
						message.channel.send(">>> 🗑 | Deleting this ticket in **5 seconds**!");
					}
				);
			} else {
				config.status = "closed";
				await config.save();
				message.channel.stopTyping();

				setTimeout(() => {
					config.delete();
					message.channel.delete("deleted by user");
				}, 5e3);
				message.channel.send(">>> 🗑 | Deleting this ticket in **5 seconds**!");
			}
		} else {
			config.status = "closed";
			await config.save();
			message.channel.stopTyping();

			setTimeout(() => {
				config.delete();
				message.channel.delete("deleted by user");
			}, 5e3);
			message.channel.send(">>> 🗑 | Deleting this ticket in **5 seconds**!");
		}
	}
}
