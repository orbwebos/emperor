# Emperor

Emperor is a Discord bot. It's an amateurish exercise in programming. I consider
it to be complete, and will not add any further features. 

## Running

```
cp -r examples/config config
```

Modify the `.env` file in the configuration folder so that it contains your
actual bot's token. Then, fill the relevant fields in the `config/bot.json`
file. I suggest you also look into the other files in the folder. Finally:

```
npm i
npm start
```

## Slash commands

To use Emperor, you'll need to register its slash commands.
`examples/slash_update.ts` is an example script that registers the commands on a
single guild. Registering them globally is probably preferable.

## About Tasks

The bot's Tasks module works by manipulating JSON files in the filesystem.
Considering its properties, it would have been better suited to a relational
database. It's important that all JSON files are valid Emperor Tasks or the
system will get "clogged". This is likely trivial to fix, but I didn't do it.

## License

[MIT](https://spdx.org/licenses/MIT.html).
