Ping = {};


var sys = Npm.require('util');
var cp  = Npm.require('child_process');
var os  = Npm.require('os');

/**
 * ping: ping the address, then format the result into an object
 *
 * @param address: ip or host to ping
 * @param nb: number of pings
 * @param log: whether or not to log in the console
 * @param callback: callback function
 * @return : Object{latency, lost, status, res}
 */
ping = function(address, nb, log, callback) {
	var platform = os.platform();
	var cmd = "";

	if(log) console.log("start pinging "+nb+" times...");
	if (platform == 'linux') { // Linux.
		cmd = '/bin/ping -n -w '+(nb + 3)+' -c '+nb+" "+ address;
	}
	else if (platform == 'darwin') { // Mac OS X.
		cmd = '/sbin/ping -n -t '+(nb + 3)+' -c '+nb+" "+ address;
	}
	else if (platform.match(/^win/)) { // Windows.
		cmd = 'C:/windows/system32/ping.exe -n '+ nb+ ' -w 5000 '+ address;
		platform = 'windows'; // Set explicitly to prevent further regex.
	}
	else { // Platform not recognized.
		throw new Meteor.Error('ping.ping: Operating system could not be identified.');
	}

	cp.exec(cmd, function (err, stdout, stderr) {
		var body = stdout;
		var latency = 0, status = false, lost=100;
		try{
			if(platform == "windows")
				latency = parseInt(body.match(/\d+ms/g).pop());
			else
				latency = Math.round(parseFloat(body.match(/(rtt|round-trip).*/g).pop().match(/[^\/=]+/g)[5]));
			lost       = parseInt(/(\d+)%/.exec(body).pop());
			status     = ! lost > 0;
		}catch(e){ } //no need to do anything because of default values
		if(log) console.log("==== ping result: \n", body);
		callback && callback(latency, lost, status, body);
	});
}

/**
 * Determine online status of a host.
 * @param {string} host - hostname or IP.
 * @param {number} nb - number of pings (Default: 1)
 * @param log: whether or not to log in the console
 * @returns {object} status as offline or online
 */
Ping.host = function (host, nb, log) {
	if(nb  == undefined) nb = 1;
	if(log == undefined) log = false;
	return Ping.range([host], nb, log).pop();
};

/**
 * Ping a range of IPs.
 * @param {array} IP list - array of IP addresses
 * @param {number} nb - number of pings (Default: 1)
 * @param log: whether or not to log in the console
 * @returns {undefined}
 */
Ping.range = function (range, nb, log){
	var hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
	var ipv4Regex     = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	if(nb  == undefined) nb = 1;
	if(log == undefined) log = false;
	var Future = Npm.require('fibers/future');
	var futures = _.map(range, function(ip,k) {
		// Set up a future for the current job
		var future = new Future();
		// A callback so the job can signal completion
		var onComplete = future.resolver();

		if (hostnameRegex.test(ip) || ipv4Regex.test(ip)){
			/// Make async call
			ping(ip, nb, log, function (latency, lost, status, res) {
				// Do whatever you need with the results here!
				// Inform the future that we're done with it
				onComplete(null, {
					ip      : ip,
					latency : latency,
					lost    : lost,
					online  : status,
					res     : res,
					status  : status ? 'online' : 'offline'
				});
			});
		}else{
			onComplete(null, {
				ip      : ip,
				latency : 0,
				lost    : 100,
				online  : false,
				status  : "Error: invalid format"
			});
		}
		// Return the future
		return future;
	});

	Future.wait(futures);
	// and grab the results out.
	return _.invoke(futures, 'get');
};

