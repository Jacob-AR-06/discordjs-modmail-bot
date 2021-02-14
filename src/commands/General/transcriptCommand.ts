import { exec } from "child_process";
import { Command } from "discord-akairo";
import { Message, MessageAttachment, TextChannel } from "discord.js";
import { join } from "path";

export default class transcriptCommand extends Command {
	public constructor() {
		super("transcript", {
			aliases: ["transcript"],
			channel: "guild",
			description: {
				content: "transcript any channel.",
				usage: "transcript [channel]",
			},
			args: [
				{
					id: "channelId",
					type: "string",
					default: (m: Message) => m.channel.id,
				},
			],
		});
	}

	async exec(message: Message, { channelId }: { channelId: string }) {
		const channel = (await this.client.utils.getChannel(channelId)) || message.channel;
		message.channel.startTyping();

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
				cwd: join(process.cwd(), "chatExporter"),
			},
			async (e, stdout) => {
				message.channel.stopTyping();
				if (e) return this.client.log(`⚠ | Transcript error: \`${e}\``);

				const dir = join(
					__dirname,
					"..",
					"..",
					"..",
					"transcripts",
					`${message.guild.name} - ${(message.channel as TextChannel).parent?.name || "text"} - ${
						(message.channel as TextChannel).name
					} [${message.channel.id}].html`
				);

				channel
					.send(new MessageAttachment(dir, `${message.channel.id}-ticket.html`))
					.catch((e) => null);
			}
		);
	}
}
