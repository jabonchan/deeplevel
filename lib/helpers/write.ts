import type { TypedArray, ValueDeclarationType } from "../types/unions.ts";

import { Struct, Union } from "../classes.ts";
import { isArrayField } from "./checkers.ts";
import { Endianness } from "../types/enums.ts";
import { Platform } from "../constants.ts";
import { address } from "./memory.ts";
import { sizeof } from "./sizeof.ts";

export function write(
    type: ValueDeclarationType,
    value: unknown,
    buff: ArrayBuffer,
    offset: number,
    endianness: Endianness,
): void {
    const isLittleEndian = endianness === Endianness.Little;
    const view = new DataView(buff);

    if (isArrayField(type)) {
        const array = Array.from(value as ArrayLike<unknown>);
        const elementSize = sizeof(type.type);

        for (let i = 0; i < type.length; i++) {
            write(
                type.type,
                array[i],
                buff,
                offset + elementSize * i,
                endianness,
            );
        }

        return;
    }

    if (Struct.isStruct(type) || Union.isUnion(type)) {
        // @ts-ignore - Too lazy to fix this type problem
        type.pack(value, buff, offset);
        return;
    }

    switch (type) {
        case "bool":
            view.setUint8(offset, value as boolean ? 1 : 0);
            break;
        case "u8":
            view.setUint8(offset, value as number);
            break;
        case "i8":
            view.setInt8(offset, value as number);
            break;
        case "u16":
            view.setUint16(offset, value as number, isLittleEndian);
            break;
        case "i16":
            view.setInt16(offset, value as number, isLittleEndian);
            break;
        case "u32":
            view.setUint32(offset, value as number, isLittleEndian);
            break;
        case "i32":
            view.setInt32(offset, value as number, isLittleEndian);
            break;
        case "f32":
            view.setFloat32(offset, value as number, isLittleEndian);
            break;
        case "f64":
            view.setFloat64(offset, value as number, isLittleEndian);
            break;
        case "u64":
            view.setBigUint64(offset, value as bigint, isLittleEndian);
            break;
        case "i64":
            view.setBigInt64(offset, value as bigint, isLittleEndian);
            break;
        case "usize":
            if (Platform.is64Bit) {
                view.setBigUint64(offset, value as bigint, isLittleEndian);
                break;
            }

            view.setUint32(offset, Number(value as bigint), isLittleEndian);
            break;
        case "isize":
            if (Platform.is64Bit) {
                view.setBigInt64(offset, value as bigint, isLittleEndian);
                break;
            }

            view.setInt32(offset, Number(value as bigint), isLittleEndian);
            break;
        case "pointer":
        case "buffer":
        case "function": {
            let addr: bigint;

            if (typeof value === "number" || typeof value === "bigint") {
                addr = BigInt(value);
            } else {addr = address(
                    value as Deno.PointerValue | ArrayBuffer | TypedArray,
                );}

            if (Platform.is64Bit) {
                view.setBigUint64(offset, addr, isLittleEndian);
                break;
            }

            view.setUint32(offset, Number(addr), isLittleEndian);
            break;
        }
    }
}
