const { Transpiler } = require('./transpiler');
const { Cache } = require('./cache');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class Runtime {
  constructor() {
    this.cache = new Cache();
  }

  async run(file, options = {}) {
    const fullPath = path.resolve(file);
    
    // Verificar que el archivo existe
    if (!await fs.exists(fullPath)) {
      throw new Error(`Archivo no encontrado: ${fullPath}`);
    }

    // Verificar que es .gdt
    if (!fullPath.endsWith('.gdt')) {
      throw new Error('Solo se pueden ejecutar archivos .gdt');
    }

    // Modo watch
    if (options.watch) {
      console.log('👁️ Modo watch activado');
      const watcher = require('fs').watch(fullPath, async (event) => {
        if (event === 'change') {
          console.log('🔄 Cambio detectado, reiniciando...');
          await this.execute(fullPath);
        }
      });
      process.on('SIGINT', () => {
        watcher.close();
        process.exit(0);
      });
    }

    // Ejecutar
    await this.execute(fullPath);
  }

  async execute(file) {
    try {
      const transpiler = new Transpiler();
      
      // Verificar caché
      const cached = await this.cache.get(file);
      let jsCode;
      
      if (cached && !this.isFileChanged(file, cached.timestamp)) {
        console.log('📦 Usando caché');
        jsCode = cached.code;
      } else {
        console.log('🔄 Transpilando...');
        jsCode = await transpiler.transpile(file);
        await this.cache.set(file, jsCode);
      }

      // Guardar temporalmente para ejecutar
      const tempFile = path.join(__dirname, '../temp', path.basename(file).replace('.gdt', '.js'));
      await fs.ensureDir(path.dirname(tempFile));
      await fs.writeFile(tempFile, jsCode);

      // Ejecutar con Node.js
      console.log('🚀 Ejecutando...');
      const result = require(tempFile);
      
      // Si el archivo exporta una función main, ejecutarla
      if (result && typeof result === 'function') {
        await result();
      }

      return result;
    } catch (err) {
      console.error('❌ Error en ejecución:', err.message);
      throw err;
    }
  }

  isFileChanged(file, timestamp) {
    const stats = fs.statSync(file);
    return stats.mtimeMs > timestamp;
  }
}

module.exports = { Runtime };