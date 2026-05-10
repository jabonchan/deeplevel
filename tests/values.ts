import * as deeplevel from "../mod.ts";
import * as test from "./lib/mod.ts";

const t = deeplevel.constants.DefaultPrimitiveTypes;
const h = deeplevel.helpers;

Deno.test("values: struct roundtrip (strict)", () => {
    const S = new deeplevel.Struct({
        fields: [
            { name: "a", type: t["int"] },
            { name: "b", type: t["double"] },
        ],
    });

    const value = { a: 42, b: 3.14 };

    const buf = S.pack(value);
    const out = S.unpack(buf);

    test.objectEquals(value, out);
});

Deno.test("values: union roundtrip (strict)", () => {
    const U = new deeplevel.Union({
        a: t["int"],
        b: t["double"],
    });

    const value = { b: 99.5 };

    const buf = U.pack(value);
    const out = U.unpack(buf);

    test.objectEqualsOptionalProperties(value, out);
});

Deno.test("Values: nested arrays", () => {
    const definitionA = new deeplevel.NativeArray({
        length: 3,
        type: t["double"], // if we use float we may lose precision and cause the check to fail
    });

    const definitionB = new deeplevel.NativeArray({
        length: 4,
        type: new deeplevel.Struct({
            fields: [
                { name: "pi", type: t["double"] }, // if we use float we may lose precision and cause the check to fail
                {
                    name: "vector3",
                    type: new deeplevel.NativeArray({
                        type: t["int"],
                        length: 3,
                    }),
                },
            ],
        }),
    });

    const valueA = [0.5, 0.1, 5];
    const valueB = [
        { pi: Math.PI, vector3: [1, 2, 3] },
        { pi: Math.PI, vector3: [3, 4, 9] },
        { pi: Math.PI, vector3: [6, 7, 8] },
        { pi: Math.PI, vector3: [9, 10, 11] },
    ];

    const packedA = definitionA.pack(valueA);
    const packedB = definitionB.pack(valueB);

    const unpackedA = definitionA.unpack(packedA);
    const unpackedB = definitionB.unpack(packedB);

    test.objectEquals(valueA, unpackedA);
    test.objectEquals(valueB, unpackedB);
});

Deno.test("Values: arrays inside struct", () => {
    const definition = new deeplevel.Struct({
        fields: [
            { name: "isVector", type: t["bool"] },
            {
                name: "vector",
                type: new deeplevel.NativeArray({
                    length: 3,
                    type: t["double"], // if we use float we may lose precision and cause the check to fail
                }),
            },
        ],
    });

    const value = {
        isVector: true,
        vector: [1, Math.PI, 3],
    };

    const packed = definition.pack(value);
    const unpacked = definition.unpack(packed);

    test.objectEquals(value, unpacked);
});

Deno.test("values: deep nested strict", () => {
    const Inner = new deeplevel.Struct({
        fields: [
            { name: "x", type: t["double"] },
            { name: "y", type: t["int"] },
        ],
    });

    const U = new deeplevel.Union({
        a: t["int"],
        b: Inner,
    });

    const Outer = new deeplevel.Struct({
        fields: [
            { name: "id", type: t["int"] },
            { name: "payload", type: U },
        ],
    });

    const valueA = {
        id: 123,
        payload: {
            b: {
                x: 1.5,
                y: 10,
            },
        },
    };

    const valueB = {
        id: 123,
        payload: {
            a: 33,
        },
    };

    const bufA = Outer.pack(valueA);
    const outA = Outer.unpack(bufA);
    const bufB = Outer.pack(valueB);
    const outB = Outer.unpack(bufB);

    test.objectEqualsOptionalProperties(valueA, outA);
    test.objectEqualsOptionalProperties(valueB, outB);
});

Deno.test("values: pointer roundtrip", () => {
    const S = new deeplevel.Struct({
        fields: [
            { name: "ptr", type: t["void *"] },
        ],
    });

    const value = {
        ptr: h.create(0x12345678),
    };

    const buf = S.pack(value);
    const out = S.unpack(buf);

    test.objectEquals(value, out);
});
