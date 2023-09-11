# Changelog

> **Note**: This changelog documents only the changes made from version 5.13.0 to 5.20.2. During this period, I wasn't using version control, so the code is lost to time. However, I did write down what I modified from version to version, so I'm providing those notes. The last version available on GitHub prior to this was 5.12.1.

## Version 5.20.2 - 2023-09-11

- The `about` command now displays the actual URL to Emperor's GitHub repository instead of a placeholder string 

## Version 5.20.1 - 2023-09-04

- Fixed `nowplaying`. Now it accurately displays the current track position instead of hanging at 0:00 forever

## Version 5.20.0 - 2023-08-26

- Rewritten command: `image convert gif`. (message alias: `gif`. You can also shorten `image` to `i` in a message)
- New command: `video convert mp4`. (message alias: `mp4`. You can also shorten `video` to `v` in a message)

## Version 5.19.2 - 2023-08-18

- Fixed the emoji replacer not working

## Version 5.19.1 - 2023-08-16

- `skip` now checks that you didn't pass a value lower than 1

## Version 5.19.0 - 2023-08-16

- The `nightcore` command finally has a slash command form
- Improved the correctness of `skip`, especially when you specify the amount of tracks to skip or the queue is set to repeat
- Made `queue remove` work (it didn't work at all, previously)
- Errors when you're not in a voice channel or the server doesn't have a listening session are now less melodramatic
- Fixed a bug where the validity of the input to the slash command form of `seek` was only checked *after* the request to seek was sent out
- A lot of internal housekeeping: I estimate I was able to remove as much as ~500 thousand lines of code

## Version 5.18.2 - 2023-08-10

- Emoji replacement now works in threads

## Version 5.18.1 - 2023-08-09

- Emperor can now play tracks from more sources

## Version 5.18.0 - 2023-08-07

- New command: `replay`

## Version 5.17.3 - 2023-08-07

- The slash command form of `queue remove` now works

## Version 5.17.2 - 2023-08-05

- Fixed a crash when `seek`, `rewind`, or `fast-forward` received an invalid timestamp

## Version 5.17.1 - 2023-08-03

- Music playback now stops and the queue is deleted when the bot is disconnected from the voice channel. This fixes an issue where it could get softlocked after being "improperly" disconnected (say, by right clicking it and pressing "Disconnect")

## Version 5.17.0 - 2023-08-03

- Fixed the issue with YouTube tracks failing after a while
- Added a new subcommand for `queue`: `shuffle`
- Fixed a minor wording issue in `seek` (it said "rewinded" rather than "seeked")

## Version 5.16.3 - 2023-08-03

- Fixed the Tiktok replacer not working

## Version 5.16.2 - 2023-07-31

- Added a nightcore effect command (message-only)
- Fixed a typo in the slash form of `nowplaying`

## Version 5.16.1 - 2023-07-22

- Expired `vm.tiktok.com` URLs are now left alone

## Version 5.16.0 - 2023-07-22

- TikTok links are now replaced by `vxtiktok` links on select guilds
- New music command: `fastforward`
- New music command: `rewind`
- The `seek` command now tells you what timestamp it seeked to

## Version 5.15.1 - 2023-07-19

- Fixed `skip` potentially showing an incorrect requester for the song

## Version 5.15.0 - 2023-07-19

- Implemented song and queue looping via `/queue loop`
- The slash command form of `nowplaying` now shows the current position and duration
- You can now play from a file when using the `forceplay` message alias
- Made it so that you can actually see what you added to the queue when you use `play` and a song is already playing, instead of the dry "Added to queue." message
- Made it so that you are notified of how many tracks were added to the queue when you load a playlist
- Made it so that Emperor can send a truncated version of the queue when it's too long, rather than failing completely

## Version 5.14.0 - 2023-07-15

- New command: `playfile` (for this functionality in message form, you can now pass an attachment to `play`)
- New command: `volume`
- New message-exclusive command: `forceplay` (alias for `play` with the `force` option)
- New message-exclusive command: `forceskip` (alias for `skip` with the `force` option)

## Version 5.13.1 - 2023-07-14

- Fixed a bug that made it so that when a track played to completion and you tried to play another, it was added to the queue instead of immediately playing

## Version 5.13.0 - 2023-07-14

- Music module implemented
