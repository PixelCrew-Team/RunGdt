#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');
program.version(packageJson.version).description('🚀 NodeGDT - Runtime para GetDomit');
program.command('run <file>').description('Ejecuta un archivo .gdt').option('-w, --watch', 'Modo watch').option('-d, --debug', 'Modo debug').action(async (file, options) => {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.log(chalk.red('❌ Archivo no encontrado: ' + filePath));
        process.exit(1);
    }
    if (options.debug) {
        console.log(chalk.blue('[DEBUG] Archivo:', filePath));
    }
    try {
        require('../index.js');
        console.log(chalk.green('🚀 Ejecutando:', file));
        require(filePath);
    } catch (error) {
        console.log(chalk.red('❌ Error:'), error.message);
        if (options.debug) {
            console.log(error.stack);
        }
        process.exit(1);
    }
});
program.command('build <file>').description('Compila un archivo .gdt a JavaScript').option('-o, --output <dir>', 'Directorio de salida', './dist').action((file, options) => {
    const filePath = path.resolve(process.cwd(), file);
    const { transpile } = require('../src/transpiler');
    try {
        const code = fs.readFileSync(filePath, 'utf-8');
        const jsCode = transpile(code);
        const outputDir = path.resolve(process.cwd(), options.output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputFile = path.join(outputDir, path.basename(file).replace('.gdt', '.js'));
        fs.writeFileSync(outputFile, jsCode);
        console.log(chalk.green('✅ Compilado:', outputFile));
    } catch (error) {
        console.log(chalk.red('❌ Error:'), error.message);
        process.exit(1);
    }
});
program.command('init').description('Crea un nuevo proyecto GetDomit').action(() => {
    const projectPath = process.cwd();
    const packagePath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packagePath)) {
        console.log(chalk.yellow('⚠️ Ya existe package.json'));
        return;
    }
    const newPackage = {
        name: path.basename(projectPath),
        version: '1.0.0',
        description: 'Proyecto en GetDomit',
        main: 'index.gdt',
        scripts: {
            'start': 'nodegdt run index.gdt',
            'dev': 'nodegdt run index.gdt --watch'
        },
        dependencies: {
            'nodegdt': '^' + packageJson.version
        }
    };
    fs.writeFileSync(packagePath, JSON.stringify(newPackage, null, 2));
    fs.writeFileSync(path.join(projectPath, 'index.gdt'), `( ========================================== )
( index.gdt - Proyecto GetDomit )
( ========================================== )

console.log('🚀 ¡Hola GetDomit!');
`);
    console.log(chalk.green('✅ Proyecto GetDomit creado'));
    console.log(chalk.blue('📦 Ejecuta: npm install'));
    console.log(chalk.blue('🚀 Luego: nodegdt run index.gdt'));
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}