
# weplay

## How to install

Install with

```bash
$ npm install
```

Then run it with the following ENV vars:

- `WEPLAY_PORT` - pointing to the port you want to listen on (`3001`)
- `WEPLAY_REDIS` - redis uri (`localhost:6379`)

```
$ node index
```

This will set up the IO server for weplay. It's necessary that you also
launch the [weplay-web](https://github.com/guille/weplay-web)
and [weplay-emulator](https://github.com/guille/weplay-emulator) services.

## Support

If you have ideas or contributions, join `#weplay` on Freenode.

## License

MIT
