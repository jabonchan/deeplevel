import type { TypedArray, ValueDeclarationType } from "../types/unions.ts";
import { sizeof } from "./sizeof.ts";

export function address(
    ptr: Deno.PointerValue | TypedArray | ArrayBuffer,
): bigint {
    if (!ptr) return 0n;

    if (ptr instanceof ArrayBuffer) return address(Deno.UnsafePointer.of(ptr));

    if ("buffer" in ptr) {
        if (ptr.buffer instanceof SharedArrayBuffer) return 0n;
        return address(Deno.UnsafePointer.of(ptr.buffer));
    }

    return Deno.UnsafePointer.value(ptr);
}

export function create(addr: number | bigint): Deno.PointerValue {
    try {
        return Deno.UnsafePointer.create(BigInt(addr));
    } catch {
        return null;
    }
}

export function offsetAddr(
    ptr: Deno.PointerValue,
    offset: number | bigint,
): Deno.PointerValue {
    offset = BigInt(offset);

    try {
        return Deno.UnsafePointer.create(address(ptr) + offset);
    } catch {
        return null;
    }
}

export function malloc(size: number): Deno.PointerValue {
    return Deno.UnsafePointer.of(new ArrayBuffer(size));
}

export function calloc(
    type: ValueDeclarationType,
    count: number,
): Deno.PointerValue {
    return malloc(sizeof(type) * count);
}

export function memset(
    dest: Deno.PointerValue,
    byte: number,
    size: number,
): Deno.PointerValue {
    if (!dest) return dest;

    new Uint8Array(Deno.UnsafePointerView.getArrayBuffer(dest, size)).fill(
        Math.min(Math.max(byte, 0), 0xFF),
    );

    return dest;
}

export function ZeroMemory(
    dest: Deno.PointerValue,
    size: number,
): Deno.PointerValue {
    return memset(dest, 0, size);
}
