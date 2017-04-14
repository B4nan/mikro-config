# mikro-config

Tiny config helper built on top of `lodash`. It can merge multiple configuration files, 
by recursively merging their properties (not replacing entire objects, but merging them). 

[![](https://img.shields.io/npm/v/mikro-config.svg)](https://www.npmjs.com/package/mikro-config)
[![](https://img.shields.io/npm/dm/mikro-config.svg)](https://www.npmjs.com/package/mikro-config)
[![Dependency Status](https://david-dm.org/B4nan/mikro-config.svg)](https://david-dm.org/B4nan/mikro-config)
[![Build Status](https://travis-ci.org/B4nan/mikro-config.svg?branch=master)](https://travis-ci.org/mikro-config/B4nan)
[![Coverage Status](https://img.shields.io/coveralls/B4nan/mikro-config.svg)](https://coveralls.io/r/B4nan/mikro-config?branch=master)


## File order

Mikro-config loads configuration in this order:

 - `/config/default.js`
 - `/config/*.js` (all files in config folder excluding local configs)
 - `/config/env/$NODE_ENV.js`
 - `/config/env/$NODE_ENV.local.js`
 - `/config/local.js`

You can also use `JSON` format instead of plain JS objects.

When there is no `NODE_ENV` set, it defaults to `development`. 

You can adjust configuration directory with `NODE_CONFIG_DIR` environment variable.  

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

## Usage

First you need to require the module, then you can use two ways to get properties. First 
way is to directly access property on config object, the other is to use `get`/`has` methods.  

```javascript
const config = require('mikro-config');
console.log(config.cache.expiration);
```

Mikro-config API has 3 public methods: 

### `config.get(key: string, defaultValue: any): any`

```javascript
const config = require('mikro-config');
console.log(config.get('cache.expiration')); // prints 300
console.log(config.get('cache.another')); // prints undefined
console.log(config.get('cache.another', 123)); // prints 123
```

### `config.has(key: string): bool`

```javascript
const config = require('mikro-config');
console.log(config.has('cache.expiration')); // prints true
```

### `config.addOptions(options: object|string, optional: bool)`

This method is used for adding configuration on the fly. You can pass an object with additional 
configuration, or a string path to JS/JSON file, that exports the configuration. 

```javascript
const config = require('mikro-config');
console.log(config.newKey); // prints undefined
config.addOptions({newKey: 123});
console.log(config.newKey); // prints 123 
```

```javascript
const config = require('mikro-config');
config.addOptions(__dirname + '/routes'); // load routes.js file exporting routes object
console.log(config.routes); // prints routes object 
```

## Merging configuration

When multiple configuration files has same keys, their values are merged instead of replacement. 

```javascript
const config = require('mikro-config');
config.addOptions({
  log: {level: 'error', path: 'error.log'}
});
config.addOptions({
  log: {level: 'trace'}
});
console.log(config.log.level); // prints 'trace' 
console.log(config.log.path); // prints 'error.log' 
```
