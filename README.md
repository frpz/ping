# frpz:ping
A simple package for sending ICMP pings to hosts.

No npm dependancy

## How it works

It uses the ping executables on windows, mac or linux.

## Usage
Server side only:

```javascript
var hostname = 'my.example.org';
var ip = '10.0.0.1';
Ping.host(hostname);
Ping.host(ip, 5);
```

To ping multiple IP:
```javascript
var iplist = ["10.0.0.2", "10.0.0.2", "10.0.0.3"];
Ping.range(iplist, 2);
```

## Credits

This package was inspired by 

[Leitwarte](https://github.com/leitwarte/ping.git)

and

[[jjg-ping]](https://github.com/geerlingguy/JJG-Node-Ping)
