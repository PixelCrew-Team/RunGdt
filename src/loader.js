const fs = require('fs');
const path = require('path');
const { transpile } = require('./transpiler');
const { hasGDTExtension, ensureGDTExtension, resolveModulePath } = require('./utils');

function loadGDTModule(modulePath, basePath) {
    const resolvedPath = resolveModulePath(modulePath, basePath);
    const finalPath = hasGDTExtension(resolvedPath) ? resolvedPath : resolvedPath + '.gdt';
    
    if (!fs.existsSync(finalPath)) {
        throw new Error('Modulo no encontrado: ' + finalPath);
    }
    
    const source = fs.readFileSync(finalPath, 'utf8');
    const jsCode = transpile(source);
    
    const module = { exports: {} };
    const compiledFn = new Function('module', 'exports', 'require', '__dirname', '__filename', jsCode);
    compiledFn(module, module.exports, require, path.dirname(finalPath), finalPath);
    
    return module.exports;
}

function registerGDTHook() {
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    
    Module.prototype.require = function(id) {
        if (typeof id === 'string' && id.endsWith('.gdt')) {
            const basePath = path.dirname(this.filename || process.cwd());
            return loadGDTModule(id, basePath);
        }
        return originalRequire.call(this, id);
    };
}

module.exports = {
    loadGDTModule,
    registerGDTHook
};