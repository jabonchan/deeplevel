import type { ValueDeclarationType } from "./types/unions.ts";
import type {
    StructFields,
    StructTypeof,
    UnionFields,
    UnionTypeof,
    UnpackedNativeArray,
    UnpackedStruct,
    UnpackedUnion,
} from "./types/generics.ts";

import { Alignment, Endianness } from "./types/enums.ts";
import { endianness } from "./helpers/endianness.ts";
import { alignof } from "./helpers/alignof.ts";
import { sizeof } from "./helpers/sizeof.ts";
import { format } from "./format/main.ts";
import { write } from "./helpers/write.ts";
import { read } from "./helpers/read.ts";

export class NativeArray<
    const Declaration extends ValueDeclarationType = ValueDeclarationType,
> {
    readonly isLittleEndian: boolean;
    readonly isBigEndian: boolean;
    readonly endianness: Endianness;

    readonly align: Alignment;
    readonly type: Declaration;

    readonly byteLength: number;
    readonly alignment: number;
    readonly padding: number;
    readonly length: number;
    readonly size: number;

    constructor(
        opts: {
            length: number;
            type: Declaration;

            endianness?: Endianness;
            align?: Alignment;
            size?: number;
        },
    ) {
        opts = { ...opts };

        opts.endianness ??= Endianness.System;
        opts.size = Math.max(opts.size ?? 1, 1);

        this.isLittleEndian = endianness(opts.endianness);
        this.isBigEndian = !this.isLittleEndian;
        this.endianness = this.isLittleEndian
            ? Endianness.Little
            : Endianness.Big;

        this.align = opts.align ?? Alignment.Natural;
        this.size = sizeof(opts.type) * opts.length;
        this.type = opts.type;

        this.alignment = alignof(this.type, this.align);
        this.byteLength = Math.max(this.size, opts.size);
        this.padding = this.byteLength - this.size;
        this.length = opts.length;
    }

    static isNativeArray(value: unknown): value is NativeArray {
        return !!(value && typeof value === "object" &&
            value instanceof NativeArray);
    }

    [Symbol.for("Deno.customInspect")](
        _: () => void,
        opts: Deno.InspectOptions,
    ): string {
        return format(this, { colors: opts.colors ? true : false });
    }

    toString(): string {
        return format(this, { colors: false });
    }

    offsetof(index: number): number {
        return sizeof(this.type) * index;
    }

    typeof(): Declaration {
        return this.type;
    }

    alignof(): number {
        return this.alignment;
    }

    pack(
        array: UnpackedNativeArray<Declaration>,
        buff: ArrayBuffer = new ArrayBuffer(this.byteLength),
        offset = 0,
    ): ArrayBuffer {
        for (let i = 0; i < this.length; i++) {
            const value = array[i];
            const index = this.offsetof(i);

            write(this.type, value, buff, index + offset, this.endianness);
        }

        return buff;
    }

    unpack(buff: ArrayBuffer, offset = 0): UnpackedNativeArray<Declaration> {
        const array: UnpackedNativeArray<Declaration> = [];

        for (let i = 0; i < this.length; i++) {
            const index = this.offsetof(i);
            const value = read(
                this.type,
                buff,
                index + offset,
                this.endianness,
            );

            // @ts-ignore - Yeah this works on runtime properly.
            array.push(value);
        }

        return array;
    }
}

export class Struct<
    const Declaration extends readonly {
        name: string;
        type: ValueDeclarationType;
    }[] = readonly [],
