import { NativeArray, Struct, Union } from "../classes.ts";

import { Alignment, Endianness } from "../types/enums.ts";
import { ANSIColors as C } from "./colors.ts";
import { hexify } from "../helpers/hexify.ts";

export function generateDescription(
    type: Struct | Union | NativeArray,
    tab: string,
): string {
    let formatted = "";

    formatted += `\n${tab}${C.BrightBlack}Endianness: ${C.Yellow}${
        type.endianness === Endianness.Little ? "Little" : "Big"
    }`;

    formatted += `\n${tab}${C.BrightBlack}Alignment: ${C.Yellow}${
        hexify(type.alignment)
    }:${type.alignment} ${
        type.align === Alignment.Natural ? "Natural" : "Packed"
    }`;

    formatted += `\n${tab}${C.BrightBlack}Padding: ${C.Yellow}${
        hexify(type.padding)
    }:${type.padding}`;

    formatted += `\n${tab}${C.BrightBlack}Total Size: ${C.Yellow}${
        hexify(type.byteLength)
    }:${type.byteLength}`;

    formatted += `\n${tab}${C.BrightBlack}Size: ${C.Yellow}${
        hexify(type.size)
    }:${type.size}`;

    if (NativeArray.isNativeArray(type)) {
        formatted += `\n${tab}${C.BrightBlack}Array Length: ${C.Yellow}${
            hexify(type.length)
        }:${type.length}`;
    }

    return formatted;
}
