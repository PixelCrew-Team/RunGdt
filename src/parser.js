class Parser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(tokens) {
    this.tokens = tokens;
    this.position = 0;
    return this.parseProgram();
  }

  parseProgram() {
    const nodes = [];
    while (this.current().type !== 'EOF') {
      const node = this.parseStatement();
      if (node) nodes.push(node);
    }
    return { type: 'Program', body: nodes };
  }

  current() {
    return this.tokens[this.position] || { type: 'EOF', value: null };
  }

  peek() {
    return this.tokens[this.position + 1] || { type: 'EOF', value: null };
  }

  consume(type) {
    if (this.current().type === type) {
      const token = this.current();
      this.position++;
      return token;
    }
    throw new Error(`Esperaba ${type}, encontró ${this.current().type}`);
  }

  parseStatement() {
    const token = this.current();

    switch (token.type) {
      case 'IMPORT':
        return this.parseImport();
      case 'CLASS':
        return this.parseClass();
      case 'FUNCTION':
        return this.parseFunction();
      case 'EXPORT':
        return this.parseExport();
      case 'IF':
        return this.parseIf();
      case 'TRY':
        return this.parseTry();
      case 'AWAIT':
        return this.parseAwait();
      case 'RETURN':
        return this.parseReturn();
      case 'VARIABLE':
        return this.parseVariable();
      default:
        return this.parseExpression();
    }
  }

  parseImport() {
    this.consume('IMPORT');
    const imports = [];
    if (this.current().value === '{') {
      this.consume('SYMBOL');
      while (this.current().type !== 'SYMBOL' || this.current().value !== '}') {
        const name = this.consume('IDENTIFIER');
        imports.push({ type: 'ImportSpecifier', local: name.value });
        if (this.current().type === 'SYMBOL' && this.current().value === ',') {
          this.consume('SYMBOL');
        }
      }
      this.consume('SYMBOL'); // '}'
    } else {
      const name = this.consume('IDENTIFIER');
      imports.push({ type: 'ImportDefault', local: name.value });
    }

    this.consume('FROM');
    const source = this.consume('STRING');

    return {
      type: 'ImportDeclaration',
      specifiers: imports,
      source: source.value
    };
  }

  parseClass() {
    this.consume('CLASS');
    const name = this.consume('IDENTIFIER');
    const body = [];

    // Propiedades y métodos
    while (this.current().type !== 'EOF') {
      if (this.current().type === 'PROPERTY') {
        const prop = this.consume('PROPERTY');
        this.consume('ASSIGN');
        const value = this.parseExpression();
        body.push({
          type: 'PropertyDefinition',
          key: prop.value.replace('net-', ''),
          value: value
        });
      } else if (this.current().type === 'FUNCTION') {
        const method = this.parseFunction();
        body.push(method);
      } else {
        break;
      }
    }

    return {
      type: 'ClassDeclaration',
      name: name.value,
      body: body
    };
  }

  parseFunction() {
    this.consume('FUNCTION');
    const isAsync = this.current().type === 'ASYNC';
    if (isAsync) this.consume('ASYNC');

    const name = this.consume('IDENTIFIER');
    this.consume('ASSIGN');
    this.consume('IDENTIFIER'); // 'f'
    this.consume('COLON');

    // Parámetros
    const params = [];
    if (this.current().value === '(') {
      this.consume('SYMBOL');
      while (this.current().type !== 'SYMBOL' || this.current().value !== ')') {
        const param = this.consume('IDENTIFIER');
        params.push(param.value);
        if (this.current().type === 'SYMBOL' && this.current().value === ',') {
          this.consume('SYMBOL');
        }
      }
      this.consume('SYMBOL'); // ')'
    }

    // Cuerpo
    const body = [];
    if (this.current().value === ':') {
      this.consume('SYMBOL');
      this.consume('SYMBOL'); // '{'
      while (this.current().value !== '}') {
        body.push(this.parseStatement());
      }
      this.consume('SYMBOL'); // '}'
    } else {
      body.push(this.parseStatement());
    }

    return {
      type: 'FunctionDeclaration',
      name: name.value,
      async: isAsync,
      params: params,
      body: body
    };
  }

  parseIf() {
    this.consume('IF');
    const condition = this.parseExpression();
    this.consume('COLON');
    const consequent = [this.parseStatement()];

    let alternate = null;
    if (this.current().type === 'IF' || this.current().type === 'NOT') {
      this.consume('NOT');
      this.consume('COLON');
      alternate = [this.parseStatement()];
    }

    return {
      type: 'IfStatement',
      condition: condition,
      consequent: consequent,
      alternate: alternate
    };
  }

  parseTry() {
    this.consume('TRY');
    this.consume('COLON');
    const body = [];

    while (this.current().type !== 'CATCH' && this.current().type !== 'EOF') {
      body.push(this.parseStatement());
    }

    let handler = null;
    if (this.current().type === 'CATCH') {
      this.consume('CATCH');
      const param = this.consume('IDENTIFIER');
      this.consume('COLON');
      const catchBody = [];
      while (this.current().type !== 'EOF' && this.current().value !== '}') {
        catchBody.push(this.parseStatement());
      }
      handler = {
        type: 'CatchClause',
        param: param.value,
        body: catchBody
      };
    }

    return {
      type: 'TryStatement',
      body: body,
      handler: handler
    };
  }

  parseAwait() {
    this.consume('AWAIT');
    const expression = this.parseExpression();
    return {
      type: 'AwaitExpression',
      argument: expression
    };
  }

  parseReturn() {
    this.consume('RETURN');
    const argument = this.parseExpression();
    return {
      type: 'ReturnStatement',
      argument: argument
    };
  }

  parseVariable() {
    const token = this.consume('VARIABLE');
    const name = token.value.replace('le-', '');
    this.consume('ASSIGN');
    const value = this.parseExpression();
    return {
      type: 'VariableDeclaration',
      name: name,
      value: value
    };
  }

  parseExport() {
    this.consume('EXPORT');
    const declaration = this.parseStatement();
    return {
      type: 'ExportDeclaration',
      declaration: declaration
    };
  }

  parseExpression() {
    // Parsear expresión básica
    const token = this.current();

    if (token.type === 'STRING') {
      this.position++;
      return { type: 'StringLiteral', value: token.value };
    }

    if (token.type === 'NUMBER') {
      this.position++;
      return { type: 'NumericLiteral', value: token.value };
    }

    if (token.type === 'TRUE' || token.type === 'FALSE') {
      this.position++;
      return { type: 'BooleanLiteral', value: token.type === 'TRUE' };
    }

    if (token.type === 'IDENTIFIER' || token.type === 'PROPERTY' || token.type === 'VARIABLE') {
      this.position++;
      const name = token.value.replace('net-', '').replace('le-', '');
      
      // Llamada a función
      if (this.current().type === 'SYMBOL' && this.current().value === '(') {
        this.consume('SYMBOL');
        const args = [];
        while (this.current().type !== 'SYMBOL' || this.current().value !== ')') {
          args.push(this.parseExpression());
          if (this.current().type === 'SYMBOL' && this.current().value === ',') {
            this.consume('SYMBOL');
          }
        }
        this.consume('SYMBOL'); // ')'
        return {
          type: 'CallExpression',
          callee: name,
          arguments: args
        };
      }

      return { type: 'Identifier', name: name };
    }

    throw new Error(`Expresión no reconocida: ${token.value}`);
  }
}

module.exports = { Parser };