import type { NativeArray, Struct, Union } from "../classes.ts";

import { Alignment, Endianness } from "../types/enums.ts";
import { ANSIColors as C } from "./colors.ts";
import { hexify } from "../helpers/hexify.ts";

export function generateDescription(
    value: Struct | Union | NativeArray,
    tab: string,
): string {
    let formatted = "";

    formatted += `\n${tab}${C.BrightBlack}Endianness: ${C.Yellow}${
        value.endianness === Endianness.Little ? "Little" : "Big"
    }`;

    formatted += `\n${tab}${C.BrightBlack}Alignment: ${C.Yellow}${
        hexify(value.alignment)
    }:${value.alignment} ${
        value.align === Alignment.Natural ? "Natural" : "Packed"
    }`;

    formatted += `\n${tab}${C.BrightBlack}Padding: ${C.Yellow}${
        hexify(value.padding)
    }:${value.padding}`;

    formatted += `\n${tab}${C.BrightBlack}Total Size: ${C.Yellow}${
        hexify(value.byteLength)
    }:${value.byteLength}`;

    formatted += `\n${tab}${C.BrightBlack}Size: ${C.Yellow}${
        hexify(value.size)
    }:${value.size}`;

    return formatted;
}