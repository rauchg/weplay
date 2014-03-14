# weplay

[![](https://i.cloudup.com/H13p4ll2gu.png)](https://weplay.io)

## How to install

Install with

```bash
$ npm install
```

Then run it with the following ENV vars:

- `WEPLAY_PORT` - pointing to the port you want to listen on (`3001`)
- `WEPLAY_REDIS` - redis uri (`localhost:6379`)
- `WEPLAY_SERVER_UID` - unique persistent identifier for this server's
  instance. Used for keeping track of # of clients in redis
  (defaults to `WEPLAY_PORT`)
- `WEPLAY_IP_THROTTLE` - the least amount of time in ms that need to
  pass between moves from the same IP address (`100`)

```bash
$ node index
```

This will set up the IO server for weplay. It's necessary that you also
launch the other services:

- [weplay-web](https://github.com/guille/weplay-web) serves the HTML
  pages and static assets to run the game. It also serves initial state
  from Redis with the page for optimal performance.
- [weplay-emulator](https://github.com/guille/weplay-emulator) runs an
  emulator and broadcasts the image data from it with
  [socket.io-emitter](https://github.com/learnboost/socket.io-emitter) to
  the IO instance(s) that users are connected to.
- [weplay-presence](https://github.com/guille/weplay-presence) notifies
  all the IO instance(s) of the aggregate number of online users.

## FAQ

### How does this all work?

The [weplay-emulator](https://github.com/guille/weplay-emulator) service
runs a JavaScript-based
[gameboy color emulator](http://github.com/guille/gameboy)
that gets painted to an instance of
[node-canvas](http://github.com/learnboost/node-canvas).

Upon each draw an event is emitted and the PNG buffer is piped through
Redis to all the IO instances of weplay (this project).

With Socket.IO 1.0 binary support, we can seamlessly transfer the image
data contained in the `Buffer` to all the connected clients, in addition
to all the JSON datastructures to make chat and commands work.

This makes weplay a 100% JavaScript project!

### What are the error handling scenarios?

- In the event of a crash of a `weplay` IO node, clients can be rerouted
  to another instance and reconnect automatically thanks to 
  [socket.io-client](https://github.com/learnboost/socket.io-client).
  - Events that are broadcasted to other users (such as chat messages and
  "x moved y" events) get persisted  upon broadcast
  into a Redis capped list, which means that upon reconnection users will
  get the latest events despite having been routed to a new server.
  - The connection count will be eventually consistent and correct thanks
  to the work of the `weplay-presence` service that aggregates the
  connection counts of all servers.
- In the event of a crash of `weplay-emulator`, the next time it boots up
  it restores the virtual machine state that gets persisted by default
  every 60 seconds (for performance reasons).

## Support

If you have ideas or contributions, join `#weplay` on Freenode.

## License

MIT
