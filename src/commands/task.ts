import { SlashCommandBuilder } from '@discordjs/builders';
import { EmperorCommand } from '../util/emperor_command';
import { Replier } from '../util/sender_replier';
import { plural } from '../util/plural';
import { createTaskDiscordContext } from '../tasks/task_discord_context';
import { expandStatusCode, TaskStatus } from '../tasks/statuses';
import { TaskPriority } from '../tasks/misc';
import { TaskContext } from '../tasks/contexts';
import * as log from '../util/logging';
import { ConfigManager } from '../util/config_manager';

const cmdData = new SlashCommandBuilder()
  .setName('task')
  .setDescription('Manage your tasks.')
  .addSubcommand(subcommand =>
    subcommand
      .setName('add')
      .setDescription('Add a task.')
      .addStringOption(option =>
        option.setName('context')
          .setDescription('The task\'s context.')
          .addChoice('Personal', TaskContext.Personal)
          .addChoice('Social', TaskContext.Social)
          .addChoice('Work', TaskContext.Work)
          .addChoice('Hobbies', TaskContext.Hobbies)
          .addChoice('Other', TaskContext.Other)
          .setRequired(true))
      .addStringOption(option =>
        option.setName('title')
          .setDescription('The task\'s title.')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('description')
          .setDescription('Description.'))
      .addIntegerOption(option =>
        option.setName('priority')
          .setDescription('Priority.')
          .addChoice('Normal', TaskPriority.Normal)
          .addChoice('Medium', TaskPriority.Medium)
          .addChoice('Urgent', TaskPriority.Urgent))
      .addStringOption(option =>
        option.setName('custom-id')
          .setDescription('Custom ID.'))
      .addStringOption(option =>
        option.setName('date')
          .setDescription('Planned date.'))
      .addStringOption(option =>
        option.setName('deadline')
          .setDescription('Deadline.'))
      .addBooleanOption(option =>
        option.setName('deadline-reminder')
          .setDescription('Establish reminder.'))
      .addIntegerOption(option =>
        option.setName('deadline-reminder-days-before')
          .setDescription('Default: 1 day.'))
      .addIntegerOption(option =>
        option.setName('deadline-reminder-interval')
          .setDescription('Default: 15 hours.'))
      .addIntegerOption(option =>
        option.setName('deadline-reminder-offset')
          .setDescription('Default: 3 hours.'))
      .addIntegerOption(option =>
        option.setName('keep-reminding-for')
          .setDescription('Default: 3 days.'))
      .addStringOption(option =>
        option.setName('wake-in')
          .setDescription('Sleeps and wakes at date.')))
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('Lists your active tasks.'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('search')
      .setDescription('Search your tasks.')
      .addStringOption(option =>
        option.setName('filter-id')
          .setDescription('ID.'))
      .addStringOption(option =>
        option.setName('filter-titles')
           .setDescription('Titles.'))
      .addStringOption(option =>
        option.setName('filter-descriptions')
          .setDescription('Descriptions.'))
      .addStringOption(option =>
        option.setName('filter-state')
          .setDescription('State.')
          .addChoice('To do', TaskStatus.TODO)
          .addChoice('Done', TaskStatus.DONE)
          .addChoice('Delegated', TaskStatus.DELEGATED)
          .addChoice('Looking for feedback', TaskStatus.FEEDBACK))
      .addStringOption(option =>
        option.setName('filter-context')
          .setDescription('Returns task in the selected context.')
          .addChoice('Personal', TaskContext.Personal)
          .addChoice('Social', TaskContext.Social)
          .addChoice('Work', TaskContext.Work)
          .addChoice('Hobbies', TaskContext.Hobbies)
          .addChoice('Other', TaskContext.Other))
      .addStringOption(option =>
        option.setName('filter-date')
          .setDescription('Planned date.'))
      .addStringOption(option =>
        option.setName('filter-deadline')
          .setDescription('Deadline.'))
      .addBooleanOption(option =>
        option.setName('filter-asleep')
          .setDescription('True: asleep.'))
      .addStringOption(option =>
        option.setName('filter-wake-date')
          .setDescription('Wake date.'))
      .addBooleanOption(option =>
        option.setName('filter-late')
          .setDescription('Late tasks.'))
      .addBooleanOption(option =>
        option.setName('filter-trashed')
          .setDescription('Trashed.')))
  .addSubcommand(subcommand =>
    subcommand
      .setName('edit')
      .setDescription('Modifies the properties of the selected task.')
      .addStringOption(option =>
        option.setName('id')
          .setDescription('The task\'s ID.')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('title')
          .setDescription('New title.'))
      .addStringOption(option =>
        option.setName('description')
          .setDescription('New description.'))
      .addStringOption(option =>
        option.setName('state')
          .setDescription('Change the state.')
          .addChoice('To do', TaskStatus.TODO)
          .addChoice('Done', TaskStatus.DONE)
          .addChoice('Delegated', TaskStatus.DELEGATED)
          .addChoice('Looking for feedback', TaskStatus.FEEDBACK))
      .addStringOption(option =>
        option.setName('context')
          .setDescription('The target context.')
          .addChoice('Personal', TaskContext.Personal)
          .addChoice('Social', TaskContext.Social)
          .addChoice('Work', TaskContext.Work)
          .addChoice('Hobbies', TaskContext.Hobbies)
          .addChoice('Other', TaskContext.Other))
      .addIntegerOption(option =>
        option.setName('priority')
          .setDescription('Priority.')
          .addChoice('Normal', TaskPriority.Normal)
          .addChoice('Medium', TaskPriority.Medium)
          .addChoice('Urgent', TaskPriority.Urgent))
      .addStringOption(option =>
        option.setName('custom-id')
          .setDescription('Custom ID.'))
      .addStringOption(option =>
        option.setName('date')
          .setDescription('Planned date.'))
      .addStringOption(option =>
        option.setName('deadline')
          .setDescription('Deadline.'))
      .addBooleanOption(option =>
        option.setName('deadline-reminder')
          .setDescription('With reminder.'))
      .addIntegerOption(option =>
        option.setName('deadline-reminder-days-before')
          .setDescription('Days before to remind.'))
      .addIntegerOption(option =>
        option.setName('deadline-reminder-interval')
          .setDescription('The reminder\'s interaval.'))
      .addIntegerOption(option =>
        option.setName('deadline-reminder-offset')
          .setDescription('The reminder\'s offset.'))
      .addStringOption(option =>
        option.setName('keep-reminding-for')
          .setDescription('Days after the reminder.'))
      .addBooleanOption(option =>
        option.setName('asleep')
          .setDescription('True: asleep.'))
      .addStringOption(option =>
        option.setName('wake-in')
          .setDescription('Wake date.'))
      .addBooleanOption(option =>
        option.setName('trashed')
          .setDescription('Trashed.')))
  .addSubcommand(subcommand =>
    subcommand
      .setName('remove')
      .setDescription('Removes tasks.')
      .addStringOption(option =>
        option.setName('by-id')
          .setDescription('ID.'))
      .addStringOption(option =>
        option.setName('by-title')
          .setDescription('Title.'))
      .addStringOption(option =>
        option.setName('by-description')
          .setDescription('Description.'))
      .addStringOption(option =>
        option.setName('by-state')
          .setDescription('state.')
          .addChoice('To do', TaskStatus.TODO)
          .addChoice('Done', TaskStatus.DONE)
          .addChoice('Delegated', TaskStatus.DELEGATED)
          .addChoice('Looking for feedback', TaskStatus.FEEDBACK))
      .addStringOption(option =>
        option.setName('by-context')
          .setDescription('Context.')
          .addChoice('Personal', TaskContext.Personal)
          .addChoice('Social', TaskContext.Social)
          .addChoice('Work', TaskContext.Work)
          .addChoice('Hobbies', TaskContext.Hobbies)
          .addChoice('Other', TaskContext.Other))
      .addStringOption(option =>
        option.setName('by-date')
          .setDescription('Planned date.'))
      .addStringOption(option =>
        option.setName('by-deadline')
          .setDescription('Deadline.'))
      .addBooleanOption(option =>
        option.setName('by-asleep')
          .setDescription('Asleep tasks.'))
      .addBooleanOption(option =>
        option.setName('by-wake-date')
          .setDescription('Wake date.'))
      .addBooleanOption(option =>
        option.setName('late')
          .setDescription('Removes late tasks.'))
      .addBooleanOption(option =>
        option.setName('trashed')
          .setDescription('Permanently removes trashed tasks.'))
      .addBooleanOption(option =>
        option.setName('force')
          .setDescription('True: directly removes, without trashing.')))
  .addSubcommand(subcommand =>
    subcommand
      .setName('change-state')
      .setDescription('Changes the state of the selected tasks.')
      .addStringOption(option =>
        option.setName('state')
          .setDescription('The state.')
          .addChoice('To do', TaskStatus.TODO)
          .addChoice('Done', TaskStatus.DONE)
          .addChoice('Delegated', TaskStatus.DELEGATED)
          .addChoice('Looking for feedback', TaskStatus.FEEDBACK)
          .setRequired(true))
      .addStringOption(option =>
        option.setName('filter-id')
          .setDescription('The ID.'))
      .addStringOption(option =>
        option.setName('filter-titles')
          .setDescription('The titles.'))
      .addStringOption(option =>
        option.setName('filter-descriptions')
          .setDescription('The descriptions.'))
      .addStringOption(option =>
        option.setName('filter-state')
          .setDescription('The state.')
          .addChoice('To do', TaskStatus.TODO)
          .addChoice('Done', TaskStatus.DONE)
          .addChoice('Delegated', TaskStatus.DELEGATED)
          .addChoice('Looking for feedback', TaskStatus.FEEDBACK))
      .addStringOption(option =>
        option.setName('filter-context')
          .setDescription('The selected context.')
          .addChoice('Personal', TaskContext.Personal)
          .addChoice('Social', TaskContext.Social)
          .addChoice('Work', TaskContext.Work)
          .addChoice('Hobbies', TaskContext.Hobbies)
          .addChoice('Other', TaskContext.Other))
      .addStringOption(option =>
        option.setName('filter-date')
          .setDescription('The planned date.'))
      .addStringOption(option =>
        option.setName('filter-deadline')
          .setDescription('Deadline.'))
      .addBooleanOption(option =>
        option.setName('filter-asleep')
          .setDescription('Asleep tasks.'))
      .addStringOption(option =>
        option.setName('filter-wake-date')
          .setDescription('Wake date.'))
      .addBooleanOption(option =>
        option.setName('filter-late')
          .setDescription('Late tasks.'))
      .addBooleanOption(option =>
        option.setName('filter-trashed')
          .setDescription('Trashed tasks.')))
  .addSubcommand(subcommand =>
    subcommand
      .setName('settings')
      .setDescription('Settings. If no option is passed, shows the current settings.')
      .addStringOption(option =>
        option.setName('time-zone')
          .setDescription('Change your time zone.'))
      .addBooleanOption(option =>
        option.setName('tasks-remind-by-default')
          .setDescription('Whether or not a task should establish reminders by default after creating it. Default: false.'))
      .addStringOption(option =>
        option.setName('group-tasks-by')
          .setDescription('How should tasks be grouped when listing them. Default: don\'t group.')
          .addChoice('By context', 'course')
          .addChoice('Don\'t group', 'none'))
      .addBooleanOption(option =>
        option.setName('removing-requires-options')
          .setDescription('Whether removing tasks requires options. Default: true.')));

