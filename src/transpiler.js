const { lexer } = require('./lexer');
const { Parser } = require('./parser');
function transpile(code) {
    const tokens = lexer(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return generateJS(ast);
}
function generateJS(ast) {
    let output = '';
    for (const node of ast.body) {
        output += generateNode(node) + '\n';
    }
    return output;
}
function generateNode(node) {
    if (!node) return '';
    switch (node.type) {
        case 'ImportDeclaration':
            return generateImport(node);
        case 'ExportDeclaration':
            return 'module.exports = ' + node.name + ';';
        case 'ClassDeclaration':
            return generateClass(node);
        case 'MetaDeclaration':
            return '';
        case 'FunctionDeclaration':
            return generateFunction(node);
        case 'VariableDeclaration':
            return 'let ' + node.name + ' = ' + generateNode(node.value) + ';';
        case 'AwaitExpression':
            return 'await ' + generateNode(node.argument);
        case 'ReturnStatement':
            return 'return ' + (node.argument ? generateNode(node.argument) : '') + ';';
        case 'MatchStatement':
            return generateMatch(node);
        case 'TryStatement':
            return generateTry(node);
        case 'EachStatement':
            return generateEach(node);
        case 'Identifier':
            return node.name;
        case 'NumericLiteral':
            return node.value;
        case 'StringLiteral':
            return '"' + node.value + '"';
        case 'BooleanLiteral':
            return node.value;
        case 'NullLiteral':
            return 'null';
        case 'ObjectLiteral':
            return generateObject(node);
        case 'ArrayLiteral':
            return '[' + node.elements.map(e => generateNode(e)).join(', ') + ']';
        default:
            return '';
    }
}
function generateImport(node) {
    const imports = node.imports.map(i => {
        if (i.alias) {
            return i.name + ' as ' + i.alias;
        }
        return i.name;
    }).join(', ');
    if (node.imports.length === 1 && !node.imports[0].alias) {
        return 'const ' + node.imports[0].name + ' = require(\'' + node.source + '\');';
    }
    return 'const { ' + imports + ' } = require(\'' + node.source + '\');';
}
function generateClass(node) {
    let output = 'class ' + node.name + ' {\n';
    output += '    constructor() {\n';
    for (const prop of node.properties) {
        output += '        this.' + prop.key + ' = ' + generateNode(prop.value) + ';\n';
    }
    output += '    }\n';
    output += '}\n';
    return output;
}
function generateFunction(node) {
    const params = node.params.map(p => p.name).join(', ');
    let output = 'async function ' + node.name + '(' + params + ') {\n';
    for (const stmt of node.body) {
        output += '    ' + generateNode(stmt) + '\n';
    }
    output += '}';
    return output;
}
function generateMatch(node) {
    let output = 'if (' + generateNode(node.condition) + ') {\n';
    for (const branch of node.branches) {
        output += '    if (' + generateNode(branch.test) + ') {\n';
        for (const stmt of branch.body) {
            output += '        ' + generateNode(stmt) + '\n';
        }
        output += '    } else ';
    }
    if (node.alternate) {
        output += '{\n';
        for (const stmt of node.alternate) {
            output += '        ' + generateNode(stmt) + '\n';
        }
        output += '    }\n';
    }
    output += '}';
    return output;
}
function generateTry(node) {
    let output = 'try {\n';
    for (const stmt of node.body) {
        output += '    ' + generateNode(stmt) + '\n';
    }
    output += '} catch (' + node.param + ') {\n';
    if (node.catchBody) {
        for (const stmt of node.catchBody) {
            output += '    ' + generateNode(stmt) + '\n';
        }
    }
    output += '}';
    return output;
}
function generateEach(node) {
    let output = 'for (const ' + node.item + ' of ' + generateNode(node.iterable) + ') {\n';
    for (const stmt of node.body) {
        output += '    ' + generateNode(stmt) + '\n';
    }
    output += '}';
    return output;
}
function generateObject(node) {
    const props = node.properties.map(p => {
        return p.key + ': ' + generateNode(p.value);
    });
    return '{ ' + props.join(', ') + ' }';
}
module.exports = { transpile };