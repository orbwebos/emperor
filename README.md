# Emperor

Emperor is a Discord bot. It's an amateurish exercise in programming. I consider
it to be complete, and will not add any further features. 

## Running

To run it, first create an `.env` file in the project's root containing a
key-value pair for your instance's bot token, like so:

```
BOT_TOKEN=YOUR_TOKEN
```

Then, fill the relevant fields in the `config/bot.json` file. Finally:

1. `npm i`
2. `npm start`

You *might* need to manually download the relevant TypeScript utilities. It's a
good idea to check out the other files in the `config` directory.

## Slash commands

To use Emperor, you'll need to register its slash commands. `slash_update.ts` is
an example script that registers the commands on a single guild. Registering
them globally is probably preferable.

## About Tasks

The bot's Tasks module works by manipulating JSON files in the filesystem.
Considering its properties, it would have been better suited to a relational
database. It's important that all JSON files are valid Emperor Tasks or the
system will get "clogged". This is likely trivial to fix, but I didn't do it.

## License

[MIT](https://spdx.org/licenses/MIT.html).
