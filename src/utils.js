const fs = require('fs');
const path = require('path');

function getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
}

function isGDTFile(filename) {
    return getFileExtension(filename) === '.gdt';
}

function resolveModulePath(modulePath, basePath) {
    if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
        return path.resolve(basePath, modulePath);
    }
    return modulePath;
}

function hasGDTExtension(modulePath) {
    return modulePath.endsWith('.gdt');
}

function ensureGDTExtension(modulePath) {
    if (!hasGDTExtension(modulePath)) {
        return modulePath + '.gdt';
    }
    return modulePath;
}

module.exports = {
    getFileExtension,
    isGDTFile,
    resolveModulePath,
    hasGDTExtension,
    ensureGDTExtension
};