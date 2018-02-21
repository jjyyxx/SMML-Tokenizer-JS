class Tokenizer {
    /**
     * Construct a tokenizer
     * @param {string} content SMML string to tokenize
     */
    constructor(content) {
        this.content = content
        this.context = {
            include: [],
            rawMacros: {},
            states: []
        }
        this.sections = undefined
        this.pointer = 0
    }

    tokenize() {
        this.regularize()
        this.removeComment()
        this.extractHeader()
        this.split()
        for (const section of this.sections) {
            for (const track of section) {
                this.tokenizeTrack(track)
            }
        }
    }

    /**
     * 
     * @param {string} track 
     */
    tokenizeTrack(track) {
        const a = {
            root: [
                {
                    regex: /\[(\d+\.)+\]/,
                    action: {
                        token: 'volta'
                    }
                },
                {
                    regex: /<[^*]+>/,
                    action: {
                        token: 'instr'
                    }
                },
                {
                    regex: /@[a-z]+/,
                    action: {
                        token: 'macroIndicator'
                    }
                },
                {
                    regex: /(\w+)\s*\(/,
                    action: {
                        token: '@rematch',
                        next: 'Func'
                    }
                },
                {
                    regex: /{(\d+\*)?/,
                    action: {
                        token: 'bracket',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /}/,
                    action: {
                        token: 'bracket',
                        next: '@pop'
                    }
                },
                {
                    regex: /&/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /\*/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /\^/,
                    action: {
                        token: 'tie'
                    }
                },
                {
                    regex: /:\|\|:|:\|\||\|\|:|\|\||\||\/\d*:|\//,
                    action: {
                        cases: {
                            ':||:': {
                                token: 'rEB',
                            },
                            ':||': {
                                token: 'rE'
                            },
                            '||:': {
                                token: 'rB',
                            },
                            '||': {
                                token: 'te',
                            },
                            '|': {
                                token: 'ba',
                            },
                            '/': {
                                token: 'skip',
                            },
                            '@default': {
                                token: 'pos'
                            }
                        }
                    }
                },
                {
                    regex: /[0-7x%][A-Za-z]*[',#b]*[-_.=`]*[:>]*/,
                    action: {
                        token: 'note'
                    }
                },
                {
                    regex: /\[([0-7x%][',#bA-Za-z]*)+\][',#b]*[-_.=`]*[:>]*/,
                    action: {
                        token: 'chord'
                    }
                }
            ],
            Subtrack: [
                {
                    regex: /@[a-z]+/,
                    action: {
                        token: 'macroIndicator'
                    }
                },
                {
                    regex: /(\w+)\s*\(/,
                    action: {
                        token: '@rematch',
                        next: 'Func'
                    }
                },
                {
                    regex: /{(\d+\*)?/,
                    action: {
                        token: 'bracket',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /}/,
                    action: {
                        token: 'bracket',
                        next: '@pop'
                    }
                },
                {
                    regex: /&/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /\*/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /\^/,
                    action: {
                        token: 'tie'
                    }
                },
                {
                    regex: /:\|\|:|:\|\||\|\|:|\|\||\||\/\d*:|\//,
                    action: {
                        cases: {
                            ':||:': {
                                token: 'rEB',
                            },
                            ':||': {
                                token: 'rE'
                            },
                            '||:': {
                                token: 'rB',
                            },
                            '||': {
                                token: 'te',
                            },
                            '|': {
                                token: 'ba',
                            },
                            '/': {
                                token: 'skip',
                            },
                            '@default': {
                                token: 'pos'
                            }
                        }
                    }
                },
                {
                    regex: /[0-7x%][A-Za-z]*[',#b]*[-_.=`]*[:>]*/,
                    action: {
                        token: 'note'
                    }
                },
                {
                    regex: /\[([0-7x%][',#bA-Za-z]*)+\][',#b]*[-_.=`]*[:>]*/,
                    action: {
                        token: 'chord'
                    }
                }
            ],
            /* Sfunc: [
                {
                    regex: /\(\.\)/,
                    action: {
                        token: 'func',
                        next: '@pop'
                    }
                },
                {
                    regex: /\(\^/,
                    action: {
                        token: 'func',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /\(|\^|:|1=/,
                    action: {
                        token: 'func',
                    }
                },
                {
                    regex: /{/,
                    action: {
                        token: '@bracket',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /[^\)]+\^\)/,
                    action: {
                        token: '@rematch',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /\^\)/,
                    action: {
                        token: 'func',
                        next: '@pop'
                    }
                },
                {
                    regex: /\)/,
                    action: {
                        token: 'func',
                        next: '@pop'
                    }
                },
                {
                    regex: /[A-Za-zb#%\d\.\-\/]/,
                    action: {
                        token: 'number',
                    }
                },
            ], */
            Func: [
                {
                    regex: /\w+\s*\(/,
                    action: {
                        token: 'func',
                        next: 'Arg'
                    }
                },
                {
                    regex: /\)/,
                    action: {
                        token: 'func',
                        next: '@pop'
                    }
                },
                {
                    regex: /,\s*/,
                    action: {
                        token: 'func',
                        next: 'Arg'
                    }
                }
            ],
            Array: [
                {
                    regex: /\[/,
                    action: {
                        token: 'func',
                        bracket: '@open',
                        next: 'Arg'
                    }
                },
                {
                    regex: /,\s*/,
                    action: {
                        token: 'func',
                        next: 'Arg'
                    }
                },
                {
                    regex: /\]/,
                    action: {
                        token: 'func',
                        bracket: '@close',
                        next: '@pop'
                    }
                },
            ],
            Arg: [
                {
                    regex: /{/,
                    action: {
                        token: '@bracket',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /"[^"]*"/,
                    action: {
                        token: 'string'
                    }
                },
                {
                    regex: /\[/,
                    action: {
                        token: '@rematch',
                        next: 'Array'
                    }
                },
                {
                    regex: /,|\)|\]/,
                    action: {
                        token: '@rematch',
                        next: '@pop'
                    }
                },
                {
                    regex: /[^,)}[\]"]+/,
                    action: {
                        token: 'number'
                    }
                }
            ]
        }
        const part = this.handleSubtrack(track)
        const length = part.length
        const state = []
        let currentState = 'root'
        let pointer = 0
        let pointer1 = 0
        while (pointer < length) {
            if (typeof part[pointer] === 'string' && pointer1 < part[pointer].length) {
                if (currentState === 'root') {

                }
            } else { // subtrack

            }
        }
    }

    handleSubtrack(track) {
        const length = track.length
        const part = []
        let pointer = 0
        let lastRight = 0
        while (pointer < length) {
            if (track.charAt(pointer) === '{') {
                const right = this.findMatchBrace(track, pointer)
                part.push(track.slice(0, pointer), this.handleSubtrack(track.slice(pointer + 1, right)))
                pointer = right + 1
                lastRight = pointer
            } else {
                pointer += 1
            }
        }
        if (lastRight < length) {
            part.push(track.slice(lastRight))
        }
        return part
    }

    findMatchBrace(str, startIndex) {
        let stack = 1
        while (stack > 0) {
            startIndex += 1
            switch (str.charAt(startIndex)) {
            case '{':
                stack += 1
                break
            case '}':
                stack -= 1
            }
        }
        return startIndex
    }

    split() {
        this.sections = this.content.split(/(\r?\n){3,}/).filter((section) => section !== '' && section !== '\n' && section !== '\r\n').map((section) => section.split(/\r?\n\r?\n/))
    }

    regularize() {
        this.content = this.content.replace(/[ \t\f\v]+(\n|$)/g, '$1')
    }

    removeComment() {
        this.content = this.content.replace(/\/\/.*$/gm, '')
    }

    extractHeader() {
        this.content = this.content.replace(/^#\s*Include\s+"([^"]+)"/gm, (str, name) => {
            this.context.include.push(name)
            return ''
        }).replace(/#\s*Track([^]+?)#\s*End/g, (str, macroAll) => {
            const macros = macroAll.match(/<\*\w+\*>[^]+?(?=<\*(\w+)\*>|$)/g)
            for (const macro of macros) {
                const [_, name, content] = macro.match(/<\*(\w+)\*>([^]+)/)
                this.context.rawMacros[name] = content
            }
            return ''
        })
    }
}

module.exports = Tokenizer