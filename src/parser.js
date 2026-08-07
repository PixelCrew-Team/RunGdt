class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    peek() {
        return this.tokens[this.pos] || null;
    }
    next() {
        return this.tokens[this.pos++] || null;
    }
    expect(type) {
        const token = this.next();
        if (!token || token.type !== type) {
            throw new Error('Esperaba ' + type + ', encontró ' + (token ? token.type : 'EOF'));
        }
        return token;
    }
    parse() {
        const ast = {
            type: 'Program',
            body: []
        };
        while (this.peek()) {
            const statement = this.parseStatement();
            if (statement) {
                ast.body.push(statement);
            }
        }
        return ast;
    }
    parseStatement() {
        const token = this.peek();
        if (!token) return null;
        if (token.type === 'BRING') {
            return this.parseBring();
        }
        if (token.type === 'DEFINE') {
            return this.parseDefine();
        }
        if (token.type === 'EXPORT') {
            return this.parseExport();
        }
        if (token.type === 'IDENTIFIER' && this.tokens[this.pos + 1]?.type === 'META') {
            return this.parseMeta();
        }
        if (token.type === 'ASYNC') {
            return this.parseFunction();
        }
        return this.parseExpression();
    }
    parseBring() {
        this.expect('BRING');
        const token = this.peek();
        let imports = [];
        let source = '';
        if (token.type === 'IDENTIFIER') {
            const name = this.next().value;
            if (this.peek()?.type === 'COMMA') {
                this.expect('COMMA');
                imports = [{ name }];
                while (this.peek()?.type === 'IDENTIFIER') {
                    imports.push({ name: this.next().value });
                    if (this.peek()?.type === 'COMMA') {
                        this.expect('COMMA');
                    } else {
                        break;
                    }
                }
                this.expect('FROM');
                source = this.expect('STRING').value;
            } else if (this.peek()?.type === 'FROM') {
                this.expect('FROM');
                source = this.expect('STRING').value;
                imports = [{ name }];
            } else {
                source = this.expect('STRING').value;
                imports = [{ name }];
            }
        } else if (token.type === 'LBRACE') {
            this.expect('LBRACE');
            while (this.peek()?.type !== 'RBRACE') {
                const name = this.expect('IDENTIFIER').value;
                let alias = null;
                if (this.peek()?.type === 'AS') {
                    this.expect('AS');
                    alias = this.expect('IDENTIFIER').value;
                }
                imports.push({ name, alias });
                if (this.peek()?.type === 'COMMA') {
                    this.expect('COMMA');
                } else {
                    break;
                }
            }
            this.expect('RBRACE');
            this.expect('FROM');
            source = this.expect('STRING').value;
        }
        return {
            type: 'ImportDeclaration',
            imports,
            source
        };
    }
    parseDefine() {
        this.expect('DEFINE');
        const name = this.expect('IDENTIFIER').value;
        let properties = [];
        if (this.peek()?.type === 'LBRACKET') {
            this.expect('LBRACKET');
            while (this.peek()?.type !== 'RBRACKET') {
                const key = this.expect('IDENTIFIER').value;
                this.expect('COLON');
                const value = this.parseLiteral();
                properties.push({ key, value });
                if (this.peek()?.type === 'COMMA') {
                    this.expect('COMMA');
                } else {
                    break;
                }
            }
            this.expect('RBRACKET');
        }
        return {
            type: 'ClassDeclaration',
            name,
            properties
        };
    }
    parseExport() {
        this.expect('EXPORT');
        const name = this.expect('IDENTIFIER').value;
        return {
            type: 'ExportDeclaration',
            name
        };
    }
    parseMeta() {
        const name = this.expect('IDENTIFIER').value;
        this.expect('META');
        this.expect('LBRACE');
        const metadata = {};
        while (this.peek()?.type !== 'RBRACE') {
            const key = this.expect('IDENTIFIER').value;
            this.expect('COLON');
            const value = this.parseLiteral();
            metadata[key] = value;
            if (this.peek()?.type === 'COMMA') {
                this.expect('COMMA');
            } else {
                break;
            }
        }
        this.expect('RBRACE');
        return {
            type: 'MetaDeclaration',
            name,
            metadata
        };
    }
    parseFunction() {
        this.expect('ASYNC');
        const name = this.expect('IDENTIFIER').value;
        this.expect('LPAREN');
        const params = [];
        while (this.peek()?.type !== 'RPAREN') {
            const param = this.expect('IDENTIFIER').value;
            let type = null;
            if (this.peek()?.type === 'DOUBLE_COLON') {
                this.expect('DOUBLE_COLON');
                type = this.expect('IDENTIFIER').value;
            }
            params.push({ name: param, type });
            if (this.peek()?.type === 'COMMA') {
                this.expect('COMMA');
            } else {
                break;
            }
        }
        this.expect('RPAREN');
        let returnType = null;
        if (this.peek()?.type === 'DOUBLE_COLON') {
            this.expect('DOUBLE_COLON');
            returnType = this.expect('IDENTIFIER').value;
        }
        this.expect('ARROW');
        this.expect('LBRACE');
        const body = this.parseBlock();
        this.expect('RBRACE');
        return {
            type: 'FunctionDeclaration',
            name,
            params,
            returnType,
            body
        };
    }
    parseBlock() {
        const statements = [];
        while (this.peek() && this.peek().type !== 'RBRACE') {
            statements.push(this.parseStatement());
        }
        return statements;
    }
    parseExpression() {
        const token = this.peek();
        if (token.type === 'IDENTIFIER') {
            return this.parseIdentifierExpression();
        }
        if (token.type === 'NUMBER' || token.type === 'STRING') {
            return this.parseLiteral();
        }
        if (token.type === 'LBRACE') {
            return this.parseObject();
        }
        if (token.type === 'LBRACKET') {
            return this.parseArray();
        }
        if (token.type === 'MATCH') {
            return this.parseMatch();
        }
        if (token.type === 'WAIT') {
            this.expect('WAIT');
            return {
                type: 'AwaitExpression',
                argument: this.parseExpression()
            };
        }
        if (token.type === 'DONE') {
            this.expect('DONE');
            if (this.peek()) {
                return {
                    type: 'ReturnStatement',
                    argument: this.parseExpression()
                };
            }
            return {
                type: 'ReturnStatement',
                argument: null
            };
        }
        if (token.type === 'LEAVE') {
            this.expect('LEAVE');
            const name = this.expect('IDENTIFIER').value;
            let type = null;
            if (this.peek()?.type === 'DOUBLE_COLON') {
                this.expect('DOUBLE_COLON');
                type = this.expect('IDENTIFIER').value;
            }
            this.expect('EQ');
            const value = this.parseExpression();
            return {
                type: 'VariableDeclaration',
                name,
                type,
                value
            };
        }
        if (token.type === 'TRAP') {
            return this.parseTrap();
        }
        if (token.type === 'EACH') {
            return this.parseEach();
        }
        return this.parseLiteral();
    }
    parseLiteral() {
        const token = this.next();
        if (token.type === 'NUMBER') {
            return { type: 'NumericLiteral', value: parseFloat(token.value) };
        }
        if (token.type === 'STRING') {
            return { type: 'StringLiteral', value: token.value };
        }
        if (token.type === 'TRUE') {
            return { type: 'BooleanLiteral', value: true };
        }
        if (token.type === 'FALSE') {
            return { type: 'BooleanLiteral', value: false };
        }
        if (token.type === 'NULL') {
            return { type: 'NullLiteral', value: null };
        }
        throw new Error('Literal inesperado: ' + token.type);
    }
    parseIdentifierExpression() {
        const token = this.next();
        return { type: 'Identifier', name: token.value };
    }
    parseObject() {
        this.expect('LBRACE');
        const properties = [];
        while (this.peek()?.type !== 'RBRACE') {
            const key = this.expect('IDENTIFIER').value;
            this.expect('COLON');
            const value = this.parseExpression();
            properties.push({ key, value });
            if (this.peek()?.type === 'COMMA') {
                this.expect('COMMA');
            } else {
                break;
            }
        }
        this.expect('RBRACE');
        return { type: 'ObjectLiteral', properties };
    }
    parseArray() {
        this.expect('LBRACKET');
        const elements = [];
        while (this.peek()?.type !== 'RBRACKET') {
            elements.push(this.parseExpression());
            if (this.peek()?.type === 'COMMA') {
                this.expect('COMMA');
            } else {
                break;
            }
        }
        this.expect('RBRACKET');
        return { type: 'ArrayLiteral', elements };
    }
    parseMatch() {
        this.expect('MATCH');
        const condition = this.parseExpression();
        this.expect('COLON');
        const branches = [];
        while (this.peek() && this.peek().type !== 'OTHERWISE' && this.peek().type !== 'RBRACE') {
            const test = this.parseExpression();
            this.expect('COLON');
            const body = [];
            while (this.peek() && this.peek().type !== 'IDENTIFIER' && this.peek().type !== 'OTHERWISE' && this.peek().type !== 'RBRACE') {
                body.push(this.parseStatement());
            }
            branches.push({ test, body });
        }
        let alternate = null;
        if (this.peek()?.type === 'OTHERWISE') {
            this.expect('OTHERWISE');
            this.expect('COLON');
            alternate = [];
            while (this.peek() && this.peek().type !== 'RBRACE') {
                alternate.push(this.parseStatement());
            }
        }
        return { type: 'MatchStatement', condition, branches, alternate };
    }
    parseTrap() {
        this.expect('TRAP');
        const param = this.expect('IDENTIFIER').value;
        this.expect('COLON');
        const body = [];
        while (this.peek() && this.peek().type !== 'OTHERWISE' && this.peek().type !== 'RBRACE') {
            body.push(this.parseStatement());
        }
        let catchBody = null;
        let catchParam = null;
        if (this.peek()?.type === 'OTHERWISE') {
            this.expect('OTHERWISE');
            catchParam = this.expect('IDENTIFIER').value;
            this.expect('COLON');
            catchBody = [];
            while (this.peek() && this.peek().type !== 'RBRACE') {
                catchBody.push(this.parseStatement());
            }
        }
        return { type: 'TryStatement', param, body, catchParam, catchBody };
    }
    parseEach() {
        this.expect('EACH');
        const item = this.expect('IDENTIFIER').value;
        let index = null;
        if (this.peek()?.type === 'COMMA') {
            this.expect('COMMA');
            index = this.expect('IDENTIFIER').value;
        }
        this.expect('IN');
        const iterable = this.parseExpression();
        this.expect('COLON');
        const body = [];
        while (this.peek() && this.peek().type !== 'RBRACE') {
            body.push(this.parseStatement());
        }
        return { type: 'EachStatement', item, index, iterable, body };
    }
}
module.exports = { Parser };