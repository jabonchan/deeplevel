import type { ValueDeclarationType } from "../types/unions.ts";
import { internalFormat } from "./internal-format.ts";

export function format(
    type: ValueDeclarationType,
    opts: {
        name?: string;
        ident?: number;
        spaces?: number;
        offset?: number;
        colors?: boolean;
    } = {},
): string {
    const newOpts = {
        ident: 0,
        spaces: 4,
        offset: 0,
        colors: false,
        ...opts,
        name: opts.name ?? null,
    };

    const formatted = internalFormat(type, newOpts).trim();

    // deno-lint-ignore no-control-regex
    if (!opts.colors) return formatted.replace(/\x1b\[\d*m/g, "");

    return formatted;
}
