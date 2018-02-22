const { Tokenizer } = require('./index')
const fs = require('fs')

const str = fs.readFileSync(__dirname + '/test2.sml', 'utf8')
console.time('hehe')

// fs.writeFileSync(__dirname + '/test2.json', JSON.stringify(new Tokenizer(str).tokenize()), 'utf8')
for (var i = 0; i < 1; i++) new Tokenizer(str).tokenize()
console.timeEnd('hehe')