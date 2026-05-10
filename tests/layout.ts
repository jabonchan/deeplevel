import * as deeplevel from "../mod.ts";
import * as test from "./lib/mod.ts";

const t = deeplevel.constants.DefaultPrimitiveTypes;
const h = deeplevel.helpers;

Deno.test("ABI: 64-bit alignment jump", () => {
    const S = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "b", type: t["double"] },
            { name: "c", type: t["signed char"] },
        ],
    });

    test.assert(h.offsetof(S, "a") === 0, "a offset");
    test.assert(h.offsetof(S, "b") === 8, "b offset");
    test.assert(h.offsetof(S, "c") === 16, "c offset");

    test.assert(h.alignof(S) === 8, "S alignment");
    test.assert(h.sizeof(S) === 24, "S size");
});

Deno.test("ABI: nested struct", () => {
    const Inner = new deeplevel.Struct({
        fields: [
            { name: "x", type: t["double"] },
            { name: "y", type: t["signed char"] },
        ],
    });

    const Outer = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "inner", type: Inner },
            { name: "b", type: t["signed char"] },
        ],
    });

    test.assert(h.sizeof(Inner) === 16, "Inner size");
    test.assert(h.alignof(Inner) === 8, "Inner alignment");

    test.assert(h.offsetof(Outer, "a") === 0, "a offset");
    test.assert(h.offsetof(Outer, "inner") === 8, "inner offset");
    test.assert(h.offsetof(Outer, "b") === 24, "b offset");

    test.assert(h.sizeof(Outer) === 32, "Outer size");
    test.assert(h.alignof(Outer) === 8, "Outer alignment");
});

Deno.test("ABI: union layout", () => {
    const U = new deeplevel.Union({
        a: t["signed char"],
        b: t["double"],
        c: new deeplevel.NativeArray({ type: t["int"], length: 3 }),
    });

    test.assert(h.alignof(U) === 8, "U alignment");
    test.assert(h.sizeof(U) === 16, "U size");
});

Deno.test("ABI: array of structs", () => {
    const S = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "b", type: t["int"] },
        ],
    });

    const Arr = new deeplevel.NativeArray({ type: S, length: 3 });

    test.assert(h.sizeof(S) === 8, "S size");
    test.assert(h.alignof(S) === 4, "S alignment");
    test.assert(h.sizeof(Arr) === 24, "Arr size");
});

Deno.test("ABI: no tail padding reuse", () => {
    const A = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
        ],
    });

    const B = new deeplevel.Struct({
        fields: [
            { name: "a", type: A },
            { name: "b", type: t["int"] },
        ],
    });

    test.assert(h.offsetof(B, "a") === 0, "a offset");
    test.assert(h.offsetof(B, "b") === 4, "b offset");

    test.assert(h.sizeof(B) === 8, "B size");
});

Deno.test("ABI: mixed alignment stress", () => {
    const S = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "b", type: t["short"] },
            { name: "c", type: t["int"] },
            { name: "d", type: t["long long"] },
        ],
    });

    test.assert(h.offsetof(S, "a") === 0, "a offset");
    test.assert(h.offsetof(S, "b") === 2, "b offset");
    test.assert(h.offsetof(S, "c") === 4, "c offset");
    test.assert(h.offsetof(S, "d") === 8, "d offset");

    test.assert(h.sizeof(S) === 16, "S size");
    test.assert(h.alignof(S) === 8, "S alignment");
});

Deno.test("ABI: realistic struct", () => {
    const S = new deeplevel.Struct({
        fields: [
            { name: "id", type: t["unsigned long long"] },
            { name: "flags", type: t["signed char"] },
            { name: "type", type: t["signed char"] },
            { name: "pad", type: t["signed char"] },
            { name: "value", type: t["double"] },
            { name: "ptr", type: t["void *"] },
        ],
    });

    test.assert(h.offsetof(S, "id") === 0, "id offset");
    test.assert(h.offsetof(S, "flags") === 8, "flags offset");
    test.assert(h.offsetof(S, "type") === 9, "type offset");
    test.assert(h.offsetof(S, "pad") === 10, "pad offset");
    test.assert(h.offsetof(S, "value") === 16, "value offset");
    test.assert(h.offsetof(S, "ptr") === 24, "ptr offset");

    test.assert(h.sizeof(S) === 32, "S size");
    test.assert(h.alignof(S) === 8, "S alignment");
});

