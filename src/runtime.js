const fs = require('fs');
const { transpile } = require('./transpiler');
function registerGDTExtension() {
    if (require.extensions['.gdt']) return;
    require.extensions['.gdt'] = function (module, filename) {
        try {
            const source = fs.readFileSync(filename, 'utf8');
            const jsCode = transpile(source);
            module._compile(jsCode, filename);
        } catch (error) {
            console.error('❌ Error al transpilar:', filename);
            console.error(error.message);
            throw error;
        }
    };
}
module.exports = {
    registerGDTExtension
};