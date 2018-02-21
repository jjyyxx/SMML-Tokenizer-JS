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
        const langDef = {
            root: [
                {
                    regex: /^\[(\d+\.)+\]/,
                    action: {
                        token: 'volta'
                    }
                },
                {
                    regex: /^<([^*]+)>/,
                    action: {
                        token: 'instr'
                    }
                },
                {
                    regex: /^@[a-z]+/,
                    action: {
                        token: 'macroIndicator'
                    }
                },
                {
                    regex: /^([A-Za-z]\w*)\s*\(/,
                    action: {
                        token: 'func',
                        next: 'Func'
                    }
                },
                {
                    regex: /^{(\d+\*)?/,
                    action: {
                        token: 'subtrack',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /^&/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /^\*/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /^\^/,
                    action: {
                        token: 'tie'
                    }
                },
                {
                    regex: /^(:\|\|:|:\|\||\|\|:|\|\||\||\/\d*:|\/)/,
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
                    regex: /^[0-7x%][A-Za-z]*[',#b]*[-_.=`]*[:>]*/,
                    action: {
                        token: 'note'
                    }
                },
                {
                    regex: /^\[([0-7x%][',#bA-Za-z]*)+\][',#b]*[-_.=`]*[:>]*/,
                    action: {
                        token: 'chord'
                    }
                }
            ],
            Subtrack: [
                {
                    regex: /^@[a-z]+/,
                    action: {
                        token: 'macroIndicator'
                    }
                },
                {
                    regex: /^([A-Za-z]\w*)\s*\(/,
                    action: {
                        token: 'func',
                        next: 'Func'
                    }
                },
                {
                    regex: /^{(\d+\*)?/,
                    action: {
                        token: 'subtrack',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /^}/,
                    action: {
                        token: '@pass',
                        next: '@pop'
                    }
                },
                {
                    regex: /^&/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /^\*/,
                    action: {
                        token: 'pr'
                    }
                },
                {
                    regex: /^\^/,
                    action: {
                        token: 'tie'
                    }
                },
                {
                    regex: /^(:\|\|:|:\|\||\|\|:|\|\||\||\/\d*:|\/)/,
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
                    regex: /^[0-7x%][A-Za-z]*[',#b]*[-_.=`]*[:>]*/,
                    action: {
                        token: 'note'
                    }
                },
                {
                    regex: /^\[([0-7x%][',#bA-Za-z]*)+\][',#b]*[-_.=`]*[:>]*/,
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
                /*                 {
                                    regex: /^\w+\s*\(/,
                                    action: {
                                        token: 'func',
                                        next: 'Arg'
                                    }
                                }, */
                {
                    regex: /^{/,
                    action: {
                        token: 'subtrack',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /^"[^"]*"/,
                    action: {
                        token: 'string'
                    }
                },
                {
                    regex: /^\[/,
                    action: {
                        token: 'array',
                        next: 'Array'
                    }
                },
                {
                    regex: /^[^,)}[\]"]+/,
                    action: {
                        token: 'number'
                    }
                },
                {
                    regex: /^\)/,
                    action: {
                        token: '@pass',
                        next: '@pop'
                    }
                },
                {
                    regex: /^,\s*/,
                    action: {
                        token: '@pass',
                    }
                }
            ],
            Array: [
                {
                    regex: /^,\s*/,
                    action: {
                        token: '@pass',
                    }
                },
                {
                    regex: /^\]/,
                    action: {
                        token: '@pass',
                        next: '@pop'
                    }
                },
                {
                    regex: /^{/,
                    action: {
                        token: 'subtrack',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /^"[^"]*"/,
                    action: {
                        token: 'string'
                    }
                },
                {
                    regex: /^\[/,
                    action: {
                        token: 'array',
                        next: 'Array'
                    }
                },
                {
                    regex: /^[^,)}[\]"]+/,
                    action: {
                        token: 'number'
                    }
                }
            ]/* ,
            Arg: [
                {
                    regex: /^{/,
                    action: {
                        token: 'subtrack',
                        next: 'Subtrack'
                    }
                },
                {
                    regex: /^"[^"]*"/,
                    action: {
                        token: 'string'
                    }
                },
                {
                    regex: /^\[/,
                    action: {
                        token: 'array',
                        next: 'Array'
                    }
                },
                {
                    regex: /^(,|\)|\])/,
                    action: {
                        token: '@rematch',
                        next: '@pop'
                    }
                },
                {
                    regex: /^[^,)}[\]"]+/,
                    action: {
                        token: 'number'
                    }
                }
            ] */
        }
        track = track.trim()
        const stateStore = [[]]
        const states = ['root']
        let depth = 0
        let pointer = 0
        while (pointer < track.length) {
            const temp = track.slice(pointer)
            const slice = temp.trim()
            pointer += temp.length - slice.length
            const patterns = langDef[states[depth]]

            for (let index = 0; index < patterns.length; index++) {
                const element = patterns[index]
                const match = slice.match(element.regex)
                if (match === null) continue
                let action
                if ('cases' in element.action) {
                    action = element.action.cases[match[0]]
                } else {
                    action = element.action
                }
                if (action.token !== '@rematch') {
                    if (action.token !== '@pass') {
                        stateStore[depth].push({
                            token: action.token,
                            match,
                            content: []
                        })
                    }
                    pointer += match[0].length
                }
                if ('next' in action) {
                    if (action.next === '@pop') {
                        depth -= 1
                        const state = stateStore.pop()
                        states.pop()
                        stateStore[depth][stateStore[depth].length - 1].content.push(...state)
                    } else {
                        stateStore.push([])
                        states.push(action.next)
                        depth += 1
                    }
                }
                break
            }
        }
    }

    split() {
        this.sections = this.content.split(/(\r?\n){3,}/)
            .filter((section) => section !== '' && section !== '\n' && section !== '\r\n')
            .map((section) => section.split(/\r?\n\r?\n/).map((track) => track.replace(/\r?\n/, '')))
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