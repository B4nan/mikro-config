'use strict';

const _ = require('lodash');
const fs = require('fs');

const ENVIRONMENT = process.env.NODE_ENV || 'development';
const CONFIG_DIR = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
const CONFIG = {};

/**
 * Simple config helper, loads configuration in this order:
 *  - /config/default.js
 *  - /config/*.js (all files in config folder excluding local configs)
 *  - /config/env/$NODE_ENV.js
 *  - /config/env/$NODE_ENV.local.js
 *  - /config/local.js
 */
class Config {

  constructor() {
    this._buildConfig(CONFIG_DIR, ENVIRONMENT);
  }

  /**
   * @param {String} key
   * @return {*}
   */
  get(key) {
    return _.get(CONFIG, key);
  }

  /**
   * @param {String} key
   * @return {Boolean}
   */
  has(key) {
    return _.has(CONFIG, key);
  }

  /**
   * @param {String} configDir
   * @param {String} environment
   * @private
   */
  _buildConfig(configDir, environment) {
    // load default config file
    this.addOptions(configDir + '/default.js');

    // load additional config files
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir).filter(file => file.endsWith('.js') && !['default.js', 'local.js'].includes(file));
      files.forEach(file => this.addOptions(`${configDir}/${file}`));
    }

    // load _environment config
    this.addOptions(`${configDir}/env/${environment}.js`);

    // load local _environment config
    this.addOptions(`${configDir}/env/${environment}.local.js`);

    // load local config
    this.addOptions(`${configDir}/local.js`);

    // support `config.foo.bar` syntax (instead of `config.get('foo.bar')`)
    _.merge(this, CONFIG);
  }

  /**
   * @param {Object|String} options or path to config file to merge (checks for existence synchronously)
   */
  addOptions(options) {
    if (typeof options === 'string') {
      if (fs.existsSync(options)) {
        options = require(options);
      } else {
        options = {};
      }
    }

    _.merge(CONFIG, options);
  }

  /**
   * @return {String}
   */
  getEnvironment() {
    return ENVIRONMENT;
  }

}

module.exports = new Config();
