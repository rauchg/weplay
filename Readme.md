
# weplay

## How to install

Make sure `cairo` is installed, then run:

```bash
$ npm install
```

Then run it with the following ENV vars:

- `WEPLAY_ROM` - pointing to the rom you want to emulate
- `WEPLAY_PORT` - pointing to the port you want to listen on (`3001`)
- `WEPLAY_REDIS` - redis uri (`localhost:6379`)

```
$ node index
```

## License

MIT
