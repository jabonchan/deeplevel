import { SystemEndianness } from "../constants.ts";
import { Endianness } from "../types/enums.ts";

export function endianness(endianness: Endianness): boolean {
    if (endianness === Endianness.System) endianness = SystemEndianness;
    return endianness === Endianness.Little;
}
