import addMinutes from 'date-fns/addMinutes';
import { ColorResolvable, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { EmperorEmbedder } from './emperor_embedder';
import * as schedule from 'node-schedule';
import * as log from './logging';
import { randomBytes } from 'crypto';

export class Sender extends EmperorEmbedder {
  client: any;
  guild: any;
  channel: any;
  color: any;

  constructor(client: any, guildID: string, channelID: string, color?: ColorResolvable) {
    super(client.user);
    this.color = color;
    this.client = client;
    this.guild = this.client.guilds.cache.get(guildID);
    this.channel = this.guild.channels.cache.get(channelID);
  }

  send(title: string, body: string, contentPayload?: string): void {
    const embed = this.emperorEmbed(title, body, this.color);
    if (contentPayload && contentPayload !== '') {
      this.channel.send({ embeds: [embed], content: contentPayload });
    }
    else {
      this.channel.send({ embeds: [embed] });
    }
  }

  sendAdvanced(userName: string, userAvatarUrl: string, title: string, body: string, contentPayload?: string): void {
    const embedder = new EmperorEmbedder(userName, userAvatarUrl)
    const embed = embedder.emperorEmbed(title, body, this.color)
    if (contentPayload && contentPayload !== '') {
      this.channel.send({ embeds: [embed], content: contentPayload });
    }
    else {
      this.channel.send({ embeds: [embed] });
    }
  }
}

export class Replier extends EmperorEmbedder {
  interaction: any;
  color: ColorResolvable;

  constructor(interaction: any | CommandInteraction, color?: ColorResolvable) {
    super(interaction.user);
    this.interaction = interaction;
    this.color = color;
  }

  reply(title: string, body: string, ephemeral?: boolean): void {
    const embed = this.emperorEmbed(title, body, this.color);
    this.interaction.reply({ embeds: [embed], ephemeral: ephemeral });
  }

  async editReply(title: string, body: string): Promise<any> {
    const embed = this.emperorEmbed(title, body, this.color);
    return this.interaction.editReply({ embeds: [embed] });
  }

  async editReplyWithComponent(title: string, body: string, component: any): Promise<any> {
    const embed = this.emperorEmbed(title, body, this.color);
    return this.interaction.editReply({ embeds: [embed], components: [component] });
  }

  async editReplyRemoveComponents(title: string, body: string): Promise<any> {
    const embed = this.emperorEmbed(title, body, this.color);
    return this.interaction.editReply({ embeds: [embed], components: [] });
  }

  replyNormal(body: string, ephemeral?: true): void {
    this.interaction.reply({ content: body, ephemeral: ephemeral });
  }

  async followUp(title: string, body: string, ephemeral?: boolean): Promise<any> {
    const embed = this.emperorEmbed(title, body, this.color);
    return this.interaction.followUp({ embeds: [embed], ephemeral: ephemeral, fetchReply: true });
  }

  async followUpNonEphemeral(title: string, body: string): Promise<any> {
    const embed = this.emperorEmbed(title, body, this.color);
    return this.interaction.followUp({ embeds: [embed], ephemeral: false, fetchReply: true });
  }

  async followUpEphemeral(title: string, body: string): Promise<any> {
    const embed = this.emperorEmbed(title, body, this.color);
    return this.interaction.followUp({ embeds: [embed], ephemeral: true, fetchReply: true });
  }

  async followUpWithComponent(title: string, body: string, component: any, ephemeral?: boolean): Promise<any> {
    const embed = this.emperorEmbed(title, body, this.color);
    return this.interaction.followUp({ embeds: [embed], components: [component], ephemeral: ephemeral, fetchReply: true });
  }
}

export class ExtendedReplier extends Replier {
  interaction: any;
  color: ColorResolvable;
  canEditOriginal: boolean;

  constructor(interaction: any, canEditOriginal: boolean, color?: ColorResolvable) {
    super(interaction);
    this.canEditOriginal = canEditOriginal;
    this.color = color;
  }

  async respond(title: string, body: string, ephemeral?: boolean): Promise<any> {
    if (this.canEditOriginal === false && ephemeral === true) {
      return this.followUpEphemeral(title, body);
    }
    else if (this.canEditOriginal === false && ephemeral === false) {
      return this.followUpNonEphemeral(title, body);
    }
    else if (this.canEditOriginal === false) {
      return this.followUpNonEphemeral(title, body);
    }
    else {
      return this.editReply(title, body);
    }
  }
}

export class Retorter extends ExtendedReplier {
  messageElementSeparator: string;
  maximumMessageLength: number;

  constructor(info: any, messageElementSeparator: string, maximumMessageLength: number) {
    super(info.replier.interaction, info.canEditOriginal, info.replier.color);
    this.messageElementSeparator = messageElementSeparator;
    this.maximumMessageLength = maximumMessageLength;
  }

  private paginate(title: string, body: string): MessageEmbed[] {
    const textElements = body.split(this.messageElementSeparator);

    const embedPrepared: string[] = [];
    let textBufferCurrent = '';
    let textBufferPrevious = '';
    for (const i in textElements) {
      if (textElements[i].length > this.maximumMessageLength) {
        throw new Error('Single text element surpassed the maximum length');
      }

      textBufferCurrent += `${textElements[i]}${this.messageElementSeparator}`;
      if (textBufferCurrent.length > this.maximumMessageLength) {
        textBufferCurrent = `${textElements[i]}${this.messageElementSeparator}`;
        embedPrepared.push(textBufferPrevious);
      }

      if (parseInt(i) === textElements.length - 1) {
        embedPrepared.push(textBufferCurrent);
      }

      textBufferPrevious = textBufferCurrent;
    }

    const embeds: MessageEmbed[] = [];
    for (const i in embedPrepared) {
      const embed = this.paginatedEmperorEmbed(title, embedPrepared[i], parseInt(i) + 1, embedPrepared.length, this.color);
      embeds.push(embed);
    }
    return embeds;
  }

  private determineRow(embeds: MessageEmbed[], currentPage: number, beginningButtons: MessageActionRow, middleButtons: MessageActionRow, endButtons: MessageActionRow): MessageActionRow {
    switch (currentPage) {
    case 0:
      return beginningButtons;
    case embeds.length - 1:
      return endButtons;
    default:
      return middleButtons;
    }
  }

  // for this function to work, the embeds array should always include at least 2 embeds.
  // for the time being, the caller should make sure of this.
  private async retortProcedure(embeds: MessageEmbed[], isFollowUp: boolean, ephemeral?: boolean): Promise<void> {
    const backId = randomBytes(4).toString('hex');
    const forwardId = randomBytes(4).toString('hex');
    const pageButtonId = randomBytes(4).toString('hex');

    const beginningButtons = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(backId)
        .setLabel('<')
        .setStyle('SECONDARY')
        .setDisabled(true),
      new MessageButton()
        .setCustomId(pageButtonId)
        .setLabel('Go to...')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(forwardId)
        .setLabel('>')
        .setStyle('SECONDARY'),
    );

    const middleButtons = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(backId)
        .setLabel('<')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setCustomId(pageButtonId)
        .setLabel('Go to...')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(forwardId)
        .setLabel('>')
        .setStyle('SECONDARY'),
    );

    const endButtons = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(backId)
        .setLabel('<')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setCustomId(pageButtonId)
        .setLabel('Go to...')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(forwardId)
        .setLabel('>')
        .setStyle('SECONDARY')
        .setDisabled(true),
    );

    const filter = i => i.customId === backId || i.customId === forwardId || i.customId === pageButtonId && i.user.id === this.interaction.user.id;
    const collector = await this.interaction.channel.createMessageComponentCollector({ filter, time: 840000 });

    isFollowUp === true ? await this.interaction.followUp({ embeds: [embeds[0]], ephemeral: ephemeral, components: [beginningButtons], fetchReply: true }) : await this.interaction.editReply({ embeds: [embeds[0]], ephemeral: ephemeral, components: [beginningButtons], fetchReply: true });

    let currentPage = 0;
    const timeout = addMinutes(new Date(), 13);
    collector.on('collect', async i => {
      if (i.customId === backId) {
        currentPage -= 1;
        const row = this.determineRow(embeds, currentPage, beginningButtons, middleButtons, endButtons);
        await i.update({ embeds: [embeds[currentPage]], components: [row] });
      }
      else if (i.customId === pageButtonId) {
        const messageFilter = m => this.interaction.user.id === m.author.id;
        const messageCollector = this.interaction.channel.createMessageCollector({ messageFilter, time: 300000 });

        const title = embeds[currentPage].title;
        let text = embeds[currentPage].description;
        if (!text.endsWith('\n\n')) {
          if (text.endsWith('\n')) {
            text += '\n';
          }
          else {
            text += '\n';
          }
        }
        text += '*Awaiting page input...*';
        const awaitingPageInputEmbed = this.paginatedEmperorEmbed(title, text, currentPage + 1, embeds.length, this.color);

        await i.update({ embeds: [awaitingPageInputEmbed] });
        messageCollector.once('collect', async j => {
          await messageCollector.stop();

          try {
            await j.delete();
          }
          catch(e) {
            log.debug(`Couldn't delete message ${j.id}: ${e}.`)
          }

          const n = parseInt(j.content);
          if (isNaN(n)) {
            await i.editReply({ embeds: [embeds[currentPage]] });
            this.interaction.followUp({ content: 'That doesn\'t seem to be a number.', ephemeral: true });
          }
          else if (n > embeds.length || n < 1) {
            await i.editReply({ embeds: [embeds[currentPage]] });
            this.interaction.followUp({ content: 'That number is not within page bounds.', ephemeral: true });
          }
          else {
            currentPage = n - 1;
            const row = this.determineRow(embeds, currentPage, beginningButtons, middleButtons, endButtons);
            await i.editReply({ embeds: [embeds[currentPage]], components: [row] });
          }
        });
      }
      else if (i.customId === forwardId) {
        currentPage += 1;
        const row = this.determineRow(embeds, currentPage, beginningButtons, middleButtons, endButtons);
        await i.update({ embeds: [embeds[currentPage]], components: [row] });
      }

      if (collector.collected.size === 1) {
        schedule.scheduleJob(timeout, async function(){
          await collector.stop();
          try {
            await i.editReply({ content: '*This interactive message has expired.*', components: [] });
          }
          catch(e) {
            log.debug(`Couldn't modify expired interactive msesage: ${e}`);
          }
        });
      }
    });

    const interaction = this.interaction;
    schedule.scheduleJob(timeout, async function(){
      await collector.stop();
      try {
        if (collector.collected.size === 0 && !isFollowUp) {
          await interaction.editReply({ content: '*This interactive message has expired.*', components: [] });
        }
        else if (collector.collected.size === 0 && isFollowUp) {
          await interaction.editReply({ content: '*The interactive message associated with this exchange has expired.*', components: [] });
        }
      }
      catch(e) {
        log.debug(`Couldn't modify expired message: ${e}`);
      }
    });
  }

  private calculateThreshold(n: number, targetPercent: number): number {
    return (targetPercent / 100) * n;
  }

  async retort(title: string, body: string, ephemeral?: boolean): Promise<any> {
    if (body.length > this.calculateThreshold(this.maximumMessageLength, 120)) {
      const embeds = this.paginate(title, body);
      if (this.canEditOriginal === false && ephemeral !== undefined) {
        return this.retortProcedure(embeds, true, ephemeral);
      }
      else if (this.canEditOriginal === false) {
        return this.retortProcedure(embeds, true, false);
      }
      else {
        return this.retortProcedure(embeds, false);
      }
    }
    else {
      return this.respond(title, body, ephemeral);
    }
  }
}
