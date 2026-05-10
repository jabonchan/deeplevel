export function equalsPointer(a: unknown, b: unknown) {
    if (!a || !b) return false;

    try {
        // @ts-ignore - TS is right but it works in runtime too
        if (Deno.UnsafePointer.value(a) === Deno.UnsafePointer.value(b)) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export function isPointer(a: unknown) {
    if (!a) return false;

    try {
        // @ts-ignore - TS is right but it works in runtime too
        Deno.UnsafePointer.value(a);
        return true;
    } catch {
        false;
    }
}
