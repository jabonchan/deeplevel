import type { Alignment, Endianness } from "../types/enums.ts";
import type { ValueDeclarationType } from "../types/unions.ts";
import { Union } from "../classes.ts";

export function createArray<
    const Declaration extends ValueDeclarationType = ValueDeclarationType,
>(
    type: Declaration,
    length: number,
    opts: { size?: number; endianness?: Endianness; align?: Alignment } = {},
): Union<{
    readonly "[ARRAY_ITEMS]": {
        readonly length: number;
        readonly type: Declaration;
    };
}> {
    return new Union({
        "[ARRAY_ITEMS]": { length, type },
    }, opts);
}
