#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { Runtime } = require('../src/runtime');
const { Transpiler } = require('../src/transpiler');

program
  .name('nodegdt')
  .description('Runtime para GetDomit - Ejecuta archivos .gdt')
  .version('1.0.0');

program.command('run')
  .description('Ejecuta un archivo .gdt')
  .argument('<file>', 'Archivo .gdt a ejecutar')
  .option('-w, --watch', 'Modo watch: reinicia al detectar cambios')
  .action(async (file, options) => {
    try {
      const runtime = new Runtime();
      await runtime.run(file, options);
    } catch (err) {
      console.error(chalk.red('❌ Error:'), err.message);
      process.exit(1);
    }
  });

program.command('build')
  .description('Compila .gdt a JavaScript')
  .argument('<file>', 'Archivo .gdt a compilar')
  .option('-o, --output <dir>', 'Directorio de salida', 'dist')
  .action(async (file, options) => {
    try {
      const transpiler = new Transpiler();
      const jsCode = await transpiler.transpile(file);
      const outputPath = path.join(options.output, path.basename(file).replace('.gdt', '.js'));
      await fs.ensureDir(options.output);
      await fs.writeFile(outputPath, jsCode);
      console.log(chalk.green(`✅ Compilado: ${file} → ${outputPath}`));
    } catch (err) {
      console.error(chalk.red('❌ Error:'), err.message);
      process.exit(1);
    }
  });

program.command('init')
  .description('Inicializa un proyecto GetDomit')
  .action(async () => {
    const template = {
      name: 'mi-proyecto-gdt',
      version: '1.0.0',
      type: 'module',
      main: 'index.gdt',
      scripts: {
        start: 'nodegdt run index.gdt',
        dev: 'nodegdt run index.gdt --watch'
      },
      dependencies: {
        nodegdt: '^1.0.0'
      }
    };
    await fs.writeFile('package.json', JSON.stringify(template, null, 2));
    await fs.writeFile('index.gdt', `( index.gdt - Mi primer programa GetDomit )\n\ntraereg fs pós 'fs-extra'\n\nordreg MiApp\n    ejecutax asincrog main = f:\n        sist.sux '🚀 Hola GetDomit!'\n\nenviareg MiApp\n\nesperax MiApp.main()`);
    console.log(chalk.green('✅ Proyecto GetDomit inicializado'));
    console.log(chalk.cyan('📁 Archivos creados: package.json, index.gdt'));
  });

program.parse();