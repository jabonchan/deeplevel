import * as deeplevel from "../mod.ts";
import * as test from "./lib/mod.ts";

const t = deeplevel.constants.DefaultPrimitiveTypes;
const h = deeplevel.helpers;

Deno.test("packed: basic struct no padding", () => {
    const S = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "a", type: t["signed char"] }, // 1
            { name: "b", type: t["int"] }, // 4
            { name: "c", type: t["signed char"] }, // 1
        ],
    });

    // Expected (no padding):
    // a: 0
    // b: 1
    // c: 5
    // size = 6, align = 1

    test.assert(h.offsetof(S, "a") === 0, "a offset");
    test.assert(h.offsetof(S, "b") === 1, "b offset");
    test.assert(h.offsetof(S, "c") === 5, "c offset");

    test.assert(h.sizeof(S) === 6, "size");
    test.assert(h.alignof(S) === 1, "align");
});

Deno.test("packed: double no alignment", () => {
    const S = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "b", type: t["double"] },
        ],
    });

    // a: 0
    // b: 1
    // size = 9

    test.assert(h.offsetof(S, "a") === 0, "a offset");
    test.assert(h.offsetof(S, "b") === 1, "b offset");

    test.assert(h.sizeof(S) === 9, "size");
    test.assert(h.alignof(S) === 1, "align");
});

Deno.test("packed: nested struct", () => {
    const Inner = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "x", type: t["int"] }, // 4
            { name: "y", type: t["signed char"] }, // 1
        ],
    });
    // size = 5

    const Outer = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "a", type: t["signed char"] }, // 1
            { name: "inner", type: Inner }, // 5
            { name: "b", type: t["int"] }, // 4
        ],
    });

    // a: 0
    // inner: 1
    // b: 6
    // size = 10

    test.assert(h.offsetof(Outer, "a") === 0, "a offset");
    test.assert(h.offsetof(Outer, "inner") === 1, "inner offset");
    test.assert(h.offsetof(Outer, "b") === 6, "b offset");

    test.assert(h.sizeof(Outer) === 10, "size");
    test.assert(h.alignof(Outer) === 1, "align");
});

Deno.test("packed: contains non-packed struct", () => {
    const Inner = new deeplevel.Struct({
        fields: [
            { name: "x", type: t["double"] }, // 8
            { name: "y", type: t["signed char"] }, // 1
        ],
    });
    // size = 16 (aligned)

    const Outer = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "inner", type: Inner },
        ],
    });

    // a: 0
    // inner: 1  (NO alignment despite inner needing 8)
    // size = 17

    test.assert(h.offsetof(Outer, "inner") === 1, "inner offset");
    test.assert(h.sizeof(Outer) === 17, "size");
    test.assert(h.alignof(Outer) === 1, "align");
});

Deno.test("packed: used inside normal struct", () => {
    const Packed = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "a", type: t["int"] },
            { name: "b", type: t["signed char"] },
        ],
    });
    // size = 5, align = 1

    const Outer = new deeplevel.Struct({
        fields: [
            { name: "x", type: t["signed char"] },
            { name: "p", type: Packed },
            { name: "y", type: t["int"] },
        ],
    });

    // x: 0
    // p: 1
    // y: 8  (aligned to 4)
    // size = 12

    test.assert(h.offsetof(Outer, "x") === 0, "x offset");
    test.assert(h.offsetof(Outer, "p") === 1, "p offset");
    test.assert(h.offsetof(Outer, "y") === 8, "y offset");

    test.assert(h.sizeof(Outer) === 12, "size");
    test.assert(h.alignof(Outer) === 4, "align");
});

Deno.test("packed: struct with union", () => {
    const U = new deeplevel.Union({
        a: t["int"], // 4
        b: t["double"], // 8
    });
    // size = 8, align = 8

    const S = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "x", type: t["signed char"] },
            { name: "u", type: U },
        ],
    });

    // x: 0
    // u: 1
    // size = 9

    test.assert(h.offsetof(S, "x") === 0, "x offset");
    test.assert(h.offsetof(S, "u") === 1, "u offset");

    test.assert(h.sizeof(S) === 9, "size");
    test.assert(h.alignof(S) === 1, "align");
});

Deno.test("packed: roundtrip values", () => {
    const S = new deeplevel.Struct({
        align: deeplevel.types.Alignment.Packed,
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "b", type: t["int"] },
            { name: "c", type: t["double"] },
        ],
    });

    const value = {
        a: 1,
        b: 123456,
        c: 3.14,
    };

    const buf = S.pack(value);
    const out = S.unpack(buf);

    test.objectEquals(value, out);
});
