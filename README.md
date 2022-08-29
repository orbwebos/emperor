# Emperor

Emperor is a Discord bot. It's an amateurish exercise in programming, and any
further features aren't guaranteed.

## Running

Create `.imperialrc` in the root directory, with at least these fields:

```json
{
    "name": "Emperor",
    "name_possessive": "Emperor's",
    "version": "0.1.0",
    "owner_ids": ["123456789012345678"],
    "logging": {
        "guild": "123456789012345678",
        "channel": "123456789012345678"
    }
}
```

Create `.env` similarly:

```
BOT_TOKEN=YOUR_TOKEN
```

Finally:

```
npm i
npm start
```

## License

[MIT](https://spdx.org/licenses/MIT.html).
