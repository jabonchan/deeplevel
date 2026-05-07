import type { Struct, Union } from "../classes.ts";

export type TypedArray =
    | Uint8Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | BigUint64Array
    | BigInt64Array
    | Float16Array
    | Float32Array
    | Float64Array;

export type PrimitiveDeclarationType = Exclude<
    Deno.NativeType,
    Deno.NativeStructType
>;

export type ValueDeclarationType =
    | PrimitiveDeclarationType
    | Union
    | Struct
    | {
        readonly length: number;
        readonly type: ValueDeclarationType;
    };
