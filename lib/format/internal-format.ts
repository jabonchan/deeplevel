import type { ValueDeclarationType } from "../types/unions.ts";

import { NativeArray, Struct, Union } from "../classes.ts";
import { generateDescription } from "./generate-description.ts";
import { ANSIColors as C } from "./colors.ts";
import { generatePrefix } from "./generate-prefix.ts";
import { sizeof } from "../helpers/sizeof.ts";

export function internalFormat(
    type: ValueDeclarationType,
    opts: {
        name: string;
        ident: number;
        spaces: number;
        offset: number;
        colors: boolean;
    },
): string {
    const spaces = {
        initial: " ".repeat(opts.spaces * opts.ident++),
        secondary: " ".repeat(opts.spaces * opts.ident),
    }

    let formatted = spaces.initial + generatePrefix(opts.offset, sizeof(type));

    switch (true) {
        case typeof type === "string": {
            return `${formatted + C.Magenta} ${type} ${C.Yellow + opts.name}`;
        }

        case NativeArray.isNativeArray(type): {
            formatted += 
            formatted += generateDescription(type, spaces.secondary);
            break;
        }
    }

    return "";
}