# mikro-config

Tiny config helper, loads configuration in this order:

 - `/config/default.js`
 - `/config/*.js` (all files in config folder excluding local configs)
 - `/config/env/$NODE_ENV.js`
 - `/config/env/$NODE_ENV.local.js`
 - `/config/local.js`

When there is no `NODE_ENV` set, it defaults to `development`. 

You can adjust configuration directory with `NODE_CONFIG_DIR` environment variable.  

## Installation

`yarn add mikro-config`
 
or 

`npm install mikro-config`

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

## Usage

First you need to require the module, then you can use two ways to get properties. First 
way is to directly access property on config object, the other is to use `get`/`has` methods.  

```javascript
const config = require('mikro-config');
console.log(config.cache.expiration);
```

Mikro-config API has 3 public methods: 

### `config.get(key: string): any`

```javascript
const config = require('mikro-config');
console.log(config.get('cache.expiration')); // prints 300
```

### `config.has(key: string): bool`

```javascript
const config = require('mikro-config');
console.log(config.has('cache.expiration')); // prints true
```

### `config.addOptions(options: object|string)`

This method is used for adding configuration on the fly. You can pass an object with additional 
configuration, or a string path to JS file, that exports the configuration. 

```javascript
const config = require('mikro-config');
config.addOptions({newKey: 123});
console.log(config.newKey); // prints 123 
```

```javascript
const config = require('mikro-config');
config.addOptions(__dirname + '/routes'); // load routes.js file exporting routes object
console.log(config.routes); // prints routes object 
```
