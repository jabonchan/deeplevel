import { ANSIColors as C } from "./colors.ts";
import { hexify } from "../helpers/hexify.ts";

export function generatePrefix(offset: number, size: number): string {
    return `${C.Reset}${C.BrightBlack}(${C.White}Offset:${C.Yellow}${
        hexify(offset)
    }:${offset} ${C.White}Size:${C.Yellow}${
        hexify(size)
    }:${size}${C.BrightBlack})`;
}