> {
    readonly isLittleEndian: boolean;
    readonly isBigEndian: boolean;
    readonly endianness: Endianness;

    readonly fields: StructFields<Declaration>;
    readonly align: Alignment;

    readonly byteLength: number;
    readonly alignment: number;
    readonly padding: number;
    readonly size: number;

    constructor(
        opts: {
            endianness?: Endianness;
            fields: Declaration;
            size?: number;
            align?: Alignment;
        },
    ) {
        opts = { ...opts };

        opts.endianness ??= Endianness.System;
        opts.size = Math.max(opts.size ?? 1, 1);

        this.isLittleEndian = endianness(opts.endianness);
        this.isBigEndian = !this.isLittleEndian;
        this.endianness = this.isLittleEndian
            ? Endianness.Little
            : Endianness.Big;
        this.alignment = 1;

        this.fields = {} as StructFields<Declaration>;
        this.align = opts.align ?? Alignment.Natural;
        this.size = 0;

        let offset = 0;

        for (const field of opts.fields) {
            const fieldAlignment = alignof(field.type, this.align);
            const fieldSize = sizeof(field.type);
            const fieldName = field.name;

            if (fieldAlignment > this.alignment) {
                this.alignment = fieldAlignment;
            }

            offset = this.align === Alignment.Natural
                ? Math.ceil(offset / fieldAlignment) * fieldAlignment
                : offset;

            this.fields[fieldName as keyof StructFields<Declaration>] = {
                offset,
                type: field.type,
            } as StructFields<Declaration>[string];

            offset += fieldSize;
        }

        const alignedOffset = Math.ceil(offset / this.alignment) *
            this.alignment;

        this.size = offset;
        this.byteLength = Math.max(opts.size, alignedOffset);
        this.padding = this.byteLength - this.size;
    }

    static isStruct(value: unknown): value is Struct {
        return !!(value && typeof value === "object" &&
            value instanceof Struct);
    }

    [Symbol.for("Deno.customInspect")](
        _: () => void,
        opts: Deno.InspectOptions,
    ): string {
        return format(this, { colors: opts.colors ? true : false });
    }

    toString(): string {
        return format(this, { colors: false });
    }

    offsetof<Name extends Declaration[number]["name"]>(name: Name): number {
        for (const [fieldName, field] of Object.entries(this.fields)) {
            const declaration = field as {
                offset: number;
                type: ValueDeclarationType;
            };

            if (fieldName !== name) continue;
            return declaration.offset;
        }

        return -1;
    }

    typeof<Name extends Declaration[number]["name"]>(
        name: Name,
    ): StructTypeof<Declaration, Name> {
        for (const [fieldName, field] of Object.entries(this.fields)) {
            const declaration = field as {
                offset: number;
                type: ValueDeclarationType;
            };

            if (fieldName !== name) continue;

            // @ts-ignore - Too lazy to make this work
            return declaration.type;
        }

        throw new ReferenceError(
            `Property "${name}" doesn't exists on the specified struct`,
        );
    }

    alignof<Name extends Declaration[number]["name"]>(name: Name): number {
        // @ts-ignore - Ugh why this doesn't works
        return alignof(this.typeof(name), this.align);
    }

    sizeof<Name extends Declaration[number]["name"]>(name: Name): number {
        // @ts-ignore - Ugh why this doesn't works
        return sizeof(this.typeof(name));
    }

    pack(
        object: UnpackedStruct<Declaration>,
        buff: ArrayBuffer = new ArrayBuffer(this.byteLength),
        offset = 0,
    ): ArrayBuffer {
        for (const [name, field] of Object.entries(this.fields)) {
            const declaration = field as {
                offset: number;
                type: ValueDeclarationType;
            };
            const value = object[name as keyof typeof object];

            write(
                declaration.type,
                value,
                buff,
                offset + declaration.offset,
                this.endianness,
            );
        }

        return buff;
    }

    unpack(buff: ArrayBuffer, offset = 0): UnpackedStruct<Declaration> {
        const object = {} as UnpackedStruct<Declaration>;

        for (const [name, field] of Object.entries(this.fields)) {
            const declaration = field as {
                offset: number;
                type: ValueDeclarationType;
            };

            object[name as keyof typeof object] = read(
                declaration.type,
                buff,
                offset + declaration.offset,
                this.endianness,
            ) as never;
        }

        return object;
    }
}

export class Union<
    const Declaration extends { [name: string]: ValueDeclarationType } = {
        [name: string]: ValueDeclarationType;
    },
