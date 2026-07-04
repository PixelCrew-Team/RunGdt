class Lexer {
  constructor() {
    this.tokens = [];
    this.position = 0;
    this.code = '';
  }

  tokenize(code) {
    this.code = code;
    this.tokens = [];
    this.position = 0;

    while (this.position < this.code.length) {
      const char = this.code[this.position];

      // Comentarios
      if (char === '(') {
        this.readComment();
        continue;
      }

      // Palabras clave GetDomit
      const word = this.readWord();
      if (word) {
        const tokenType = this.getTokenType(word);
        this.tokens.push({ type: tokenType, value: word });
        continue;
      }

      // Símbolos
      if (char === '=') {
        this.tokens.push({ type: 'ASSIGN', value: '=' });
        this.position++;
        continue;
      }

      if (char === ':') {
        this.tokens.push({ type: 'COLON', value: ':' });
        this.position++;
        continue;
      }

      if (char === '{' || char === '}' || char === '[' || char === ']' || 
          char === '(' || char === ')' || char === ',' || char === '.' || char === ';') {
        this.tokens.push({ type: 'SYMBOL', value: char });
        this.position++;
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        const string = this.readString(char);
        this.tokens.push({ type: 'STRING', value: string });
        continue;
      }

      // Números
      if (char >= '0' && char <= '9') {
        const number = this.readNumber();
        this.tokens.push({ type: 'NUMBER', value: number });
        continue;
      }

      // Espacios en blanco
      if (char === ' ' || char === '\n' || char === '\t' || char === '\r') {
        this.position++;
        continue;
      }

      // Error
      throw new Error(`Token desconocido: ${char} en posición ${this.position}`);
    }

    this.tokens.push({ type: 'EOF', value: null });
    return this.tokens;
  }

  readComment() {
    this.position++; // Saltar '('
    const start = this.position;
    while (this.position < this.code.length && this.code[this.position] !== ')') {
      this.position++;
    }
    if (this.position < this.code.length) {
      this.position++; // Saltar ')'
    }
  }

  readWord() {
    const start = this.position;
    while (this.position < this.code.length && 
           /[a-zA-Z0-9_\-]/.test(this.code[this.position])) {
      this.position++;
    }
    if (this.position > start) {
      return this.code.substring(start, this.position);
    }
    return null;
  }

  getTokenType(word) {
    const keywords = {
      'traereg': 'IMPORT',
      'pós': 'FROM',
      'ordreg': 'CLASS',
      'ejecutax': 'FUNCTION',
      'asincrog': 'ASYNC',
      'etemdreg': 'TRY',
      'faixtg': 'CATCH',
      'sieg': 'IF',
      'no': 'NOT',
      'y': 'AND',
      'o': 'OR',
      'verdag': 'TRUE',
      'falsx': 'FALSE',
      'enviareg': 'EXPORT',
      'esperax': 'AWAIT',
      'cadaen': 'FOR_EACH',
      'recorx': 'FOR',
      'mientrax': 'WHILE',
      'cikla': 'LOOP',
      'rompx': 'BREAK',
      'saltax': 'CONTINUE',
      'retorna': 'RETURN',
      'creax': 'NEW',
      'borrax': 'DELETE',
      'sist': 'SYSTEM',
      'temp': 'TIMER',
      'net-': 'PROPERTY',
      'le-': 'VARIABLE'
    };

    // Verificar prefijos
    if (word.startsWith('net-')) return 'PROPERTY';
    if (word.startsWith('le-')) return 'VARIABLE';

    return keywords[word] || 'IDENTIFIER';
  }

  readString(quote) {
    this.position++; // Saltar comilla
    const start = this.position;
    while (this.position < this.code.length && this.code[this.position] !== quote) {
      if (this.code[this.position] === '\\') this.position++;
      this.position++;
    }
    const value = this.code.substring(start, this.position);
    this.position++; // Saltar comilla de cierre
    return value;
  }

  readNumber() {
    const start = this.position;
    while (this.position < this.code.length && /[0-9.]/.test(this.code[this.position])) {
      this.position++;
    }
    return parseFloat(this.code.substring(start, this.position));
  }
}

module.exports = { Lexer };