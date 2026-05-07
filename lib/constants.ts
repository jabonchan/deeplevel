import * as enums from "./types/enums.ts";

const isWindows = Deno.build.os === "windows";
const isUnixLike = !isWindows;
const is64Bit = Deno.build.arch === "x86_64" || Deno.build.arch === "aarch64";
const nativeLong = isWindows
    ? "i32" as const
    : is64Bit
    ? "i64" as const
    : "i32" as const;
const nativeUnsignedLong = isWindows
    ? "u32" as const
    : is64Bit
    ? "u64" as const
    : "u32" as const;
const nativeWChar = isWindows ? "u16" as const : "u32" as const;
const windowsHalfPtr = is64Bit ? "i32" as const : "i16" as const;
const windowsUHalfPtr = is64Bit ? "u32" as const : "u16" as const;
const nativeChar = isWindows ? "i8" : "u8";

const testBuffer = new ArrayBuffer(4);
new DataView(testBuffer).setUint32(0, 0x00_00_00_01, true);

export const SystemEndianness = new Uint8Array(testBuffer)[0] === 0x01
    ? enums.Endianness.Little
    : enums.Endianness.Big;

export const Platform = {
    os: Deno.build.os,
    arch: Deno.build.arch,
    isLE: SystemEndianness === enums.Endianness.Little,
    isBE: SystemEndianness === enums.Endianness.Big,
    isWindows,
    isUnixLike,
    is32Bit: !is64Bit,
    is64Bit,
} as const;

export const SystemPointerSize = Platform.is64Bit ? 8 as const : 4 as const;

export const PrimitiveText = {
    nullchar: "\x00",
    DefaultWideCharSize: isWindows ? 2 as const : 4 as const,
    DefaultWideEncoding: isWindows
        ? enums.WideTextEncoding.UTF16
        : enums.WideTextEncoding.UTF32,
} as const;

export const DenoPrimitiveTypes = {
    bool: "bool",
    void: "void",
    u8: "u8",
    u16: "u16",
    u32: "u32",
    u64: "u64",
    i8: "i8",
    i16: "i16",
    i32: "i32",
    i64: "i64",
    f32: "f32",
    f64: "f64",
    isize: "isize",
    usize: "usize",
    pointer: "pointer",
    buffer: "buffer",
    function: "function",
} as const;

export const DefaultPrimitiveTypes = {
    // Native C/C++ standard types for the current platform.
    void: "void",
    char: nativeChar,
    short: "i16",
    int: "i32",
    long: nativeLong,
    wchar_t: nativeWChar,
    float: "f32",
    double: "f64",
    bool: "bool",
    size_t: "usize",

    ["unsigned char"]: "u8",
    ["unsigned short"]: "u16",
    ["unsigned int"]: "u32",
    ["unsigned long"]: nativeUnsignedLong,
    ["unsigned long int"]: nativeUnsignedLong,
    ["unsigned long long"]: "u64",
    ["unsigned long long int"]: "u64",
    ["unsigned size_t"]: "usize",

    ["signed char"]: "i8",
    ["signed short"]: "i16",
    ["signed int"]: "i32",
    ["signed long"]: nativeLong,
    ["signed long int"]: nativeLong,
    ["signed long long"]: "i64",
    ["signed long long int"]: "i64",
    ["signed size_t"]: "isize",

    ["long int"]: nativeLong,
    ["long long"]: "i64",
    ["long long int"]: "i64",

    ["void *"]: "pointer",
    ["char *"]: "pointer",
    ["void (*)(*)"]: "pointer",
} as const;

