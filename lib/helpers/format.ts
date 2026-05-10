import type { ValueDeclarationType } from "../types/unions.ts";

import { Alignment, Endianness } from "../types/enums.ts";
import { Struct, Union } from "../classes.ts";
import { isArrayField } from "./checkers.ts";
import { hexify } from "./hexify.ts";
import { sizeof } from "./sizeof.ts";

function generatePrefix(offset: number, size: number): string {
    return `\x1b[90m(\x1b[37mOffset:\x1b[33m${
        hexify(offset)
    }:${offset} \x1b[37mSize:\x1b[33m${hexify(size)}:${size}\x1b[90m)`;
}

function generateDescription(value: Struct | Union, tab: string): string {
    let formatted = "";

    formatted += `\n${tab}\x1b[90mEndianness: \x1b[33m${
        value.endianness === Endianness.Little ? "Little" : "Big"
    }`;
    formatted += `\n${tab}\x1b[90mAlignment: \x1b[33m${
        hexify(value.alignment)
    }:${value.alignment} ${
        value.align === Alignment.Natural ? "Natural" : "Packed"
    }`;
    formatted += `\n${tab}\x1b[90mPadding: \x1b[33m${
        hexify(value.padding)
    }:${value.padding}`;
    formatted += `\n${tab}\x1b[90mTotal Size: \x1b[33m${
        hexify(value.byteLength)
    }:${value.byteLength}`;
    formatted += `\n${tab}\x1b[90mSize: \x1b[33m${
        hexify(value.size)
    }:${value.size}`;

    return formatted;
}

export function format(
    value: Struct | Union,
    opts: {
        name?: string;
        ident?: number;
        spaces?: number;
        offset?: number;
        colors?: boolean;
    } = {},
): string {
    const newOpts = {
        name: "unnamed",
        ident: 0,
        spaces: 4,
        offset: 0,
        colors: false,
        ...opts,
    };
    const prefix = " ".repeat(newOpts.spaces * newOpts.ident++);
    const tab = " ".repeat(newOpts.spaces * newOpts.ident);

    let formatted = "";

    if (Struct.isStruct(value)) {
        formatted += prefix;
        formatted += generatePrefix(newOpts.offset, value.size);
        formatted += ` \x1b[35mstructure \x1b[33m${newOpts.name} \x1b[90m{`;
        formatted += generateDescription(value, tab);

        const entries = Object.entries(value.fields).sort((a, b) => {
            const fieldA = a[1] as unknown as {
                offset: number;
                type: ValueDeclarationType;
            };
            const fieldB = b[1] as unknown as {
                offset: number;
                type: ValueDeclarationType;
            };

            return fieldA.offset - fieldB.offset;
        });

        if (entries.length) {
            formatted += "\n";

            for (const [name, field] of entries) {
                const { offset, type } = field as unknown as {
                    offset: number;
                    type: ValueDeclarationType;
                };

                if (Struct.isStruct(type) || Union.isUnion(type)) {
                    formatted += "\n" +
                        format(type, {
                            ...newOpts,
                            name,
                            offset: newOpts.offset + offset,
                        });
                    continue;
                }

                if (isArrayField(type)) {
                    if (
                        Struct.isStruct(type.type) || Union.isUnion(type.type)
                    ) {
                        formatted += `\n${
                            format(type.type, {
                                ...newOpts,
                                name,
                                offset: newOpts.offset + offset,
                            })
                        }\x1b[35m[\x1b[33m${type.length}\x1b[35m] \x1b[33m${name}\x1b[0m`;
                        continue;
                    }

                    formatted += `\n${tab}${
                        generatePrefix(newOpts.offset + offset, sizeof(type))
                    } \x1b[35marray[\x1b[33m${type.length}\x1b[35m] \x1b[33m${name}\x1b[0m`;
                    continue;
                }

                formatted += `\n${tab}${
                    generatePrefix(newOpts.offset + offset, sizeof(type))
                } \x1b[35m${type} \x1b[33m${name}\x1b[0m`;
            }
        }

        formatted = formatted + `\n${prefix}\x1b[90m}\x1b[0m`;
        // deno-lint-ignore no-control-regex
        if (!opts.colors) return formatted.replace(/\x1b\[\d*m/g, "");
        return formatted;
    }

    value = value as Union;

    formatted += prefix;
    formatted += generatePrefix(newOpts.offset, value.size);
    formatted += ` \x1b[35munion \x1b[33m${newOpts.name} \x1b[90m{`;
    formatted += generateDescription(value, tab);

    const entries = Object.entries(value.fields);

    if (entries.length) {
        formatted += "\n";

        for (const [name, type] of entries) {
            if (Struct.isStruct(type) || Union.isUnion(type)) {
                formatted += "\n" + format(type, { ...newOpts, name });
                continue;
            }

            if (isArrayField(type)) {
                if (Struct.isStruct(type.type) || Union.isUnion(type.type)) {
                    formatted += `\n${
                        format(type.type, {
                            ...newOpts,
                            name,
                            offset: newOpts.offset,
                        })
                    }\x1b[35m[\x1b[33m${type.length}\x1b[35m] \x1b[33m${name}\x1b[0m`;
                    continue;
                }

                formatted += `\n${tab}${
                    generatePrefix(newOpts.offset, sizeof(type))
                } \x1b[35m${type.type}[\x1b[33m${type.length}\x1b[35m] \x1b[33m${name}\x1b[0m`;
                continue;
            }

            formatted += `\n${tab}${
                generatePrefix(newOpts.offset, sizeof(type))
            } \x1b[35m${type} \x1b[33m${name}\x1b[0m`;
        }
    }

    formatted = formatted + `\n${prefix}\x1b[90m}\x1b[0m`;
    // deno-lint-ignore no-control-regex
    if (!opts.colors) return formatted.replace(/\x1b\[\d*m/g, "");
    return formatted;
}
