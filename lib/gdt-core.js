// Funciones nativas de GetDomit
class GDT {
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static log(message) {
    console.log(message);
  }

  static error(message) {
    console.error(message);
  }

  static async readFile(path) {
    const fs = require('fs-extra');
    return await fs.readFile(path, 'utf8');
  }

  static async writeFile(path, data) {
    const fs = require('fs-extra');
    return await fs.writeFile(path, data);
  }

  static async exists(path) {
    const fs = require('fs-extra');
    return await fs.exists(path);
  }
}

module.exports = { GDT };