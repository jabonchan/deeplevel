import type { ValueDeclarationType } from "../types/unions.ts";
import type { Struct } from "../classes.ts";

export function offsetof<
    const Declaration extends readonly {
        name: string;
        type: ValueDeclarationType;
    }[] = readonly [],
>(struct: Struct<Declaration>, name: Declaration[number]["name"]): number {
    return struct.offsetof(name);
}
