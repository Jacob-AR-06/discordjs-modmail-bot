import BaseEvent from '../utils/structures/BaseEvent';
import { DMChannel, TextChannel, Message, Guild, ReactionEmoji, User, MessageReaction } from 'discord.js';
import DiscordClient from '../client/client';

export default class DmEvent extends BaseEvent {
  constructor() {
    super('dm');
  }

  async run(client: DiscordClient, message: Message) {
    const channel: DMChannel = await message.author.createDM();
    const guild: Guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild.available) return channel.send('> 🔥 | It looks like the server you tried to contact is on an outage, please try again later!').catch(e => { if (e) return; });
    const ticket: TextChannel = guild.channels.cache.filter(c => c.name.startsWith(message.author.id) && c.name.endsWith('-ticket')).first() as TextChannel;
    if (ticket) return this.ticket(client, message, ticket);

    try {
      await channel.send(`> 🎫 | Ticket is created, you will receive a response shortly.`);
    } catch (e) { if (e) return; }

    const ticketClaimChannel: TextChannel = guild.channels.cache.get('739542689904591008') as TextChannel;
    try {
      const filter = (reaction: MessageReaction, user: User) => {
        return ['✅'].includes(reaction.emoji.name) && !user.bot;
      };

      const m = await ticketClaimChannel.send(
        `> 🎫 | New ticket opened: \n > 👤 | User: **${message.author.tag}** \n > 💬 | Message: \`\`\`${message.content}\`\`\` \n > ✅ | React to this message to claim the ticket.`
      );
      await m.react('✅');
      m.awaitReactions(filter, { max: 1, time: 864e5, errors: ['time'] })
      .then(collected => {
        const claimer = collected.first().users.cache.last();
        const claimMsg = collected.first().message;
        claimMsg.reactions.removeAll();
        claimMsg.edit(`> 🎫 | New ticket opened and claimed: \n > 👤 | User: **${message.author.tag}** \n > 💬 | Message: \`\`\`${message.content}\`\`\` \n > ❌ | Ticket claimed by **${claimer.tag}**!`);
        return this.handleticket(message, channel, claimer, guild, claimMsg);
      })
      .catch(collected => {
        return channel.send(`> ❌ | No one claimed your ticket on time, please open a new one or reach out to a admin/mod directly.`);
      });
    } catch (e) { }
  }
  
  async ticket(client: DiscordClient, message: Message, channel: TextChannel) {
    const prefix = process.env.DISCORD_BOT_PREFIX;
    if (message.content.startsWith(prefix)) return this.handleCommands(client, message);

    const claimer = client.users.cache.get(channel.name.slice(19).slice(0, -7));

    try {
      await channel.send(
        `> 💬 | **${message.author.tag}**: \`\`\`${message.content}\`\`\` \n > ❓ | To reply send a message in this channel. \n > Use \`${prefix}\` if you don't want to respond with a message. \n > use \`${prefix}transfer <user name/id/mention/tag>\` to transfer \n > and use \`${prefix}close\` to close the ticket.`
      );
      return message.channel.send(`> ✅ | Reply successfully sent to **${claimer.tag}**!`);
    } catch (e) {
      console.log(e);
    }
  }

  async channelTicket(client: DiscordClient, message: Message) {
    const prefix = process.env.DISCORD_BOT_PREFIX;
    if (message.content.startsWith(prefix)) return this.handleCommands(client, message);

    const ticketChannel: TextChannel = message.channel as TextChannel;
    const opener = client.users.cache.get(ticketChannel.name.slice(0, -26));
    const channel: DMChannel = await opener.createDM();

    try {
      await channel.send(
        `> 💬 | **${message.author.tag}**: \`\`\`${message.content}\`\`\` \n > ❓ | To reply send a DM to me. \n > Use \`${prefix}\` if you don't want to respond with a message. \n > and use \`${prefix}close\` to close the ticket.`
      );
      return ticketChannel.send(`> ✅ | Reply successfully sent to **${opener.tag}**!`);
    } catch (e) {
      console.log(e);
    }
  }

  async handleticket(message: Message, channel: DMChannel, claimer: User, guild: Guild, claimLogMessage: Message) {
    const prefix = process.env.DISCORD_BOT_PREFIX;
    try {
      const ticketChannel = await guild.channels.create(message.author.id + '-' + claimer.id + '-ticket', { type: 'text', topic: 'Do not rename this channel name or change the description, doing so might break the bot - ' + claimLogMessage.id });
      ticketChannel.updateOverwrite(claimer, { SEND_MESSAGES: true, VIEW_CHANNEL: true, ATTACH_FILES: true });
      ticketChannel.updateOverwrite(guild.me, { SEND_MESSAGES: true, VIEW_CHANNEL: true, ATTACH_FILES: true });
      ticketChannel.updateOverwrite(guild.id, { SEND_MESSAGES: false, VIEW_CHANNEL: false });
      await ticketChannel.send(
        `> 👤 | User: **${message.author.tag}** \n > 💬 | Message: \`\`\`${message.content}\`\`\` \n > ❓ | Use \`${prefix}\` if you don't want to respond with a message, \n > use \`${prefix}transfer <user name/id/mention/tag>\` to transfer \n > and use \`${prefix}close\` to close the ticket.`
      );
      channel.send(`> 👥 | Ticket is claimed by **${claimer.tag}**, you should receive a response shortly.`);
    } catch (e) {
      console.log(e);
    }
  }

  handleCommands(client: DiscordClient, message: Message) {
    const [cmdName, ...cmdArgs] = message.content
      .slice(client.prefix.length)
      .trim()
      .split(/\s+/);
    const command = client.commands.get(cmdName);
    if (command) {
      command.run(client, message, cmdArgs);
    }
  }
}