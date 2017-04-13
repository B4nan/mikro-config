# mikro-config

Tiny config helper, loads configuration in this order:

 - `/config/default.js`
 - `/config/*.js` (all files in config folder excluding local configs)
 - `/config/env/$NODE_ENV.js`
 - `/config/env/$NODE_ENV.local.js`
 - `/config/local.js`

When there is no `NODE_ENV` set, it defaults to `development`. 

You can adjust configuration directory with NODE_CONFIG_DIR environment variable.  

## Installation

`yarn add mikro-config`
 
or 

`npm install mikro-config`

## Sample configuration file

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
