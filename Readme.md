
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

## FAQ

### How does this all work?

The [weplay-emulator](https://github.com/guille/weplay-emulator) service
runs a JavaScript [gameboy color emulator](http://github.com/guille/gameboy)
that gets painted to an instance of
[node-canvas](http://github.com/learnboost/node-canvas).

Upon each draw an event is emitted and the PNG buffer is piped through
Redis to all the IO instances of weplay (this project).

With Socket.IO 1.0 binary support, we can seamlessly transfer the image
data contained in the `Buffer` to all the connected clients, in addition
to all the JSON datastructures to make chat and commands work.

This makes weplay a 100% JavaScript project!

## Support

If you have ideas or contributions, join `#weplay` on Freenode.

## License

MIT
