const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { transpile } = require('./transpiler');
const { loadGDTModule } = require('./loader');

function runFile(filePath, options = {}) {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(resolvedPath)) {
        console.log(chalk.red('❌ Archivo no encontrado: ' + resolvedPath));
        process.exit(1);
    }
    
    try {
        require('../index.js');
        require(resolvedPath);
    } catch (error) {
        console.log(chalk.red('❌ Error al ejecutar:'), error.message);
        if (options.debug) {
            console.log(error.stack);
        }
        process.exit(1);
    }
}

function buildFile(filePath, outputDir = './dist') {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(resolvedPath)) {
        console.log(chalk.red('❌ Archivo no encontrado: ' + resolvedPath));
        process.exit(1);
    }
    
    try {
        const code = fs.readFileSync(resolvedPath, 'utf8');
        const jsCode = transpile(code);
        
        const outputPath = path.resolve(process.cwd(), outputDir);
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }
        
        const outputFile = path.join(outputPath, path.basename(filePath).replace('.gdt', '.js'));
        fs.writeFileSync(outputFile, jsCode);
        
        console.log(chalk.green('✅ Compilado:'), outputFile);
    } catch (error) {
        console.log(chalk.red('❌ Error al compilar:'), error.message);
        process.exit(1);
    }
}

function initProject() {
    const projectPath = process.cwd();
    const packagePath = path.join(projectPath, 'package.json');
    
    if (fs.existsSync(packagePath)) {
        console.log(chalk.yellow('⚠️ Ya existe package.json'));
        return;
    }
    
    const packageJson = {
        name: path.basename(projectPath),
        version: '1.0.0',
        description: 'Proyecto en GetDomit',
        main: 'index.gdt',
        scripts: {
            'start': 'nodegdt run index.gdt',
            'dev': 'nodegdt run index.gdt --watch'
        },
        dependencies: {
            'nodegdt': '^0.1.0'
        }
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    fs.writeFileSync(path.join(projectPath, 'index.gdt'), `( ========================================== )
( index.gdt - Proyecto GetDomit )
( ========================================== )

bring config from './config.gdt'

console.log('🚀 ¡Hola GetDomit!')
console.log('📦 Config:', config)
`);
    fs.writeFileSync(path.join(projectPath, 'config.gdt'), `( ========================================== )
( config.gdt - Configuración )
( ========================================== )

export {
    name: 'MiProyecto',
    version: '1.0.0',
    author: 'TuNombre'
}
`);
    
    console.log(chalk.green('✅ Proyecto GetDomit creado'));
    console.log(chalk.blue('📦 Ejecuta: npm install'));
    console.log(chalk.blue('🚀 Luego: nodegdt run index.gdt'));
}

module.exports = {
    runFile,
    buildFile,
    initProject
};