function lexer(code) {
    const tokens = [];
    let pos = 0;
    while (pos < code.length) {
        const char = code[pos];
        if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
            pos++;
            continue;
        }
        if (char === '(' && code[pos + 1] === ' ') {
            let start = pos;
            pos += 2;
            while (pos < code.length && !(code[pos] === ')' && code[pos - 1] === ' ')) {
                pos++;
            }
            tokens.push({ type: 'COMMENT', value: code.substring(start + 2, pos) });
            pos++;
            continue;
        }
        if (char === '(' && code[pos + 1] !== ' ') {
            pos++;
            tokens.push({ type: 'LPAREN', value: '(' });
            continue;
        }
        if (char === ')') {
            pos++;
            tokens.push({ type: 'RPAREN', value: ')' });
            continue;
        }
        if (char === '{') {
            pos++;
            tokens.push({ type: 'LBRACE', value: '{' });
            continue;
        }
        if (char === '}') {
            pos++;
            tokens.push({ type: 'RBRACE', value: '}' });
            continue;
        }
        if (char === '[') {
            pos++;
            tokens.push({ type: 'LBRACKET', value: '[' });
            continue;
        }
        if (char === ']') {
            pos++;
            tokens.push({ type: 'RBRACKET', value: ']' });
            continue;
        }
        if (char === ':') {
            pos++;
            tokens.push({ type: 'COLON', value: ':' });
            continue;
        }
        if (char === ',') {
            pos++;
            tokens.push({ type: 'COMMA', value: ',' });
            continue;
        }
        if (char === ';') {
            pos++;
            tokens.push({ type: 'SEMICOLON', value: ';' });
            continue;
        }
        if (char === '=') {
            pos++;
            if (code[pos] === '=') {
                pos++;
                tokens.push({ type: 'EQ_EQ', value: '==' });
            } else if (code[pos] === '>') {
                pos++;
                tokens.push({ type: 'ARROW', value: '=>' });
            } else {
                tokens.push({ type: 'EQ', value: '=' });
            }
            continue;
        }
        if (char === '!') {
            pos++;
            if (code[pos] === '=') {
                pos++;
                tokens.push({ type: 'NOT_EQ', value: '!=' });
            } else {
                tokens.push({ type: 'NOT', value: '!' });
            }
            continue;
        }
        if (char === '>') {
            pos++;
            if (code[pos] === '=') {
                pos++;
                tokens.push({ type: 'GTE', value: '>=' });
            } else {
                tokens.push({ type: 'GT', value: '>' });
            }
            continue;
        }
        if (char === '<') {
            pos++;
            if (code[pos] === '=') {
                pos++;
                tokens.push({ type: 'LTE', value: '<=' });
            } else {
                tokens.push({ type: 'LT', value: '<' });
            }
            continue;
        }
        if (char === '+') {
            pos++;
            if (code[pos] === '+') {
                pos++;
                tokens.push({ type: 'INCREMENT', value: '++' });
            } else {
                tokens.push({ type: 'PLUS', value: '+' });
            }
            continue;
        }
        if (char === '-') {
            pos++;
            if (code[pos] === '-') {
                pos++;
                tokens.push({ type: 'DECREMENT', value: '--' });
            } else if (code[pos] === '>') {
                pos++;
                tokens.push({ type: 'ARROW', value: '->' });
            } else {
                tokens.push({ type: 'MINUS', value: '-' });
            }
            continue;
        }
        if (char === '*') {
            pos++;
            tokens.push({ type: 'STAR', value: '*' });
            continue;
        }
        if (char === '/') {
            pos++;
            tokens.push({ type: 'SLASH', value: '/' });
            continue;
        }
        if (char === '%') {
            pos++;
            tokens.push({ type: 'MOD', value: '%' });
            continue;
        }
        if (char === '?') {
            pos++;
            if (code[pos] === ':') {
                pos++;
                tokens.push({ type: 'ELVIS', value: '?:' });
            } else {
                tokens.push({ type: 'QUESTION', value: '?' });
            }
            continue;
        }
        if (char === '~') {
            pos++;
            if (code[pos] === '>') {
                pos++;
                tokens.push({ type: 'META', value: '~>' });
            }
            continue;
        }
        if (char === '"' || char === "'") {
            const quote = char;
            pos++;
            let start = pos;
            while (pos < code.length && code[pos] !== quote) {
                if (code[pos] === '\\') pos++;
                pos++;
            }
            const value = code.substring(start, pos);
            pos++;
            tokens.push({ type: 'STRING', value: value });
            continue;
        }
        if (/[0-9]/.test(char)) {
            let start = pos;
            while (pos < code.length && /[0-9.]/.test(code[pos])) {
                pos++;
            }
            tokens.push({ type: 'NUMBER', value: code.substring(start, pos) });
            continue;
        }
        if (/[a-zA-Z_]/.test(char)) {
            let start = pos;
            while (pos < code.length && /[a-zA-Z0-9_]/.test(code[pos])) {
                pos++;
            }
            const value = code.substring(start, pos);
            const keywords = {
                'bring': 'BRING',
                'export': 'EXPORT',
                'define': 'DEFINE',
                'own': 'OWN',
                'leave': 'LEAVE',
                'match': 'MATCH',
                'otherwise': 'OTHERWISE',
                'wait': 'WAIT',
                'done': 'DONE',
                'trap': 'TRAP',
                'each': 'EACH',
                'async': 'ASYNC',
                'type': 'TYPE',
                'true': 'TRUE',
                'false': 'FALSE',
                'null': 'NULL'
            };
            tokens.push({
                type: keywords[value] || 'IDENTIFIER',
                value: value
            });
            continue;
        }
        throw new Error('Caracter inesperado: ' + char + ' en posición ' + pos);
    }
    return tokens;
}
module.exports = { lexer };