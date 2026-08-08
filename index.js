const { registerGDTExtension } = require('./src/runtime');
registerGDTExtension();
module.exports = {
    registerGDTExtension,
    version: require('./package.json').version
};
if (require.main === module) {
    console.log('🚀 NodeGDT v' + require('./package.json').version);
    console.log('📦 Run GetDomit files with: nodegdt run <file.gdt>');
}