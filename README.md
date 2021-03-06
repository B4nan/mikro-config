# mikro-config

Tiny config helper built on top of `lodash`. It can merge multiple configuration files, 
by recursively merging their properties (not replacing entire objects, but merging them). 

It also allows you to use referenced values from your config.

[![](https://img.shields.io/npm/v/mikro-config.svg)](https://www.npmjs.com/package/mikro-config)
[![](https://img.shields.io/npm/dm/mikro-config.svg)](https://www.npmjs.com/package/mikro-config)
[![Dependency Status](https://david-dm.org/B4nan/mikro-config.svg)](https://david-dm.org/B4nan/mikro-config)
[![Build Status](https://travis-ci.org/B4nan/mikro-config.svg?branch=master)](https://travis-ci.org/B4nan/mikro-config)
[![Coverage Status](https://img.shields.io/coveralls/B4nan/mikro-config.svg)](https://coveralls.io/r/B4nan/mikro-config?branch=master)


## File order

Mikro-config loads configuration in this order:

 - `/config/default.js`
 - `/config/*.js` (all files in config folder excluding local configs)
 - `/config/env/$NODE_ENV.js`
 - `/config/env/$NODE_ENV.local.js`
 - `/config/local.js`

You can also use `JSON` format instead of plain JS objects.

For typescript applications, that runs via `ts-node` there is also possibility to use TS files. Keep in mind that TS file
will be ignored in case there is JS file with same name (JS files will be preferred). 

When there is no `NODE_ENV` set, it defaults to `development`. 

You can adjust configuration directory with `NODE_CONFIG_DIR` environment variable.  

## Environment specific variables

It is also possible to override configuration with environment variables. 

First you need to set `MIKRO_CONFIG_PREFIX` variable, then use this prefix 
for other variables:

```bash
MIKRO_CONFIG_PREFIX = 'MY_TEST_APP_'
MY_TEST_APP_KEY1 = 'value2'
MY_TEST_APP_KEY5___SUB_KEY3 = 'test'
```

This will override `appKey1` with `'value2'` and `appKey5.subKey3` with value `test`.

## Installation

`$ yarn add mikro-config`
 
or 

`$ npm install mikro-config`

## Sample configuration file

Mikro-config uses plain JS objects as configuration. 

`/config/default.js`

```javascript
module.exports = {
 
  objectProperty: {
    // Sample comment
    path: __dirname + '/files',
    anotherProperty: {
      size: 10, // MB
    },
  },
 
  cache: {
    expiration: 300, // 5 min
  },
 
  server: {
    port: 12345,
    host: 'localhost',
    version: '1.2.3',
  },
 
  boolProperty: true,
  stringProperty: 'lol',
  
  serverPort: '$[server.port]', // this will inline to number `12345`
  serverHost: '$[server.host]', // this will inline to string `localhost`
 
  // this will inline the host and port, resulting in `ServiceName('localhost', 12345)`
  serviceDefinition: 'ServiceName($[server.host], $[server.port])',
 
};
```

Configuration files are loaded simply with `require()`, so you can also use `JSON` format.

`/config/default.json`

```json
{
  "objectProperty": {
    "path": "/etc/files",
    "anotherProperty": {
      "size": 10
    }
  },
 
  "cache": {
    "expiration": 300
  },
 
  "server": {
    "port": 12345,
    "host": "localhost",
    "version": "1.2.3"
  },
 
  "boolProperty": true,
  "stringProperty": "lol"
 
}
```

You can also use typescript file (but keep in mind that when there is also JS file with same, TS one will be ignored):

`/config/default.ts`

```typescript
export const objectProperty {
  // Sample comment
  path: __dirname + '/files',
  anotherProperty: {
    size: 10, // MB
  },
};
 
export const cache = {
  expiration: 300, // 5 min
};
 
export const server = {
  port: 12345,
  host: 'localhost',
  version: '1.2.3',
};

export const boolProperty = true;
export const stringProperty = 'lol';

export const serverPort = '$[server.port]'; // this will inline to number `12345`
export const serverHost = '$[server.host]'; // this will inline to string `localhost`
 
// this will inline the host and port, resulting in `ServiceName('localhost', 12345)`
export const serviceDefinition = 'ServiceName($[server.host], $[server.port])';
```

Or you can use JS like syntax:

```typescript
export = {
 
  objectProperty: {
    // Sample comment
    path: __dirname + '/files',
    anotherProperty: {
      size: 10, // MB
    },
  },
 
  cache: {
    expiration: 300, // 5 min
  },
 
  server: {
    port: 12345,
    host: 'localhost',
    version: '1.2.3',
  },
 
  boolProperty: true,
  stringProperty: 'lol',
  
  serverPort: '$[server.port]', // this will inline to number `12345`
  serverHost: '$[server.host]', // this will inline to string `localhost`
 
  // this will inline the host and port, resulting in `ServiceName('localhost', 12345)`
  serviceDefinition: 'ServiceName($[server.host], $[server.port])',
 
};
```

## Usage

First you need to require the module, then you can use two ways to get properties. First 
way is to directly access property on config object, the other is to use `get`/`has` methods.  

```javascript
// in javascript use default property
const config = require('mikro-config').default;
console.log(config.cache.expiration);

// in typescript use default import
import config from 'mikro-config';
console.log(config.cache.expiration);
```

Mikro-config API has 3 public methods: 

### `config.get(key: string, defaultValue: any): any`

```javascript
import config from 'mikro-config';

console.log(config.get('cache.expiration')); // prints 300
console.log(config.get('cache.another')); // prints undefined
console.log(config.get('cache.another', 123)); // prints 123
```

### `config.has(key: string): bool`

```javascript
import config from 'mikro-config';

console.log(config.has('cache.expiration')); // prints true
```

### `config.addOptions(options: object|string, optional: bool)`

This method is used for adding configuration on the fly. You can pass an object with additional 
configuration, or a string path to JS/JSON file, that exports the configuration. 

```javascript
import config from 'mikro-config';

console.log(config.newKey); // prints undefined
config.addOptions({newKey: 123});
console.log(config.newKey); // prints 123 
```

```javascript
import config from 'mikro-config';

config.addOptions(__dirname + '/routes'); // load routes.ts file exporting routes object
console.log(config.routes); // prints routes object 
```

## Merging configuration

When multiple configuration files has same keys, their values are merged instead of replacement. 

```javascript
import config from 'mikro-config';

config.addOptions({
  log: {level: 'error', path: 'error.log'}
});
config.addOptions({
  log: {level: 'trace'}
});
console.log(config.log.level); // prints 'trace' 
console.log(config.log.path); // prints 'error.log' 
```
