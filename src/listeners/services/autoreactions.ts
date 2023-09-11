import { Events, Listener } from '@sapphire/framework';
import {
  EmojiResolvable,
  Message,
  MessageManager,
  TextBasedChannel,
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { getRepliedMessage } from '../../lib/content';
import { includesAll, includesAny, isAnyOf } from '../../lib/util';

enum ReactionUnitType {
  Emoji = 'EmojiReaction',
  Send = 'SendReaction',
  Reply = 'ReplyReaction',
}

enum ReactionUnitStrategy {
  IncludesAny = 'IncludesAny',
  IncludesAll = 'IncludesAll',
  IsEntireMessage = 'IsEntireMessage',
  IsAtStart = 'IsAtStart',
  IsAtEnd = 'IsAtEnd',
  RegexTest = 'RegexTest',
}

interface EmojiReactionUnit {
  type: ReactionUnitType.Emoji;
  strategy: ReactionUnitStrategy;
  triggers: (string | RegExp)[];
  qualifications: string[];
  operateOnTriggered: boolean;
  operateOnReferenced: boolean;
  emojiResolvables: EmojiResolvable[];
  guildsWhitelist: string[];
}

interface SendReactionUnit {
  type: ReactionUnitType.Send;
  strategy: ReactionUnitStrategy;
  triggers: (string | RegExp)[];
  qualifications: string[];
  message: string;
  guildsWhitelist: string[];
}

interface ReplyReactionUnit {
  type: ReactionUnitType.Reply;
  strategy: ReactionUnitStrategy;
  triggers: (string | RegExp)[];
  qualifications: string[];
  operateOnTriggered: boolean;
  operateOnReferenced: boolean;
  reply: string;
  guildsWhitelist: string[];
}

type ReactionUnit = EmojiReactionUnit | SendReactionUnit | ReplyReactionUnit;

@ApplyOptions<Listener.Options>({ event: Events.MessageCreate })
export class UserListener extends Listener<typeof Events.MessageCreate> {
  private triggered() {
    return this.container.config.general.autoreactions === true;
  }

  public static rawJsonToUnits(jsonArray: any): ReactionUnit[] {
    const units: ReactionUnit[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const rawUnit of jsonArray) {
      const triggers =
        rawUnit.strategy === ReactionUnitStrategy.RegexTest
          ? rawUnit.triggers.map((t) => new RegExp(t))
          : rawUnit.triggers;

      if (rawUnit.type === ReactionUnitType.Emoji) {
        units.push({
          type: rawUnit.type,
          strategy: rawUnit.strategy,
          triggers,
          qualifications: rawUnit.qualifications,
          operateOnTriggered: rawUnit.operate_on_triggered,
          operateOnReferenced: rawUnit.operate_on_referenced,
          emojiResolvables: rawUnit.emoji_resolvables,
          guildsWhitelist: rawUnit.guilds_whitelist,
        });
      } else if (rawUnit.type === ReactionUnitType.Send) {
        units.push({
          type: rawUnit.type,
          strategy: rawUnit.strategy,
          triggers,
          qualifications: rawUnit.qualifications,
          message: rawUnit.message,
          guildsWhitelist: rawUnit.guilds_whitelist,
        });
      } else {
        units.push({
          type: rawUnit.type,
          strategy: rawUnit.strategy,
          triggers,
          qualifications: rawUnit.qualifications,
          operateOnTriggered: rawUnit.operate_on_triggered,
          operateOnReferenced: rawUnit.operate_on_referenced,
          reply: rawUnit.reply,
          guildsWhitelist: rawUnit.guilds_whitelist,
        });
      }
    }

    return units;
  }

  private reactionUnitConditionsFulfilled(
    unit: ReactionUnit,
    message: Message
  ): boolean {
    if (!isAnyOf(message.guildId, ...unit.guildsWhitelist)) {
      return false;
    }

    if (
      isAnyOf('IsReply', ...unit.qualifications) &&
      message.reference === null
    ) {
      return false;
    }

    return true;
  }

  private reactionUnitTriggerMatched(unit: ReactionUnit, message: Message) {
    const content = message.content.toLowerCase();
    if (
      unit.strategy === ReactionUnitStrategy.IncludesAll &&
      includesAll(content, ...(unit.triggers as string[]))
    ) {
      return true;
    }

    if (
      unit.strategy === ReactionUnitStrategy.IncludesAny &&
      includesAny(content, ...(unit.triggers as string[]))
    ) {
      return true;
    }

    if (
      unit.strategy === ReactionUnitStrategy.IsEntireMessage &&
      isAnyOf(content, ...(unit.triggers as string[]))
    ) {
      return true;
    }

    if (
      unit.strategy === ReactionUnitStrategy.IsAtStart &&
      (unit.triggers as string[]).some((t) => content.startsWith(t))
    ) {
      return true;
    }

    if (
      unit.strategy === ReactionUnitStrategy.IsAtEnd &&
      (unit.triggers as string[]).some((t) => content.endsWith(t))
    ) {
      return true;
    }

    if (
      unit.strategy === ReactionUnitStrategy.RegexTest &&
      (unit.triggers as RegExp[]).some((t) => t.test(content))
    ) {
      return true;
    }

    return false;
  }

  private async handleEmojiUnit(
    unit: EmojiReactionUnit,
    manager: MessageManager,
    message: Message
  ) {
    if (unit.operateOnReferenced) {
      // eslint-disable-next-line no-restricted-syntax
      for (const emoji of unit.emojiResolvables) {
        // eslint-disable-next-line no-await-in-loop
        await manager.react(message.reference.messageId, emoji);
      }
    }

    if (unit.operateOnTriggered) {
      // eslint-disable-next-line no-restricted-syntax
      for (const emoji of unit.emojiResolvables) {
        // eslint-disable-next-line no-await-in-loop
        await manager.react(message.id, emoji);
      }
    }
  }

  private async handleSendUnit(
    unit: SendReactionUnit,
    channel: TextBasedChannel
  ) {
    channel.send({ content: unit.message, allowedMentions: { parse: [] } });
  }

  private async handleReplyUnit(unit: ReplyReactionUnit, message: Message) {
    if (unit.operateOnReferenced) {
      (await getRepliedMessage(message)).reply({
        content: unit.reply,
        allowedMentions: { parse: [] },
      });
    }

    if (unit.operateOnTriggered) {
      await message.reply({
        content: unit.reply,
        allowedMentions: { parse: [] },
      });
    }
  }

  public async run(message: Message) {
    if (!this.triggered()) {
      return;
    }

    const { channel } = message;
    const { reactionUnits } = this.container.config.general;

    const logErr = (error: unknown) => this.container.logger.error(error);

    reactionUnits.forEach((unit) => {
      if (
        this.reactionUnitConditionsFulfilled(unit, message) &&
        this.reactionUnitTriggerMatched(unit, message)
      ) {
        if (unit.type === ReactionUnitType.Emoji) {
          this.handleEmojiUnit(unit, channel.messages, message).catch(logErr);
        } else if (unit.type === ReactionUnitType.Send) {
          this.handleSendUnit(unit, channel).catch(logErr);
        } else {
          this.handleReplyUnit(unit, message).catch(logErr);
        }
      }
    });
  }
}