Deno.test("ABI: deep nesting (struct -> union -> struct)", () => {
    const InnerStruct = new deeplevel.Struct({
        fields: [
            { name: "x", type: t["double"] }, // 8
            { name: "y", type: t["signed char"] }, // 1
        ],
    });
    // size = 16, align = 8

    const InnerUnion = new deeplevel.Union({
        a: t["int"], // 4
        b: InnerStruct, // 16
    });
    // size = 16, align = 8

    const Outer = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "u", type: InnerUnion },
            { name: "b", type: t["int"] },
        ],
    });

    // Layout:
    // a: 0
    // padding: 1–7
    // u: 8
    // b: 24
    // padding: 28–31
    // size = 32

    test.assert(h.offsetof(Outer, "a") === 0, "a offset");
    test.assert(h.offsetof(Outer, "u") === 8, "u offset");
    test.assert(h.offsetof(Outer, "b") === 24, "b offset");

    test.assert(h.sizeof(Outer) === 32, "Outer size");
    test.assert(h.alignof(Outer) === 8, "Outer alignment");
});

Deno.test("ABI: deep nesting (union -> struct -> union)", () => {
    const U1 = new deeplevel.Union({
        a: t["signed char"],
        b: t["double"],
    });
    // size = 8, align = 8

    const S = new deeplevel.Struct({
        fields: [
            { name: "u", type: U1 },
            { name: "x", type: t["int"] },
        ],
    });
    // u: 0
    // x: 8
    // size = 16, align = 8

    const U2 = new deeplevel.Union({
        a: S,
        b: new deeplevel.NativeArray({ type: t["int"], length: 3 }), // 12
    });
    // max size = 16, align = 8 -> size = 16

    test.assert(h.sizeof(S) === 16, "S size");
    test.assert(h.alignof(S) === 8, "S align");

    test.assert(h.sizeof(U2) === 16, "U2 size");
    test.assert(h.alignof(U2) === 8, "U2 align");
});

Deno.test("ABI: triple nested struct chain", () => {
    const A = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
        ],
    });
    // size = 1, align = 1

    const B = new deeplevel.Struct({
        fields: [
            { name: "a", type: A },
            { name: "b", type: t["double"] },
        ],
    });
    // a: 0
    // padding: 1–7
    // b: 8
    // size = 16

    const C = new deeplevel.Struct({
        fields: [
            { name: "b", type: B },
            { name: "c", type: t["signed char"] },
        ],
    });

    // b: 0
    // c: 16
    // padding: 17–23
    // size = 24

    test.assert(h.offsetof(C, "b") === 0, "b offset");
    test.assert(h.offsetof(C, "c") === 16, "c offset");

    test.assert(h.sizeof(C) === 24, "C size");
    test.assert(h.alignof(C) === 8, "C align");
});

Deno.test("ABI: struct with array of unions", () => {
    const U = new deeplevel.Union({
        a: t["signed char"],
        b: t["double"],
    });
    // size = 8, align = 8

    const Arr = new deeplevel.NativeArray({ type: U, length: 3 });
    // size = 24

    const S = new deeplevel.Struct({
        fields: [
            { name: "x", type: t["signed char"] },
            { name: "arr", type: Arr },
        ],
    });

    // x: 0
    // padding: 1–7
    // arr: 8
    // size = 32

    test.assert(h.offsetof(S, "x") === 0, "x offset");
    test.assert(h.offsetof(S, "arr") === 8, "arr offset");

    test.assert(h.sizeof(S) === 32, "S size");
    test.assert(h.alignof(S) === 8, "S align");
});

Deno.test("ABI: alignment propagation stress", () => {
    const Deep = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["signed char"] },
            { name: "b", type: t["double"] },
        ],
    });
    // size = 16, align = 8

    const Mid = new deeplevel.Struct({
        fields: [
            { name: "x", type: t["signed char"] },
            { name: "deep", type: Deep },
        ],
    });
    // x: 0
    // padding: 1–7
    // deep: 8
    // size = 24, align = 8

    const Top = new deeplevel.Struct({
        fields: [
            { name: "m", type: Mid },
            { name: "y", type: t["int"] },
        ],
    });

    // m: 0
    // y: 24
    // padding: 28–31
    // size = 32

    test.assert(h.offsetof(Top, "m") === 0, "m offset");
    test.assert(h.offsetof(Top, "y") === 24, "y offset");

    test.assert(h.sizeof(Top) === 32, "Top size");
    test.assert(h.alignof(Top) === 8, "Top align");
});