export const UnixPrimitiveTypes = {
    void: "void",
    char: "u8",
    short: "i16",
    int: "i32",
    long: is64Bit ? "i64" as const : "i32" as const,
    wchar_t: "u32",
    float: "f32",
    double: "f64",
    bool: "bool",
    size_t: "usize",

    ["unsigned char"]: "u8",
    ["unsigned short"]: "u16",
    ["unsigned int"]: "u32",
    ["unsigned long"]: is64Bit ? "u64" as const : "u32" as const,
    ["unsigned long int"]: "u64",
    ["unsigned long long"]: "u64",
    ["unsigned long long int"]: "u64",
    ["unsigned size_t"]: "usize",

    ["signed char"]: "i8",
    ["signed short"]: "i16",
    ["signed int"]: "i32",
    ["signed long"]: is64Bit ? "i64" as const : "i32" as const,
    ["signed long int"]: "i64",
    ["signed long long"]: "i64",
    ["signed long long int"]: "i64",
    ["signed size_t"]: "isize",

    ["long int"]: "i64",
    ["long long"]: "i64",
    ["long long int"]: "i64",

    ["void *"]: "pointer",
    ["char *"]: "pointer",
    ["void (*)(*)"]: "pointer",
} as const;

export const WindowsPrimitiveTypes = {
    void: "void",
    char: "i8",
    short: "i16",
    int: "i32",
    long: "i32",
    wchar_t: "u16",
    float: "f32",
    double: "f64",
    bool: "bool",
    size_t: "usize",

    ["unsigned char"]: "u8",
    ["unsigned short"]: "u16",
    ["unsigned int"]: "u32",
    ["unsigned long"]: "u32",
    ["unsigned long int"]: "u32",
    ["unsigned long long"]: "u64",
    ["unsigned long long int"]: "u64",
    ["unsigned size_t"]: "usize",

    ["signed char"]: "i8",
    ["signed short"]: "i16",
    ["signed int"]: "i32",
    ["signed long"]: "i32",
    ["signed long int"]: "i32",
    ["signed long long"]: "i64",
    ["signed long long int"]: "i64",
    ["signed size_t"]: "isize",

    ["long int"]: "i32",
    ["long long"]: "i64",
    ["long long int"]: "i64",
    ["long double"]: "f64",

    ["void *"]: "pointer",
    ["char *"]: "pointer",
    ["void (*)(*)"]: "pointer",
} as const;

export const WindowsValues = {
    NULL: 0,
    TRUE: 1,
    FALSE: 0,
} as const;

