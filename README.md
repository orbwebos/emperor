# Emperor

Emperor is a Discord bot. It's an amateurish exercise in programming, and any
further features aren't guaranteed.

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

## License

[MIT](https://spdx.org/licenses/MIT.html).
