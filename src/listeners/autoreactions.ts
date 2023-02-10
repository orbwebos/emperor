import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { EmojiResolvable, Message, MessageManager } from 'discord.js';
import { getRepliedMessage } from '../lib/content';
import { includesAll, includesAny, isAnyOf } from '../lib/util';

const { config } = container;

enum ReactionUnitType {
  Emoji = 'EmojiReaction',
  Reply = 'ReplyReaction',
}

enum ReactionUnitStrategy {
  IncludesAny = 'IncludesAny',
  IncludesAll = 'IncludesAll',
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

type ReactionUnit = EmojiReactionUnit | ReplyReactionUnit;

@ApplyOptions<Listener.Options>({
  event: 'messageCreate',
})
export class AutoreactionsAction extends Listener {
  private triggered() {
    return config.general.autoreactions === true;
  }

  // this should actually be done only once in the ConfigManager!
  private rawJsonToUnits(jsonArray: any): ReactionUnit[] {
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
    if (
      !this.reactionUnitConditionsFulfilled(unit, message) ||
      !this.reactionUnitTriggerMatched(unit, message)
    ) {
      return;
    }

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

  // remove this after implementing it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleReplyUnit(unit: ReplyReactionUnit, message: Message) {
    if (
      !this.reactionUnitConditionsFulfilled(unit, message) ||
      !this.reactionUnitTriggerMatched(unit, message)
    ) {
      return;
    }

    if (unit.operateOnReferenced) {
      (await getRepliedMessage(message)).reply(unit.reply);
    }

    if (unit.operateOnTriggered) {
      message.reply(unit.reply);
    }
  }

  public async run(message: Message) {
    if (!this.triggered()) {
      return;
    }

    const { channel } = message;

    const units = this.rawJsonToUnits(config.general.reactionUnits);

    // tomorrow: see what to do with the promises
    units.forEach((unit) => {
      if (unit.type === ReactionUnitType.Emoji) {
        this.handleEmojiUnit(unit, channel.messages, message);
      } else {
        this.handleReplyUnit(unit, message);
      }
    });
  }
}
