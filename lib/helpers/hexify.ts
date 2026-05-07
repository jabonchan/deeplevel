export function hexify(number: number, length = 2): string {
    return "0x" + number.toString(16).toUpperCase().padStart(length, "0");
}
