const fs = require('fs');
const path = require('path');
const babel = require('@babel/parser');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node check_syntax.js <file>');
    process.exit(1);
}

try {
    const code = fs.readFileSync(filePath, 'utf-8');
    babel.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
    });
    console.log('Syntax OK');
} catch (e) {
    console.error('Syntax Error:', e.message);
    console.error('Location:', e.loc);
}