const cmdExecuter = async i => {
  try {
    const taskDiscCtx = await createTaskDiscordContext(new Replier(i, '#ffa500'));

    try {
      switch (i.options.getSubcommand()) {
        case 'add': {
          const task = await taskDiscCtx.addTaskFromContext();
          return await taskDiscCtx.reply(taskDiscCtx.title.response, `The following task was successfully created:\n\n${taskDiscCtx.format([task], null, 'none')}`);
        }
        case 'list': {
          const todoTasks = await taskDiscCtx.searchFromOptions({
            statusCode: TaskStatus.TODO,
            asleep: false,
            trash: false
          });
          const feedbackTasks = await taskDiscCtx.searchFromOptions({
            statusCode: TaskStatus.FEEDBACK,
            asleep: false,
            trash: false
          });

          if (todoTasks.length || feedbackTasks.length) {
            const tasks = todoTasks.concat(feedbackTasks);
            const p = plural(tasks);
            return await taskDiscCtx.reply(taskDiscCtx.title.response,
              `Showing **${tasks.length.toString()} active task${p.s}**:\n\n` + 
              `${taskDiscCtx.format(tasks, true)}`
            );
          }
          else {
            return await taskDiscCtx.reply(taskDiscCtx.title.response, 'You have no active tasks.');
          }
        }
        case 'search': {
          const tasks = await taskDiscCtx.searchFromContext();
          if (tasks.length) {
            const p = plural(tasks);
            return await taskDiscCtx.reply(taskDiscCtx.title.response,
              `Found **${tasks.length.toString()} task${p.s}** matching your search:\n\n` +
              `${taskDiscCtx.format(tasks, false, 'course')}`
            );
          }
          else {
            return await taskDiscCtx.reply(taskDiscCtx.title.response, `No tasks matched your search.`);
          }
        }
        case 'edit': {
          const resp = await taskDiscCtx.editFromContext();
          return await taskDiscCtx.reply(taskDiscCtx.title.response, `The task\n\n${taskDiscCtx.format([resp.original], null, 'none')}\n\nhas been modified so:\n\n${taskDiscCtx.format([resp.modified], null, 'none')}`);
        }
        case 'remove': {
          const resp = await taskDiscCtx.removeFromContext();
          const p1 = plural(resp.trashed);
          const p2 = plural(resp.removed);
          let firstHalf = resp.trashed.length ? `The following **${resp.trashed.length.toString()} task${p1.s}** ${p1.hashave} been trashed:\n\n${taskDiscCtx.format(resp.trashed, true, 'course')}` : '';
          if (firstHalf !== '' && !firstHalf.endsWith('\n\n')) {
            firstHalf += '\n\n';
          }
          const secondHalf = resp.removed.length ? `The following **${resp.removed.length.toString()} task${p2.s}** ${p1.hashave} permanently removed:\n\n${taskDiscCtx.format(resp.removed, true, 'course')}` : '';
          if (firstHalf || secondHalf) {
            return await taskDiscCtx.reply(taskDiscCtx.title.response, `${firstHalf}${secondHalf}`);
          }
          else {
            return await taskDiscCtx.reply(taskDiscCtx.title.response, `No tasks matched your search. No task has been removed.`);
          }
        }
        case 'change-state': {
          const resp = await taskDiscCtx.changeStatusFromContext();
          if (resp.tasks.length) {
            const p = plural(resp.tasks);
            return await taskDiscCtx.reply(taskDiscCtx.title.response, `The state of the following ${resp.tasks.length.toString()} task${p.s} ${p.hashave} been changed to **${expandStatusCode(resp.status)}**:\n\n${taskDiscCtx.format(resp.tasks, true, 'course')}`);
          }
          else {
            return await taskDiscCtx.reply(taskDiscCtx.title.response, `No tasks matched your search.`);
          }
        }
        case 'settings': {
          const resp = await taskDiscCtx.editUserConfigFromContext();
          let toPost: string = '';
          let i: number = 0;
          if (resp.map.size) {
            const p = plural(resp.map);
            resp.map.forEach((value: {original: string, modified: string }, field: string) => {
              if (resp.optionsPassed === false) {
                if (i === 0) {
                  toPost += 'These are your current settings:\n\n';
                }
                toPost += `**${field}:** `;
                toPost += `${value.original}`;
  
                if (i !== resp.map.size - 1) {
                  toPost += '\n';
                }
  
                i++;
              }
              else {
                if (i === 0) {
                  toPost += `The following option${p.s} ${p.hashave} been modified:\n\n`;
                }
                toPost += `__**${field}**__\n`;
                toPost += `**Old value:** ${value.original}\n`;
                toPost += `**New value:** ${value.modified}`;
  
                if (i !== resp.map.size - 1) {
                  toPost += '\n\n';
                }
  
                i++;
              }
            });
            return await taskDiscCtx.reply(taskDiscCtx.title.response, toPost);
          }
          else {
            return await taskDiscCtx.reply(taskDiscCtx.title.response, 'No value has been modified.');
          }
        }
        default: {
          await taskDiscCtx.reply(taskDiscCtx.title.stateError, 'This incident will be reported.');
          log.notify(i.client, `State error in interaction with command ${i.commandName}: subcommand ${i.options.getSubcommand()}`);
        }
      }
    }
    catch (err) {
      if (err.toString().includes('REMOVE_REQUIRES_OPTIONS_AND_NONE_WAS_PASSED')) {
        return await taskDiscCtx.reply(taskDiscCtx.title.error, `You need to use at least one filter when deleting tasks. If not, ${new ConfigManager().bot.name} will delete or trash all your tasks. If this behavior is desired, use the settings command to disable this security measure.`);
      }

      return await taskDiscCtx.reply(taskDiscCtx.title.error, `**${err.toString()}**`);
    }
  }
  catch (e) {
    if (e.toString().includes('user isn\'t registered. halt everything')) {
      return;
    }
    if (i.deferred || i.replied) {
      await i.editReply({ content: `**${e.toString()}**` });
    }
    else {
      await i.reply({ content: `**${e.toString()}**`, ephemeral: true });
    }
    log.debug(e);
  }
};

export const cmd = new EmperorCommand(cmdData, cmdExecuter);
