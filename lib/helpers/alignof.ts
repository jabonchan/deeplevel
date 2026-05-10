import type { ValueDeclarationType } from "../types/unions.ts";

import { Alignment } from "../types/enums.ts";
import { sizeof } from "./sizeof.ts";

export function alignof(
    type: ValueDeclarationType,
    align: Alignment = Alignment.Natural,
): number {
    if (align === Alignment.Packed) return 1;

    const size = sizeof(type);

    switch (typeof type) {
        case "string":
            return size;
        case "object":
            return type.alignment;
    }
}
