class Transpiler {
  constructor() {
    this.jsCode = '';
    this.indent = 0;
  }

  async transpile(file) {
    const fs = require('fs-extra');
    const { Lexer } = require('./lexer');
    const { Parser } = require('./parser');

    const code = await fs.readFile(file, 'utf8');
    const lexer = new Lexer();
    const tokens = lexer.tokenize(code);
    const parser = new Parser();
    const ast = parser.parse(tokens);

    this.jsCode = '';
    this.indent = 0;
    this.generate(ast);

    return this.jsCode;
  }

  generate(node) {
    switch (node.type) {
      case 'Program':
        this.generateProgram(node);
        break;
      case 'ImportDeclaration':
        this.generateImport(node);
        break;
      case 'ClassDeclaration':
        this.generateClass(node);
        break;
      case 'FunctionDeclaration':
        this.generateFunction(node);
        break;
      case 'ExportDeclaration':
        this.generateExport(node);
        break;
      case 'IfStatement':
        this.generateIf(node);
        break;
      case 'TryStatement':
        this.generateTry(node);
        break;
      case 'AwaitExpression':
        this.generateAwait(node);
        break;
      case 'ReturnStatement':
        this.generateReturn(node);
        break;
      case 'VariableDeclaration':
        this.generateVariable(node);
        break;
      case 'CallExpression':
        this.generateCall(node);
        break;
      case 'PropertyDefinition':
        this.generateProperty(node);
        break;
      default:
        this.jsCode += '/* Sin implementar: ' + node.type + ' */\n';
    }
  }

  generateProgram(node) {
    node.body.forEach(statement => {
      this.generate(statement);
    });
  }

  generateImport(node) {
    let imports = '';
    if (node.specifiers.length === 1) {
      imports = node.specifiers[0].local;
    } else {
      imports = node.specifiers.map(s => s.local).join(', ');
    }
    this.jsCode += `const { ${imports} } = require('${node.source}');\n`;
  }

  generateClass(node) {
    this.jsCode += `class ${node.name} {\n`;
    this.indent++;
    
    node.body.forEach(member => {
      if (member.type === 'PropertyDefinition') {
        this.generateProperty(member);
      } else if (member.type === 'FunctionDeclaration') {
        this.generateFunction(member);
      }
    });

    this.indent--;
    this.jsCode += `}\n\n`;
  }

  generateProperty(node) {
    this.jsCode += this.getIndent();
    this.jsCode += `this.${node.key} = `;
    this.generate(node.value);
    this.jsCode += ';\n';
  }

  generateFunction(node) {
    this.jsCode += this.getIndent();
    if (node.async) this.jsCode += 'async ';
    this.jsCode += `${node.name}(${node.params.join(', ')}) {\n`;
    this.indent++;
    
    node.body.forEach(statement => {
      this.generate(statement);
    });

    this.indent--;
    this.jsCode += this.getIndent() + '}\n\n';
  }

  generateExport(node) {
    if (node.declaration.type === 'ClassDeclaration') {
      this.jsCode += `module.exports = ${node.declaration.name};\n`;
    } else if (node.declaration.type === 'FunctionDeclaration') {
      this.jsCode += `module.exports.${node.declaration.name} = ${node.declaration.name};\n`;
    }
  }

  generateIf(node) {
    this.jsCode += this.getIndent() + 'if (';
    this.generate(node.condition);
    this.jsCode += ') {\n';
    this.indent++;
    
    node.consequent.forEach(statement => {
      this.generate(statement);
    });

    this.indent--;
    this.jsCode += this.getIndent() + '}';

    if (node.alternate) {
      this.jsCode += ' else {\n';
      this.indent++;
      node.alternate.forEach(statement => {
        this.generate(statement);
      });
      this.indent--;
      this.jsCode += this.getIndent() + '}';
    }

    this.jsCode += '\n';
  }

  generateTry(node) {
    this.jsCode += this.getIndent() + 'try {\n';
    this.indent++;
    
    node.body.forEach(statement => {
      this.generate(statement);
    });

    this.indent--;
    this.jsCode += this.getIndent() + '}';

    if (node.handler) {
      this.jsCode += ` catch(${node.handler.param}) {\n`;
      this.indent++;
      node.handler.body.forEach(statement => {
        this.generate(statement);
      });
      this.indent--;
      this.jsCode += this.getIndent() + '}';
    }

    this.jsCode += '\n';
  }

  generateAwait(node) {
    this.jsCode += 'await ';
    this.generate(node.argument);
  }

  generateReturn(node) {
    this.jsCode += this.getIndent() + 'return ';
    this.generate(node.argument);
    this.jsCode += ';\n';
  }

  generateVariable(node) {
    this.jsCode += this.getIndent() + `const ${node.name} = `;
    this.generate(node.value);
    this.jsCode += ';\n';
  }

  generateCall(node) {
    if (node.callee === 'sist.sux') {
      this.jsCode += 'console.log';
    } else if (node.callee === 'sist.krx') {
      this.jsCode += 'console.error';
    } else if (node.callee === 'temp.sombx') {
      this.jsCode += 'setTimeout';
    } else {
      this.jsCode += node.callee;
    }
    this.jsCode += '(';
    this.jsCode += node.arguments.map(arg => {
      let str = '';
      this.generate(arg);
      return str;
    }).join(', ');
    this.jsCode += ')';
  }

  generateIdentifier(node) {
    this.jsCode += node.name;
  }

  generateStringLiteral(node) {
    this.jsCode += `'${node.value}'`;
  }

  generateNumericLiteral(node) {
    this.jsCode += node.value;
  }

  generateBooleanLiteral(node) {
    this.jsCode += node.value;
  }

  getIndent() {
    return '  '.repeat(this.indent);
  }
}

module.exports = { Transpiler };