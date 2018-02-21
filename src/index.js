const Tokenizer = require('./Tokenizer')

const str = require('fs').readFileSync(__dirname + '/test5.sml', 'utf8')
console.time('hehe')
for (let index = 0; index < 10000; index++) {
    new Tokenizer(str).tokenize()
}
console.timeEnd('hehe')