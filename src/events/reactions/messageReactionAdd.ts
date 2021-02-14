import { Listener } from "discord-akairo";
import { MessageReaction, User, MessageEmbed, Role } from "discord.js";
import { claimChannel, category, roleId } from "../../config.json";
import Ticket from "../../models/Ticket";

export default class messageReactionAdd extends Listener {
	constructor() {
		super("messageReactionAdd", {
			emitter: "client",
			event: "messageReactionAdd",
			category: "client",
		});
	}

	async exec(reaction: MessageReaction, user: User) {
		try {
			if (reaction.partial) reaction = await reaction.fetch();
			if (user.partial) user = await user.fetch();

			let message = reaction.message;
			if (message.partial) message = await message.fetch();

			if (
				reaction.emoji.name !== "✔" ||
				user.system ||
				user.bot ||
				message.channel.id !== claimChannel
			)
				return;

			const ticket = await Ticket.findOne({ messageId: message.id });
			if (!ticket) return;

			const channel = await message.guild.channels.create("ticket", {
				type: "text",
				parent: category,
				permissionOverwrites: [
					{
						id: message.guild.id,
						deny: ["VIEW_CHANNEL"],
					},
					{
						id: this.client.user.id,
						allow: [
							"VIEW_CHANNEL",
							"ADD_REACTIONS",
							"EMBED_LINKS",
							"SEND_MESSAGES",
							"ATTACH_FILES",
							"MANAGE_MESSAGES",
						],
					},
					{
						id: user.id,
						allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES"],
					},
				],
			});

			if (roleId.length === 18)
				await channel
					.updateOverwrite(roleId, {
						VIEW_CHANNEL: true,
						SEND_MESSAGES: true,
						ATTACH_FILES: true,
					})
					.catch((e) => null);

			ticket.channelId = channel.id;
			ticket.claimerId = user.id;
			ticket.status = "open";
			await ticket.save();

			const embed = message.embeds[0];
			const ticketOwner = await this.client.utils.fetchUser(ticket.userId);
			channel
				.send(
					new MessageEmbed()
						.setTitle(`ticket - ${ticketOwner.tag}`)
						.setDescription(embed.description)
						.setFooter(`Claimed by ${user.tag}`)
						.setColor(this.client.hex)
				)
				.then((m) => m.pin().catch((e) => null));

			message.delete();
		} catch (e) {
			this.client.log(`⚠ | Reaction add event error: \`${e}\``);
		}
	}
}
