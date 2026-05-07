import type { ValueDeclarationType } from "../types/unions.ts";

export function isArrayField(
    type: unknown,
): type is { readonly length: number; readonly type: ValueDeclarationType } {
    return type !== null && typeof type === "object" && "length" in type &&
        "type" in type;
}
