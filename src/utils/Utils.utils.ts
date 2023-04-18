export function optional(...options: any[]): any | undefined {
    for (let i = 0; i < options.length; i++) {
        if (options[i] != undefined) {
            return options[i]
        }
    }
    return undefined
}