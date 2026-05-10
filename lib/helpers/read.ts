import type { ValueDeclarationType } from "../types/unions.ts";

import { NativeArray, Struct, Union } from "../classes.ts";
import { Endianness } from "../types/enums.ts";
import { Platform } from "../constants.ts";
import { create } from "./mod.ts";

export function read(
    type: ValueDeclarationType,
    buff: ArrayBuffer,
    offset: number,
    endianness: Endianness,
): unknown {
    const isLittleEndian = endianness === Endianness.Little;
    const view = new DataView(buff);

    if (
        Struct.isStruct(type) || Union.isUnion(type) ||
        NativeArray.isNativeArray(type)
    ) {
        return (type as { unpack(buff: ArrayBuffer, offset: number): unknown })
            .unpack(buff, offset);
    }

    switch (type) {
        case "bool":
            return !!view.getUint8(offset);
        case "u8":
            return view.getUint8(offset);
        case "i8":
            return view.getInt8(offset);
        case "u16":
            return view.getUint16(offset, isLittleEndian);
        case "i16":
            return view.getInt16(offset, isLittleEndian);
        case "u32":
            return view.getUint32(offset, isLittleEndian);
        case "i32":
            return view.getInt32(offset, isLittleEndian);
        case "f32":
            return view.getFloat32(offset, isLittleEndian);
        case "f64":
            return view.getFloat64(offset, isLittleEndian);
        case "u64":
            return view.getBigUint64(offset, isLittleEndian);
        case "i64":
            return view.getBigInt64(offset, isLittleEndian);
        case "usize":
            return Platform.is64Bit
                ? view.getBigUint64(offset, isLittleEndian)
                : BigInt(view.getUint32(offset, isLittleEndian));
        case "isize":
            return Platform.is64Bit
                ? view.getBigInt64(offset, isLittleEndian)
                : BigInt(view.getInt32(offset, isLittleEndian));
        case "pointer":
        case "buffer":
        case "function": {
            const addr = Platform.is64Bit
                ? view.getBigUint64(offset, isLittleEndian)
                : BigInt(view.getUint32(offset, isLittleEndian));

            return create(addr);
        }
    }
}
