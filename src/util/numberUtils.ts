
export function formatInteger(integer: number): string {
    const reversedDigits = integer.toString().split("").reverse();
    const reversedResult: string[] = [];
    for (let i = 0; i < reversedDigits.length; i++) {
        if (i > 0 && i % 3 === 0) {
            reversedResult.push(",");
        }
        reversedResult.push(reversedDigits[i]);
    }
    return reversedResult.reverse().join("");
}
