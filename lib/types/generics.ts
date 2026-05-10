import type { TypedArray, ValueDeclarationType } from "./unions.ts";
import type { NativeArray, Struct, Union } from "../classes.ts";

type StructTypeofLookup<
    Declaration extends readonly {
        name: string;
        type: ValueDeclarationType;
    }[] = readonly [],
    Name extends string = string,
> = { [K in Declaration[number] as K["name"]]: K["type"] }[Name];

export type StructTypeof<
    Declaration extends readonly {
        name: string;
        type: ValueDeclarationType;
    }[] = readonly [],
    Name extends string = string,
> = StructTypeofLookup<Declaration, Name>;

type UnionTypeofLookup<
    Declaration extends { [name: string]: ValueDeclarationType } = {
        [name: string]: ValueDeclarationType;
    },
    Name extends string = string,
> = { [K in keyof Declaration]: Declaration[K] }[Name];

export type UnionTypeof<
    Declaration extends { [name: string]: ValueDeclarationType } = {
        [name: string]: ValueDeclarationType;
    },
    Name extends string | symbol | number = string,
> = Name extends infer SecondName extends string
    ? UnionTypeofLookup<Declaration, SecondName>
    : never;

export type UnpackedValue<Type extends ValueDeclarationType> = Type extends
    Struct<infer StructDeclaration> ? UnpackedStruct<StructDeclaration>
    : Type extends Union<infer UnionDeclaration>
        ? UnpackedUnion<UnionDeclaration>
    : Type extends NativeArray<infer NativeArrayDeclaration>
        ? UnpackedNativeArray<NativeArrayDeclaration>
    : Type extends "u8" | "i8" | "u16" | "i16" | "u32" | "i32" | "f32" | "f64"
        ? number
    : Type extends "u64" | "i64" | "isize" | "usize" ? bigint
    : Type extends "bool" ? boolean
    : Type extends "buffer" | "pointer" | "function"
        ? Deno.PointerValue | ArrayBufferLike | TypedArray | bigint | number
    : never;

export type StructSortedFields<
    Declaration extends readonly {
        name: string;
        type: ValueDeclarationType;
    }[] = readonly [],
> = {
    [K in keyof Declaration]: {
        offset: number;
        name: Declaration[K]["name"];
        type: Declaration[K]["type"];
    };
};

export type StructFields<
    Declaration extends readonly {
        name: string;
        type: ValueDeclarationType;
    }[] = readonly [],
> = {
    [K in Declaration[number] as K["name"]]: {
        offset: number;
        type: K["type"];
    };
};

export type UnionFields<
    Declaration extends { [name: string]: ValueDeclarationType } = {
        [name: string]: ValueDeclarationType;
    },
> = {
    [K in keyof Declaration]: Declaration[K];
};

export type UnpackedUnion<
    Declaration extends { [name: string]: ValueDeclarationType } = {
        [name: string]: ValueDeclarationType;
    },
> = {
    [K in keyof Declaration]?: UnpackedValue<Declaration[K]>;
};

export type UnpackedStruct<
    Declaration extends readonly {
        name: string;
        type: ValueDeclarationType;
    }[] = readonly [],
> = {
    [K in Declaration[number] as K["name"]]: UnpackedValue<K["type"]>;
};

export type UnpackedNativeArray<
    Declaration extends ValueDeclarationType = ValueDeclarationType,
> = UnpackedValue<Declaration>[];

export type ExtractDeclaration<Value extends Struct | Union | NativeArray> =
    Value extends Struct<infer Declaration> ? Declaration
        : Value extends Union<infer Declaration> ? Declaration
        : Value extends NativeArray<infer Declaration> ? Declaration
        : never;
