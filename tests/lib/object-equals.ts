import type { Indexable, RegularObject } from "./types.ts";
import * as deeplevel from "../../mod.ts";

function isObject(value: unknown): value is Indexable {
    return typeof value === "object" && value !== null;
}

function getEntries(obj: Indexable): [PropertyKey, unknown][] {
    const entries: [PropertyKey, unknown][] = [];

    for (const key of Object.keys(obj)) {
        entries.push([key, obj[key]]);
    }

    for (const sym of Object.getOwnPropertySymbols(obj)) {
        entries.push([sym, obj[sym]]);
    }

    return entries;
}

function objectEqualsInternal(
    source: RegularObject | null,
    object: unknown,
    partial: boolean,
): true {
    const errorMessage = partial
        ? `❌ Objects dont equal (partial). Expected ${
            Deno.inspect(source, { colors: true })
        } and got ${Deno.inspect(object, { colors: true })}`
        : `❌ Objects dont equal. Expected ${
            Deno.inspect(source, { colors: true })
        } and got ${Deno.inspect(object, { colors: true })}`;

    const message = partial
        ? `✅ Objects equal (partial); ${
            Deno.inspect(source, { colors: true })
        }`
        : `✅ Objects equal; ${Deno.inspect(source, { colors: true })}`;

    if (typeof source !== typeof object) {
        throw new Error(errorMessage);
    }

    if (!isObject(source) || !isObject(object)) {
        if (source !== object) throw new Error(errorMessage);

        console.log(message);
        return true;
    }

    const obj = object as Indexable;
    const src = source as Indexable;

    if (!partial) {
        const lengthA = getEntries(src).length;
        const lengthB = getEntries(obj).length;

        if (lengthA !== lengthB) throw new Error(errorMessage);
    }

    for (const [property, value] of getEntries(src)) {
        if (!(property in obj)) {
            throw new Error(errorMessage);
        }

        const otherValue = obj[property];

        if (!isObject(value)) {
            if (value === otherValue) continue;
            throw new Error(errorMessage);
        }

        if (
            deeplevel.helpers.isPointer(value) ||
            deeplevel.helpers.isPointer(otherValue)
        ) {
            if (!deeplevel.helpers.equalsPointer(value, otherValue)) {
                throw new Error(
                    errorMessage + " (Pointers addresses don't match)",
                );
            }
            continue;
        }

        objectEqualsInternal(
            value as RegularObject,
            otherValue,
            partial,
        );
    }

    console.log(message);
    return true;
}

export function objectEquals(
    source: RegularObject | null,
    object: unknown,
) {
    return objectEqualsInternal(source, object, false);
}

export function objectEqualsOptionalProperties(
    source: RegularObject | null,
    object: unknown,
) {
    return objectEqualsInternal(source, object, true);
}
