module.exports = function(plumber, config) {
	return new RedisKeyStore(plumber, config);
};

var redis = require("redis");

function RedisKeyStore(plumber, config) {
	var self = this;

	if(typeof config.prefix != "string")
		self.prefix = "";
	else
		self.prefix = config.prefix;

	self.client = self._createClient(config.auth, function(error, response) {
		if(error)
			console.log("client create error");
		else {
			console.log("Redis client created");
		}
	});
}

RedisKeyStore.prototype.set = function(key, value, callback) {
	this.client.set(this.prefix + key, JSON.stringify({
		type: (typeof value),
		value: value
	}), function(error, response) {
		if(error)
			callback(error, null);
		else
			callback(null, true);
	});
};

RedisKeyStore.prototype.get = function(key, callback) {
	this.client.get(this.prefix + key, function(error, reply) {
		if(error)
			callback(error, null);
		else if(reply == null)
			callback("null_response", null);
		else {
			try {
				var storedValue = JSON.parse(reply);
				callback(null, storedValue.value);
			}
			catch(error) {
				callback("parse_error", null);
			}
		}
	});
};

RedisKeyStore.prototype._createClient = function(config, callback) {
	var client = redis.createClient(config.port, config.host, {});
	client.auth(config.password, function(error, response) {
		if (error)
			callback(error, null);
		else
			callback(null, true);
	});
	return client;
};
