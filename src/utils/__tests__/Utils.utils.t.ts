import { optional } from "../Utils.utils"

describe('Utils.utils.ts', () => {
    test('The "optional" function\'s behavior', () => {
        expect(optional(undefined, 2, 3)).toBe(2)
        expect(optional(undefined, null, 3)).toBe(3)
        expect(optional(1, 2, 3)).toBe(1)
        expect(optional(1, null, 3)).toBe(1)
        expect(optional(null, null)).toBeUndefined()
        expect(optional()).toBeUndefined()
    })
})