Package.describe({
  name: 'frpz:ping',
  version: '1.1.0',
  // Brief, one-line summary of the package.
  summary: 'Meteor package to perform an ICMP ping to a host using ping binaries on system (linux, mac, windows)',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/frpz/ping.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles(['ping.js'], 'server');
  api.export('Ping');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('frpz:ping');
  api.addFiles('ping-tests.js');
});