export const WindowsAPITypes = {
    // SOURCE: https://learn.microsoft.com/en-us/windows/win32/winprog/windows-data-types

    APIENTRY: WindowsPrimitiveTypes["void"], // typedef void APIENTRY
    ATOM: WindowsPrimitiveTypes["unsigned short"], // typedef WORD ATOM
    BOOL: WindowsPrimitiveTypes["int"], // typedef int BOOL
    BOOLEAN: WindowsPrimitiveTypes["unsigned char"], // typedef BYTE BOOLEAN
    BYTE: WindowsPrimitiveTypes["unsigned char"], // typedef unsigned char BYTE
    CALLBACK: WindowsPrimitiveTypes["void"], // typedef void CALLBACK
    CCHAR: WindowsPrimitiveTypes["char"], // typedef char CCHAR
    CHAR: WindowsPrimitiveTypes["char"], // typedef char CHAR
    COLORREF: WindowsPrimitiveTypes["unsigned long"], // typedef DWORD COLORREF
    CONST: WindowsPrimitiveTypes["void"], // typedef void CONST
    DWORD: WindowsPrimitiveTypes["unsigned long"], // typedef unsigned long DWORD
    DWORDLONG: WindowsPrimitiveTypes["unsigned long long"], // typedef unsigned __int64 DWORDLONG
    DWORD_PTR: WindowsPrimitiveTypes["size_t"], // typedef ULONG_PTR DWORD_PTR
    DWORD32: WindowsPrimitiveTypes["unsigned int"], // typedef unsigned int DWORD32
    DWORD64: WindowsPrimitiveTypes["unsigned long long"], // typedef unsigned __int64 DWORD64
    FLOAT: WindowsPrimitiveTypes["float"], // typedef float FLOAT
    HALF_PTR: windowsHalfPtr, // typedef pointer_half HALF_PTR

    HANDLE: WindowsPrimitiveTypes["void *"], // typedef PVOID HANDLE

    HACCEL: WindowsPrimitiveTypes["void *"], // typedef HANDLE HACCEL
    HBITMAP: WindowsPrimitiveTypes["void *"], // typedef HANDLE HBITMAP
    HBRUSH: WindowsPrimitiveTypes["void *"], // typedef HANDLE HBRUSH
    HCOLORSPACE: WindowsPrimitiveTypes["void *"], // typedef HANDLE HCOLORSPACE
    HCONV: WindowsPrimitiveTypes["void *"], // typedef HANDLE HCONV
    HCONVLIST: WindowsPrimitiveTypes["void *"], // typedef HANDLE HCONVLIST
    HCURSOR: WindowsPrimitiveTypes["void *"], // typedef HICON HCURSOR
    HDC: WindowsPrimitiveTypes["void *"], // typedef HANDLE HDC
    HDDEDATA: WindowsPrimitiveTypes["void *"], // typedef HANDLE HDDEDATA
    HDESK: WindowsPrimitiveTypes["void *"], // typedef HANDLE HDESK
    HDROP: WindowsPrimitiveTypes["void *"], // typedef HANDLE HDROP
    HDWP: WindowsPrimitiveTypes["void *"], // typedef HANDLE HDWP
    HENHMETAFILE: WindowsPrimitiveTypes["void *"], // typedef HANDLE HENHMETAFILE
    HFILE: WindowsPrimitiveTypes["int"], // typedef int HFILE
    HFONT: WindowsPrimitiveTypes["void *"], // typedef HANDLE HFONT
    HGDIOBJ: WindowsPrimitiveTypes["void *"], // typedef HANDLE HGDIOBJ
    HGLOBAL: WindowsPrimitiveTypes["void *"], // typedef HANDLE HGLOBAL
    HHOOK: WindowsPrimitiveTypes["void *"], // typedef HANDLE HHOOK
    HICON: WindowsPrimitiveTypes["void *"], // typedef HANDLE HICON
    HINSTANCE: WindowsPrimitiveTypes["void *"], // typedef HANDLE HINSTANCE
    HKEY: WindowsPrimitiveTypes["void *"], // typedef HANDLE HKEY
    HKL: WindowsPrimitiveTypes["void *"], // typedef HANDLE HKL
    HLOCAL: WindowsPrimitiveTypes["void *"], // typedef HANDLE HLOCAL
    HMENU: WindowsPrimitiveTypes["void *"], // typedef HANDLE HMENU
    HMETAFILE: WindowsPrimitiveTypes["void *"], // typedef HANDLE HMETAFILE
    HMODULE: WindowsPrimitiveTypes["void *"], // typedef HINSTANCE HMODULE
    HMONITOR: WindowsPrimitiveTypes["void *"], // typedef HANDLE HMONITOR
    HPALETTE: WindowsPrimitiveTypes["void *"], // typedef HANDLE HPALETTE
    HPEN: WindowsPrimitiveTypes["void *"], // typedef HANDLE HPEN
    HRESULT: WindowsPrimitiveTypes["long"], // typedef LONG HRESULT
    HRGN: WindowsPrimitiveTypes["void *"], // typedef HANDLE HRGN
    HRSRC: WindowsPrimitiveTypes["void *"], // typedef HANDLE HRSRC
    HSZ: WindowsPrimitiveTypes["void *"], // typedef HANDLE HSZ
    HWINSTA: WindowsPrimitiveTypes["void *"], // typedef HANDLE HWINSTA
    HWND: WindowsPrimitiveTypes["void *"], // typedef HANDLE HWND

    INT: WindowsPrimitiveTypes["int"], // typedef int INT
    INT_PTR: WindowsPrimitiveTypes["signed size_t"], // typedef signed_size_t INT_PTR
    INT8: WindowsPrimitiveTypes["signed char"], // typedef signed char INT8
    INT16: WindowsPrimitiveTypes["short"], // typedef short INT16
    INT32: WindowsPrimitiveTypes["signed int"], // typedef signed int INT32
    INT64: WindowsPrimitiveTypes["signed long long"], // typedef __int64 INT64

    LANGID: WindowsPrimitiveTypes["unsigned short"], // typedef WORD LANGID
    LCID: WindowsPrimitiveTypes["unsigned long"], // typedef DWORD LCID
    LCTYPE: WindowsPrimitiveTypes["unsigned long"], // typedef DWORD LCTYPE
    LGRPID: WindowsPrimitiveTypes["unsigned long"], // typedef DWORD LGRPID

    LONG: WindowsPrimitiveTypes["long"], // typedef long LONG
    LONGLONG: WindowsPrimitiveTypes["signed long long"], // typedef __int64 LONGLONG
    LONG_PTR: WindowsPrimitiveTypes["signed size_t"], // typedef signed_size_t LONG_PTR
    LONG32: WindowsPrimitiveTypes["signed int"], // typedef signed int LONG32
    LONG64: WindowsPrimitiveTypes["signed long long"], // typedef __int64 LONG64

    LPARAM: WindowsPrimitiveTypes["signed size_t"], // typedef LONG_PTR LPARAM

    LPBOOL: WindowsPrimitiveTypes["void *"], // typedef BOOL * LPBOOL
    LPBYTE: WindowsPrimitiveTypes["void *"], // typedef BYTE * LPBYTE
    LPCOLORREF: WindowsPrimitiveTypes["void *"], // typedef DWORD * LPCOLORREF
    LPCSTR: WindowsPrimitiveTypes["void *"], // typedef const char * LPCSTR
    LPCTSTR: WindowsPrimitiveTypes["void *"], // typedef const TCHAR * LPCTSTR
    LPCVOID: WindowsPrimitiveTypes["void *"], // typedef const void * LPCVOID
    LPCWSTR: WindowsPrimitiveTypes["void *"], // typedef const wchar_t * LPCWSTR
    LPDWORD: WindowsPrimitiveTypes["void *"], // typedef DWORD * LPDWORD
    LPHANDLE: WindowsPrimitiveTypes["void *"], // typedef HANDLE * LPHANDLE
    LPINT: WindowsPrimitiveTypes["void *"], // typedef int * LPINT
    LPLONG: WindowsPrimitiveTypes["void *"], // typedef long * LPLONG
    LPSTR: WindowsPrimitiveTypes["void *"], // typedef char * LPSTR
    LPTSTR: WindowsPrimitiveTypes["void *"], // typedef TCHAR * LPTSTR
    LPVOID: WindowsPrimitiveTypes["void *"], // typedef void * LPVOID
    LPWORD: WindowsPrimitiveTypes["void *"], // typedef WORD * LPWORD
    LPWSTR: WindowsPrimitiveTypes["void *"], // typedef wchar_t * LPWSTR

    LRESULT: WindowsPrimitiveTypes["signed size_t"], // typedef LONG_PTR LRESULT

    PBOOL: WindowsPrimitiveTypes["void *"], // typedef BOOL * PBOOL
    PBOOLEAN: WindowsPrimitiveTypes["void *"], // typedef BOOLEAN * PBOOLEAN
    PBYTE: WindowsPrimitiveTypes["void *"], // typedef BYTE * PBYTE
    PCHAR: WindowsPrimitiveTypes["void *"], // typedef CHAR * PCHAR
    PCSTR: WindowsPrimitiveTypes["void *"], // typedef const char * PCSTR
    PCTSTR: WindowsPrimitiveTypes["void *"], // typedef const TCHAR * PCTSTR
    PCWSTR: WindowsPrimitiveTypes["void *"], // typedef const wchar_t * PCWSTR
    PDWORD: WindowsPrimitiveTypes["void *"], // typedef DWORD * PDWORD
    PDWORDLONG: WindowsPrimitiveTypes["void *"], // typedef DWORDLONG * PDWORDLONG
    PDWORD_PTR: WindowsPrimitiveTypes["void *"], // typedef DWORD_PTR * PDWORD_PTR
    PDWORD32: WindowsPrimitiveTypes["void *"], // typedef DWORD32 * PDWORD32
    PDWORD64: WindowsPrimitiveTypes["void *"], // typedef DWORD64 * PDWORD64
    PFLOAT: WindowsPrimitiveTypes["void *"], // typedef FLOAT * PFLOAT
    PHALF_PTR: WindowsPrimitiveTypes["void *"], // typedef HALF_PTR * PHALF_PTR
    PHANDLE: WindowsPrimitiveTypes["void *"], // typedef HANDLE * PHANDLE
    PHKEY: WindowsPrimitiveTypes["void *"], // typedef HKEY * PHKEY
    PINT: WindowsPrimitiveTypes["void *"], // typedef int * PINT
    PINT_PTR: WindowsPrimitiveTypes["void *"], // typedef INT_PTR * PINT_PTR
    PINT8: WindowsPrimitiveTypes["void *"], // typedef INT8 * PINT8
    PINT16: WindowsPrimitiveTypes["void *"], // typedef INT16 * PINT16
    PINT32: WindowsPrimitiveTypes["void *"], // typedef INT32 * PINT32
    PINT64: WindowsPrimitiveTypes["void *"], // typedef INT64 * PINT64

    PLCID: WindowsPrimitiveTypes["void *"], // typedef PDWORD PLCID
    PLONG: WindowsPrimitiveTypes["void *"], // typedef LONG * PLONG
    PLONGLONG: WindowsPrimitiveTypes["void *"], // typedef LONGLONG * PLONGLONG
    PLONG_PTR: WindowsPrimitiveTypes["void *"], // typedef LONG_PTR * PLONG_PTR
    PLONG32: WindowsPrimitiveTypes["void *"], // typedef LONG32 * PLONG32
    PLONG64: WindowsPrimitiveTypes["void *"], // typedef LONG64 * PLONG64

    POINTER_32: WindowsPrimitiveTypes["void *"], // typedef void * POINTER_32
    POINTER_64: WindowsPrimitiveTypes["void *"], // typedef void * POINTER_64
    POINTER_SIGNED: WindowsPrimitiveTypes["void *"], // typedef void * POINTER_SIGNED
    POINTER_UNSIGNED: WindowsPrimitiveTypes["void *"], // typedef void * POINTER_UNSIGNED

    PSHORT: WindowsPrimitiveTypes["void *"], // typedef SHORT * PSHORT
    PSIZE_T: WindowsPrimitiveTypes["void *"], // typedef SIZE_T * PSIZE_T
    PSSIZE_T: WindowsPrimitiveTypes["void *"], // typedef SSIZE_T * PSSIZE_T

    PSTR: WindowsPrimitiveTypes["void *"], // typedef CHAR * PSTR
    PTBYTE: WindowsPrimitiveTypes["void *"], // typedef TBYTE * PTBYTE
    PTCHAR: WindowsPrimitiveTypes["void *"], // typedef TCHAR * PTCHAR
    PTSTR: WindowsPrimitiveTypes["void *"], // typedef TCHAR * PTSTR

    PUCHAR: WindowsPrimitiveTypes["void *"], // typedef UCHAR * PUCHAR
    PUHALF_PTR: WindowsPrimitiveTypes["void *"], // typedef UHALF_PTR * PUHALF_PTR
    PUINT: WindowsPrimitiveTypes["void *"], // typedef UINT * PUINT
    PUINT_PTR: WindowsPrimitiveTypes["void *"], // typedef UINT_PTR * PUINT_PTR
    PUINT8: WindowsPrimitiveTypes["void *"], // typedef UINT8 * PUINT8
    PUINT16: WindowsPrimitiveTypes["void *"], // typedef UINT16 * PUINT16
    PUINT32: WindowsPrimitiveTypes["void *"], // typedef UINT32 * PUINT32
    PUINT64: WindowsPrimitiveTypes["void *"], // typedef UINT64 * PUINT64

    PULONG: WindowsPrimitiveTypes["void *"], // typedef ULONG * PULONG
    PULONGLONG: WindowsPrimitiveTypes["void *"], // typedef ULONGLONG * PULONGLONG
    PULONG_PTR: WindowsPrimitiveTypes["void *"], // typedef ULONG_PTR * PULONG_PTR
    PULONG32: WindowsPrimitiveTypes["void *"], // typedef ULONG32 * PULONG32
    PULONG64: WindowsPrimitiveTypes["void *"], // typedef ULONG64 * PULONG64

    PUSHORT: WindowsPrimitiveTypes["void *"], // typedef USHORT * PUSHORT
    PVOID: WindowsPrimitiveTypes["void *"], // typedef void * PVOID
    PWCHAR: WindowsPrimitiveTypes["void *"], // typedef WCHAR * PWCHAR
    PWORD: WindowsPrimitiveTypes["void *"], // typedef WORD * PWORD
    PWSTR: WindowsPrimitiveTypes["void *"], // typedef WCHAR * PWSTR

    QWORD: WindowsPrimitiveTypes["unsigned long long"], // typedef unsigned __int64 QWORD

    SC_HANDLE: WindowsPrimitiveTypes["void *"], // typedef HANDLE SC_HANDLE
    SC_LOCK: WindowsPrimitiveTypes["void *"], // typedef LPVOID SC_LOCK
    SERVICE_STATUS_HANDLE: WindowsPrimitiveTypes["void *"], // typedef HANDLE SERVICE_STATUS_HANDLE

    SHORT: WindowsPrimitiveTypes["short"], // typedef short SHORT
    SIZE_T: WindowsPrimitiveTypes["size_t"], // typedef ULONG_PTR SIZE_T
    SSIZE_T: WindowsPrimitiveTypes["signed size_t"], // typedef LONG_PTR SSIZE_T

    TBYTE: WindowsPrimitiveTypes["unsigned short"], // typedef WCHAR TBYTE
    TCHAR: WindowsPrimitiveTypes["unsigned short"], // typedef WCHAR TCHAR
    UCHAR: WindowsPrimitiveTypes["unsigned char"], // typedef unsigned char UCHAR

    UHALF_PTR: windowsUHalfPtr, // typedef pointer_uhalf UHALF_PTR
    UINT: WindowsPrimitiveTypes["unsigned int"], // typedef unsigned int UINT
    UINT_PTR: WindowsPrimitiveTypes["size_t"], // typedef ULONG_PTR UINT_PTR
    UINT8: WindowsPrimitiveTypes["unsigned char"], // typedef unsigned char UINT8
    UINT16: WindowsPrimitiveTypes["unsigned short"], // typedef unsigned short UINT16
    UINT32: WindowsPrimitiveTypes["unsigned int"], // typedef unsigned int UINT32
    UINT64: WindowsPrimitiveTypes["unsigned long long"], // typedef unsigned __int64 UINT64

    ULONG: WindowsPrimitiveTypes["unsigned long"], // typedef unsigned long ULONG
    ULONGLONG: WindowsPrimitiveTypes["unsigned long long"], // typedef unsigned __int64 ULONGLONG
    ULONG_PTR: WindowsPrimitiveTypes["size_t"], // typedef ULONG_PTR ULONG_PTR
    ULONG32: WindowsPrimitiveTypes["unsigned int"], // typedef unsigned int ULONG32
    ULONG64: WindowsPrimitiveTypes["unsigned long long"], // typedef unsigned __int64 ULONG64

    UNICODE_STRING: WindowsPrimitiveTypes["void *"], // typedef struct UNICODE_STRING

    USHORT: WindowsPrimitiveTypes["unsigned short"], // typedef unsigned short USHORT
    USN: WindowsPrimitiveTypes["signed long long"], // typedef LONGLONG USN

    VOID: WindowsPrimitiveTypes["void"], // typedef void VOID

    WCHAR: WindowsPrimitiveTypes["unsigned short"], // typedef wchar_t WCHAR

    WINAPI: WindowsPrimitiveTypes["void"], // typedef void WINAPI
    WORD: WindowsPrimitiveTypes["unsigned short"], // typedef unsigned short WORD
    WPARAM: WindowsPrimitiveTypes["size_t"], // typedef UINT_PTR WPARAM
} as const;
