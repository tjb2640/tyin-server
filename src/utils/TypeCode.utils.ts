import { TypeCode } from "../models/TypeCode.model"

// TODO: convert into an actual mongo collection ASAP, preferably while providing defaults
// TODO: this needs to be using the actual mongoose schema stuff, not a map.
const CodeDB: Map<string, string[]> = new Map<string, string[]>()

export function typeCodeExists(index: string, code: string): boolean {
    return !!(CodeDB.has(index) && CodeDB.get(index)?.includes(code))
}

export function indexTypeCode(index: string, code: string) {
    if (!CodeDB.has(index)) {
        CodeDB.set(index, [])
    }
    if (!typeCodeExists(index, code)) {
        CodeDB.get(index)?.push(code)
    }
}

export function fetchTypeCode(index: string, code: string): TypeCode {
    indexTypeCode(index, code)
    // TODO: select the code from the database and return that instead.
    const C: TypeCode = {
        index: index.toLowerCase(),
        code: code.toLowerCase(),
        translation: `#typecode.${index}.${code}`.toLowerCase()
    } as TypeCode
    return C
}

export function populateTypeCode(originalCode: TypeCode | undefined, defaultCode: TypeCode) {
    if (originalCode == undefined) { return defaultCode }
    originalCode.code = originalCode.code == undefined ? defaultCode.code : originalCode.code
    originalCode.index = originalCode.index == undefined ? defaultCode.index : originalCode.index
    originalCode.translation = `#${originalCode.index}.${originalCode.code}`.toLowerCase()
    return originalCode
}
