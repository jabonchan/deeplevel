import type { ValueDeclarationType } from "../types/unions.ts";

import { NativeArray, Struct, Union } from "../classes.ts";
import { generateDescription } from "./generate-description.ts";
import { ANSIColors as C } from "./colors.ts";
import { generatePrefix } from "./generate-prefix.ts";
import { sizeof } from "../helpers/sizeof.ts";

export function internalFormat(
    type: ValueDeclarationType,
    opts: {
        name: string | null;
        ident: number;
        spaces: number;
        offset: number;
    },
): string {
    const spaces = {
        initial: " ".repeat(opts.spaces * opts.ident++),
        secondary: " ".repeat(opts.spaces * opts.ident),
    };

    let formatted = `${
        spaces.initial + generatePrefix(opts.offset, sizeof(type))
    } `;

    switch (true) {
        case typeof type === "string": {
            return formatted += `${C.Magenta + type}${
                C.Yellow + (opts.name ? ` ${opts.name}` : "")
            }`;
        }

        case NativeArray.isNativeArray(type): {
            formatted +=
                `${C.Magenta}array${C.BrightBlack}[${C.BrightYellow}${type.length}${C.BrightBlack}]: {`;
            formatted += generateDescription(type, spaces.secondary);
            formatted += `\n\n${internalFormat(type.typeof(), opts)}`;
            break;
        }

        case Struct.isStruct(type): {
            formatted += `${C.Magenta}structure${
                C.Yellow + (opts.name ? ` ${opts.name}` : "")
            } ${C.BrightBlack}{`;
            formatted += generateDescription(type, spaces.secondary);

            const entries = Object.entries(type.fields).sort((a, b) => {
                const fieldA = a[1] as {
                    offset: number;
                    type: ValueDeclarationType;
                };
                const fieldB = b[1] as {
                    offset: number;
                    type: ValueDeclarationType;
                };

                return fieldA.offset - fieldB.offset;
            }) as [string, {
                offset: number;
                type: ValueDeclarationType;
            }][];

            if (entries.length) formatted += "\n";

            for (const [name, field] of entries) {
                formatted += `\n${
                    internalFormat(field.type, {
                        ...opts,
                        offset: opts.offset + field.offset,
                        name,
                    })
                }`;
            }

            break;
        }

        case Union.isUnion(type): {
            formatted += `${C.Magenta}union${
                C.Yellow + (opts.name ? ` ${opts.name}` : "")
            } ${C.BrightBlack}{`;
            formatted += generateDescription(type, spaces.secondary);

            const entries = Object.entries(type.fields) as [
                string,
                ValueDeclarationType,
            ][];

            if (entries.length) formatted += "\n";

            for (const [name, type] of entries) {
                formatted += `\n${
                    internalFormat(type, {
                        ...opts,
                        offset: opts.offset,
                        name,
                    })
                }`;
            }

            break;
        }
    }

    return formatted + `\n${spaces.initial}${C.BrightBlack}}\n`;
}
