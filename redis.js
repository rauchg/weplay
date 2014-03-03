
var redis = require('redis');
var uri = process.env.WEPLAY_REDIS_URI || 'localhost:6379';
var pieces = uri.split(':');

module.exports = redis.createClient(pieces[1], pieces[0]);
