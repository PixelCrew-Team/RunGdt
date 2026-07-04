const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class Cache {
  constructor() {
    this.cacheDir = path.join(__dirname, '../.cache');
    this.ensureCacheDir();
  }

  async ensureCacheDir() {
    await fs.ensureDir(this.cacheDir);
  }

  getCacheKey(file) {
    const hash = crypto.createHash('md5').update(file).digest('hex');
    return path.join(this.cacheDir, `${hash}.json`);
  }

  async get(file) {
    const key = this.getCacheKey(file);
    if (await fs.exists(key)) {
      const data = await fs.readJson(key);
      return data;
    }
    return null;
  }

  async set(file, code) {
    const key = this.getCacheKey(file);
    const stats = fs.statSync(file);
    const data = {
      code: code,
      timestamp: stats.mtimeMs,
      file: file
    };
    await fs.writeJson(key, data);
  }

  async clear() {
    await fs.emptyDir(this.cacheDir);
  }
}

module.exports = { Cache };