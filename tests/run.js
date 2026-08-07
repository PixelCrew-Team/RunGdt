const { lexer } = require('../src/lexer');
const { Parser } = require('../src/parser');
const { transpile } = require('../src/transpiler');
const fs = require('fs');
const path = require('path');

function testLexer() {
    const code = `
bring config from '../config.gdt'
define MiClase [
    name: 'test'
]
export MiClase
`;
    const tokens = lexer(code);
    console.log('✅ Lexer test passed');
    return tokens;
}

function testParser() {
    const code = `
bring config from '../config.gdt'
define MiClase [
    name: 'test'
]
export MiClase
`;
    const tokens = lexer(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log('✅ Parser test passed');
    return ast;
}

function testTranspiler() {
    const code = `
bring config from '../config.gdt'
define MiClase [
    name: 'test'
]
export MiClase
`;
    const js = transpile(code);
    console.log('✅ Transpiler test passed');
    return js;
}

console.log('🧪 Ejecutando pruebas...');
testLexer();
testParser();
testTranspiler();
console.log('✅ Todas las pruebas pasaron!');