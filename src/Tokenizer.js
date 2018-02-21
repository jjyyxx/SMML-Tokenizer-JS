const langDef = {
    root: [
        {
            regex: /^\[(\d+\.)+\]/,
            action: {
                token: 'volta',
                transform(volta) {
                    return {
                        Type: 'Volta',
                        Order: volta[0].split('.').slice(0, -1).map((s) => Number(s))
                    }
                }
            }
        },
        {
            regex: /^<([A-Za-z0-9]+(\(.+\))?)(,[A-Za-z0-9]+(\(.+\))?)*>/,
            action: {
                token: 'instr',
                transform(instrs) {
                    instrs.split(',').map((instr) => {
                        const info = instr.match(/(\w+)(\(\d+%\))?/)
                        return {
                            Instrument: info[1],
                            Proportion: info[2] === undefined ? null : Number(info[2].slice(1, -2)) / 100
                        }
                    })
                }
            }
        },
        {
            regex: /^@[a-z]+/,
            action: {
                token: 'macroIndicator',
                transform(macro) {
                    return {
                        Type: 'Macrotrack',
                        Name: macro[0].slice(1)
                    }
                }
            }
        },
        {
            regex: /^([A-Za-z]\w*)\s*\(/,
            action: {
                token: 'func',
                next: 'Func',
                transform(func, content) {
                    return {
                        Type: 'FUNCTION',
                        Name: func[1],
                        Argument: content
                    }
                }
            }
        },
        {
            regex: /^{(\d+\*)?/,
            action: {
                token: 'subtrack',
                next: 'root',
                transform(subtrack, content) {
                    let repeat
                    if (subtrack[1] !== undefined) {
                        repeat = subtrack[1].slice(0, -1)
                    } else {
                        const pos = content.filter((e) => e.Type === 'BarLine' && e.Order[0] > 0)
                        if (pos.length > 0) {
                            repeat = Math.max(...pos.map((e) => Math.max(...e.Order)))
                        } else {
                            repeat = -1
                        }
                    }
                    return {
                        Type: 'Subtrack',
                        Repeat: repeat,
                        Content: content
                    }
                }
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
                token: 'pr',
                transform() {
                    return {
                        Type: 'PedalPress'
                    }
                }
            }
        },
        {
            regex: /^\*/,
            action: {
                token: 'pr',
                transform() {
                    return {
                        Type: 'PedalRelease'
                    }
                }
            }
        },
        {
            regex: /^\^/,
            action: {
                token: 'tie',
                transform() {
                    return {
                        Type: 'Tie'
                    }
                }
            }
        },
        {
            regex: /^(:\|\|:|:\|\||\|\|:|\||\/([\d,~\s])*:|\/)/,
            action: {
                cases: {
                    ':||:': {
                        token: 'rEB',
                    },
                    ':||': {
                        token: 'rE',
                        transform() {
                            return {
                                Type: 'RepeatEnd'
                            }
                        }
                    },
                    '||:': {
                        token: 'rB',
                        transform() {
                            return {
                                Type: 'RepeatBegin'
                            }
                        }
                    },
                    '|': {
                        token: 'ba',
                        transform() {
                            return {
                                Type: 'BarLine',
                                Skip: false,
                                Order: [0]
                            }
                        }
                    },
                    '/': {
                        token: 'skip',
                        transform() {
                            return {
                                Type: 'BarLine',
                                Skip: true,
                                Order: [0]
                            }
                        }
                    },
                    '@default': {
                        token: 'pos',
                        transform(pos) {
                            let order = []
                            if (pos[1] !== undefined) {
                                const parts = pos[1].split(',')
                                for (const part of parts) {
                                    if (part.includes('~')) {
                                        const [left, right] = part.split('~')
                                        for (var i = left; i <= right; i++) {
                                            order.push(i)
                                        }
                                    } else {
                                        order.push(Number(part))
                                    }
                                }
                            }
                            return {
                                Type: 'BarLine',
                                Skip: false,
                                Order: order
                            }
                        }
                    }
                }
            }
        },
        {
            regex: /^([0-7x%])([',#b]*)([A-Zac-z]*)([-_.=]*)(`*)([:>]*)/,
            action: {
                token: 'note',
                transform(note) {
                    return {
                        Type: 'Note',
                        Pitches: [
                            {
                                ScaleDegree: note[1],
                                PitchOperators: note[2] === undefined ? '' : note[2],
                                Chord: note[3] === undefined ? '' : note[3]
                            }
                        ],
                        PitchOperators: '',
                        DurationOperators: note[4] === undefined ? '' : note[4],
                        VolumeOperators: note[6] === undefined ? '' : note[6],
                        Staccato: note[5] === undefined ? 0 : note[5].length
                    }
                }
            }
        },
        {
            regex: /^\[(([0-7x%][',#A-Za-z]*)+)\]([',#b]*)([-_.=]*)(`*)([:>]*)/,
            action: {
                token: 'chord',
                transform(note) {
                    return {
                        Type: 'Note',
                        Pitches: note[1].match(/[0-7x%][',#A-Za-z]*/g).map((pitch) => {
                            const parts = pitch.match(/([0-7x%])([',#b]*)([ac-zA-Z]*)/)
                            return {
                                ScaleDegree: parts[1],
                                PitchOperators: parts[2] === undefined ? '' : parts[2],
                                Chord: parts[3] === undefined ? '' : parts[3]
                            }
                        }),
                        PitchOperators: note[3] === undefined ? '' : note[3],
                        DurationOperators: note[4] === undefined ? '' : note[4],
                        VolumeOperators: note[6] === undefined ? '' : note[6],
                        Staccato: note[5] === undefined ? 0 : note[5].length
                    }
                }
            }
        }
    ],
    Func: [
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
        },
        {
            regex: /^{(\d+\*)?/,
            action: {
                token: 'subtrack',
                next: 'root',
                transform(subtrack, content) {
                    let repeat
                    if (subtrack[1] !== undefined) {
                        repeat = subtrack[1].slice(0, -1)
                    } else {
                        const pos = content.filter((e) => e.Type === 'BarLine' && e.Order[0] > 0)
                        if (pos.length > 0) {
                            repeat = Math.max(...pos.map((e) => Math.max(...e.Order)))
                        } else {
                            repeat = -1
                        }
                    }
                    return {
                        Type: 'Subtrack',
                        Repeat: repeat,
                        Content: content
                    }
                }
            }
        },
        {
            regex: /^"([^"]*)"/,
            action: {
                token: 'string',
                transform(str) {
                    return {
                        Type: 'String',
                        Content: str[1]
                    }
                }
            }
        },
        {
            regex: /^\[/,
            action: {
                token: 'array',
                next: 'Array',
                transform (_, content) {
                    return {
                        Type: 'Array',
                        Content: content
                    }
                }
            }
        },
        {
            regex: /^[^,)}[\]"]+/,
            action: {
                token: 'number',
                transform (num) {
                    return {
                        Type: 'Expression',
                        Content: num[0]
                    }
                }
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
            regex: /^{(\d+\*)?/,
            action: {
                token: 'subtrack',
                next: 'root',
                transform(subtrack, content) {
                    let repeat
                    if (subtrack[1] !== undefined) {
                        repeat = subtrack[1].slice(0, -1)
                    } else {
                        const pos = content.filter((e) => e.Type === 'BarLine' && e.Order[0] > 0)
                        if (pos.length > 0) {
                            repeat = Math.max(...pos.map((e) => Math.max(...e.Order)))
                        } else {
                            repeat = -1
                        }
                    }
                    return {
                        Type: 'Subtrack',
                        Repeat: repeat,
                        Content: content
                    }
                }
            }
        },
        {
            regex: /^"([^"]*)"/,
            action: {
                token: 'string',
                transform(str) {
                    return {
                        Type: 'String',
                        Content: str[1]
                    }
                }
            }
        },
        {
            regex: /^\[/,
            action: {
                token: 'array',
                next: 'Array',
                transform (_, content) {
                    return {
                        Type: 'Array',
                        Content: content
                    }
                }
            }
        },
        {
            regex: /^[^,)}[\]"]+/,
            action: {
                token: 'number',
                transform (num) {
                    return {
                        Type: 'Expression',
                        Content: num[0]
                    }
                }
            }
        }
    ]
}

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
        this.result = {
            Library: [],
            Sections: []
        }
    }

    tokenize() {
        this.processMacro()
        this.regularize()
        this.removeComment()
        this.extractHeader()
        this.split()
        for (const section of this.sections) {
            const sec = {
                Settings: [],
                Tracks: []
            }
            for (const track of section) {
                const tra = this.tokenizeTrack(track)
                if (this.isHeadTrack(tra)) {
                    sec.Settings.push(...tra)
                } else {
                    sec.Tracks.push(tra)
                }
            }
            this.result.Sections.push(sec)
        }
    }

    processMacro() {
        const macros = {
            Type: 'Track',
            Data: []
        }
        const keys = Object.keys(this.context.rawMacros)
        for (const key of keys) {
            macros.Data.push({
                Name: key,
                Content: this.tokenizeTrack(this.context.rawMacros[key])
            })
        }
        this.result.Library.push(macros)
    }

    isHeadTrack(track) {
        const heads = ['volta', 'rE', 'rB']
        const settings = ['ConOct', 'Vol', 'Spd', 'Key', 'Oct', 'KeyOct', 'Beat', 'Bar', 'BarBeat', 'Dur', 'Acct', 'Light', 'Seg', 'Port', 'Trace', 'FadeIn', 'FadeOut', 'Rev', 'Ferm', 'Stac']
        return track.every((element) => {
            return heads.includes(element.token) || (element.token === 'func' && settings.includes(element.match[1]))
        })
    }

    /**
     * 
     * @param {string} track 
     */
    tokenizeTrack(track) {
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
                    if (match[0] in element.action.cases) {
                        action = element.action.cases[match[0]]
                    } else {
                        action = element.action.cases['@default']
                    }
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
        return stateStore[0]
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
        this.content = this.content.replace(/([^]*)^#\s*End/m, (_, headers) => {

            return ''
        })
        /* this.content = this.content.replace(/^#\s*Include\s+"([^"]+)"/gm, (str, name) => {
            this.context.include.push(name)
            return ''
        }).replace(/#\s*Track([^]+?)(#\s*End|(?=#\s*(Track|Chord|Function)))/g, (str, macroAll) => {
            const macros = macroAll.match(/<\*\w+\*>[^]+?(?=<\*(\w+)\*>|$)/g)
            for (const macro of macros) {
                const [_, name, content] = macro.match(/<\*(\w+)\*>([^]+)/)
                this.context.rawMacros[name] = content
            }
            return ''
        }).replace(/#\s*Chord([^]+?)(#\s*End|(?=#\s*(Track|Chord|Function)))/g, (str, chordAll) => {
            const chordDef = {
                Type: 'Chord',
                Storage: 'Internal',
                Data: []
            }
            const chordDefs = chordAll.split(/\r?\n/)
            for (const c of chordDefs) {
                const res = c.match(/([A-Za-z])\t+([^\t]+)\t+([^\t]+)/)
                chordDef.Data.push({
                    Notation: res[1],
                    Comment: res[2],
                    Pitches: res[3]
                })
            }
        }, '') */
    }
}

module.exports = Tokenizer