> {
    readonly isLittleEndian: boolean;
    readonly isBigEndian: boolean;
    readonly endianness: Endianness;
    readonly alignment: number;

    readonly fields: UnionFields<Declaration>;
    readonly align: Alignment;

    readonly byteLength: number;
    readonly padding: number;
    readonly size: number;

    constructor(
        values: Declaration,
        opts: { size?: number; endianness?: Endianness; align?: Alignment } =
            {},
    ) {
        opts = { ...opts };

        opts.endianness ??= Endianness.System;
        opts.size = Math.max(opts.size ?? 1, 1);

        this.isLittleEndian = endianness(opts.endianness);
        this.isBigEndian = !this.isLittleEndian;
        this.endianness = this.isLittleEndian
            ? Endianness.Little
            : Endianness.Big;

        this.align = opts.align ?? Alignment.Natural;
        this.alignment = 1;

        this.fields = {} as UnionFields<Declaration>;
        this.size = 0;

        for (const declaration of Object.values(values)) {
            this.alignment = Math.max(
                this.alignment,
                alignof(declaration, opts.align!),
            );
            this.size = Math.max(this.size, sizeof(declaration));
            continue;
        }

        const alignedOffset = Math.ceil(this.size / this.alignment) *
            this.alignment;
        this.byteLength = Math.max(opts.size, alignedOffset);
        this.padding = this.byteLength - this.size;

        for (const [name, declaration] of Object.entries(values)) {
            if (declaration instanceof Union) {
                const union = new Union(declaration.fields, {
                    size: this.byteLength,
                });
                this.fields[name as keyof UnionFields<Declaration>] =
                    union as unknown as UnionFields<Declaration>[string];

                continue;
            }

            if (declaration instanceof Struct) {
                let fields = [] as {
                    name: string;
                    type: ValueDeclarationType;
                    offset: number;
                }[];

                for (
                    const [name, field] of Object.entries(declaration.fields)
                ) {
                    const { type, offset } = field as unknown as {
                        offset: number;
                        type: ValueDeclarationType;
                    };
                    fields.push({ name, type: type, offset });
                }

                fields = fields.sort((a, b) => {
                    return a.offset - b.offset;
                });

                const struct = new Struct({
                    fields,
                    endianness: declaration.endianness,
                    size: this.byteLength,
                    align: declaration.align,
                });
                this.fields[name as keyof UnionFields<Declaration>] =
                    struct as unknown as UnionFields<Declaration>[string];

                continue;
            }

            this.fields[name as keyof UnionFields<Declaration>] =
                declaration as UnionFields<Declaration>[string];
        }
    }

    static isUnion(value: unknown): value is Union {
        return !!(value && typeof value === "object" && value instanceof Union);
    }

    [Symbol.for("Deno.customInspect")](
        _: () => void,
        opts: Deno.InspectOptions,
    ): string {
        return format(this, { colors: opts.colors ? true : false });
    }

    toString(): string {
        return format(this, { colors: false });
    }

    typeof<Name extends keyof Declaration>(
        name: Name,
    ): UnionTypeof<Declaration, Name> {
        for (const [fieldName, fieldType] of Object.entries(this.fields)) {
            const type = fieldType as ValueDeclarationType;

            if (fieldName !== name) continue;

            // @ts-ignore - Too lazy to make this work
            return type;
        }

        throw new ReferenceError(
            `Property "${name as string}" doesn't exists on the specified union`,
        );
    }

    alignof<Name extends keyof Declaration>(name: Name): number {
        // @ts-ignore - Ugh why this doesn't works
        return alignof(this.typeof(name), this.align);
    }

    sizeof<Name extends keyof Declaration>(name: Name): number {
        // @ts-ignore - Ugh why this doesn't works
        return sizeof(this.typeof(name));
    }

    pack(
        object: UnpackedUnion<Declaration>,
        buff: ArrayBuffer = new ArrayBuffer(this.byteLength),
        offset = 0,
    ): ArrayBuffer {
        const values = object as Record<string, unknown>;

        for (const [name, declaration] of Object.entries(this.fields)) {
            if (!(name in values)) continue;

            write(
                declaration as ValueDeclarationType,
                values[name],
                buff,
                offset,
                this.endianness,
            );
        }

        return buff;
    }

    unpack(buff: ArrayBuffer, offset = 0): UnpackedUnion<Declaration> {
        const object = {} as UnpackedUnion<Declaration>;

        for (const [name, declaration] of Object.entries(this.fields)) {
            object[name as keyof typeof object] = read(
                declaration as ValueDeclarationType,
                buff,
                offset,
                this.endianness,
            ) as never;
        }

        return object;
    }
}
