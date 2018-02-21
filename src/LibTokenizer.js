const libDef = [
    {
        regex: /^#\s*Include\s+"([^)]+)"/,
        type: 'Package',
        transform(inc) {

        }
    },
    {
        regex: /^#\s*Chord([^]+?)\r?\n(?=#)/,
        type: 'Chord',
        transform(chords) {

        }
    },
    {
        regex: /^#\s*Function([^]+?)\r?\n(?=#)/,
        type: 'Function',
        transform(funcs) {

        }
    },
    {
        regex: /^#\s*Macro([^]+?)\r?\n(?=#)/,
        type: 'Macro',
        transform(macros) {

        }
    }
]

class LibTokenizer {
    constructor(content, internal = true) {
        if (internal) {
            this.content = content
        } else {

        }
    }

    tokenize() {
        const result = {
            Chord: [],
            Function: [],
            Macro: []
        }
        return ''
    }
}

module.exports = LibTokenizer
