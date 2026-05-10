import type { ValueDeclarationType } from "../types/unions.ts";

import * as constants from "../constants.ts";

export function sizeof(
    type: ValueDeclarationType | "wchar" | "char" | "void",
): number {
    switch (typeof type) {
        case "string": {
            switch (type) {
                case "void":
                    return 0;
                case "wchar":
                    return constants.PrimitiveText.DefaultWideCharSize;
                case "i8":
                case "u8":
                case "bool":
                case "char":
                    return 1;
                case "i16":
                case "u16":
                    return 2;
                case "i32":
                case "u32":
                case "f32":
                    return 4;
                case "i64":
                case "u64":
                case "f64":
                    return 8;
                case "isize":
                case "usize":
                case "buffer":
                case "pointer":
                case "function":
                    return constants.SystemPointerSize;
            }

            break;
        }

        default:
            return type.byteLength;
    }
}
