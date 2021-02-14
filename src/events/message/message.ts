import { Message, Collection, MessageEmbed } from "discord.js";
import { Listener } from "discord-akairo";
import { iTicket } from "../../models/interfaces";
import Ticket from "../../models/Ticket";
import blacklist from "../../models/blacklist";
import { claimChannel } from "../../config.json";

const filter = new Collection<string, iTicket>();
export default class messageEvent extends Listener {
	constructor() {
		super("message", {
			emitter: "client",
			category: "client",
			event: "message",
		});
	}

	async exec(message: Message) {
		if (message.system || message.author.bot || message.webhookID) return;
		if (message.mentions.users.has(this.client.user.id) && message.content.startsWith("<@"))
			return this.createTicket(message);
		if (message.channel.type === "text" && message.channel.name !== "ticket") return;

		switch (message.channel.type) {
			case "dm":
				{
					if (message.content.trim().startsWith(this.client.commandHandler.prefix as string))
						return;

					let data: iTicket = filter.find((t) => t.userId === message.author.id);
					if (!data) {
						data = await Ticket.findOne({ userId: message.author.id });
						if (!data) return;

						filter.set(data.channelId, data);
						setTimeout(() => filter.delete(data.channelId), 5e3);
					}

					const channel = await this.client.utils.getChannel(data.channelId);
					if (!channel) {
						await Ticket.findOneAndDelete({ userId: message.author.id });
						filter.delete(data.channelId);
					}

					if (data.status === "closed") return;
					const files = this.client.utils.getAttachments(message.attachments);
					try {
						channel.send(
							`>>> 💬 | Reply from ${message.author.toString()}:\n\`\`\`\n${
								message.content.substr(0, 1800) || "No message content."
							}\n\`\`\`❓ | Add \`${
								this.client.commandHandler.prefix
							}\` to block the bot from sending a reply.`,
							{ files, allowedMentions: { users: [] } }
						);
					} catch (e) {
						return message.author
							.send(`>>> ⚠ | I am unable to send messages to this channel.`)
							.catch(async (e) => {
								await Ticket.findOneAndDelete({ userId: message.author.id });
								filter.delete(data.channelId);
								channel.delete("Unable to send messages to the user").catch((e) => null);
							});
					}
				}
				break;
			case "text":
				{
					if (message.content.trim().startsWith(this.client.commandHandler.prefix as string))
						return;

					let data: iTicket = filter.find((t) => t.channelId === message.channel.id);
					if (!data) {
						data = await Ticket.findOne({ channelId: message.channel.id });
						if (!data) return;

						filter.set(data.channelId, data);
						setTimeout(() => filter.delete(data.channelId), 5e3);
					}

					const user = await this.client.utils.fetchUser(data.userId);
					if (!user) {
						await Ticket.findOneAndDelete({ channelId: message.channel.id });
						filter.delete(data.channelId);
					}

					if (data.status === "closed" || data.claimerId !== message.author.id) return;
					const files = this.client.utils.getAttachments(message.attachments);
					try {
						user.send(
							`>>> 💬 | Reply from ${message.author.toString()}:\n\`\`\`\n${
								message.content.substr(0, 1800) || "No message content."
							}\n\`\`\`❓ | Add \`${
								this.client.commandHandler.prefix
							}\` to block the bot from sending a reply.`,
							{ files, allowedMentions: { users: [] } }
						);
					} catch (e) {
						return message.channel
							.send(`>>> ⚠ | I am unable to send messages to this user.`)
							.catch(async (e) => {
								await Ticket.findOneAndDelete({ userId: message.author.id });
								filter.delete(data.channelId);
								message.channel.delete("Unable to send messages to the user").catch((e) => null);
							});
					}
				}
				break;
			default:
				return;
		}

		message.react("✅");
	}

	async createTicket(message: Message) {
		let data: iTicket =
			filter.find((t) => t.userId === message.author.id) ||
			(await Ticket.findOne({ userId: message.author.id }));
		if (data) return;

		if (await blacklist.findOne({ userId: message.author.id }))
			return message.author
				.send(
					">>> 🔒 | You have been blacklisted, you can not use the ticket system until you are removed from the blacklist."
				)
				.catch((e) => null);
		if (!this.client.tickets)
			return message.author
				.send(">>> 🔒 | Tickets have been disabled, please try again later.")
				.catch((e) => null);

		const dm = await message.author.createDM();
		let msg: Message;
		try {
			msg = await dm.send(
				">>> 👋 | Hello! What is the reason behind your ticket today? Please provide as much detail as possible so that we can help you as best as we can!"
			);
		} catch (e) {
			return message.channel.send(
				">>> ❗ | Sorry, it looks like your DMs are closed. Please open them, otherwise I am unable to open a ticket for you."
			);
		}

		const Filter = (m: Message) => {
			return message.author.id === m.author.id && message.content.length > 0;
		};
		const collector = await dm
			.awaitMessages(Filter, { max: 1, time: 6e5, errors: ["time"] })
			.catch((e) => new Collection<string, Message>());
		if (!collector || collector.size < 0) return msg.delete();

		const m = collector.first();
		const channel = await this.client.utils.getChannel(claimChannel);
		if (!channel) return dm.send("No channel found, please contact the developer of this bot.");

		const claimMsg = await channel
			.send(
				new MessageEmbed()
					.setTitle(`New ticket - ${message.author.tag}`)
					.setDescription(m.content.substr(0, 2048))
					.setFooter("React with ✔ to claim this ticket.")
					.setColor(this.client.hex)
			)
			.catch((e) =>
				dm.send("I am unable to send messages or add embed links in the ticket claim channel.")
			);

		claimMsg
			.react("✔")
			.catch((e) =>
				this.client.log(
					"⚠ | Unable to add `Message Reactions` to messages in the ticket claim channel."
				)
			);

		await Ticket.create({
			messageId: claimMsg.id,
			channelId: "channelId",
			userId: message.author.id,
			claimerId: "claimerId",
			status: "unclaimed",
		});

		dm.send(
			">>> 🎫 | Ticket has been created, a staff member will reach out to you shortly.\n❗ | Make sure your DMs stay **open**!"
		);
	}
}
