# Emperor

Emperor is a Discord bot. It's for personal use.

## Running

Create `.emperor.dev.json` in the root directory, with at least these fields:

```json
{
    "name": "Emperor",
    "version": "0.1.0",
    "owner_ids": ["123456789012345678"],
    "default_color": "#ffffff"
}
```

The rest of the possible configuration options are, for now, undocumented. Sorry.

Create `.env` similarly:

```
BOT_TOKEN_DEV=YOUR_TOKEN
```

If the environment variable `NODE_ENV` is set to `production`, Emperor will use `.emperor.prod.json` and `BOT_TOKEN_PROD` instead.

Finally:

```
npm i
npm start
```

## License

[MIT](https://spdx.org/licenses/MIT.html).
