export type SolJsonMethodName = string
export type SolJsonMethodReturn = any
export type SolJsonMethodArgs = string[]

export type ISolJson = {
  cwrap: (
    method: SolJsonMethodName,
    returnType: SolJsonMethodReturn,
    args: SolJsonMethodArgs
  ) => Function
  addFunction: (func: Function, sig?: string) => number
  removeFunction: (index: number) => void
  lengthBytesUTF8: (str: string) => number
  stringToUTF8: (str: string, outPtr: number, maxBytesToWrite: number) => number
} & Record<string, any>

/**
 * A mapping between libraries and the addresses to which they were deployed.
 *
 * Containing support for two level configuration, These two level
 * configurations can be seen below.
 *
 * {
 *     "lib.sol:L1": "0x...",
 *     "lib.sol:L2": "0x...",
 *     "lib.sol": {"L3": "0x..."}
 * }
 */
export interface LibraryAddresses {
  [qualifiedNameOrSourceUnit: string]:
    | string
    | { [unqualifiedLibraryName: string]: string }
}

/**
 * A mapping between libraries and lists of placeholder instances present in their hex-encoded bytecode.
 * For each placeholder its length and the position of the first character is stored.
 *
 * Each start and length entry will always directly refer to the position in
 * binary and not hex-encoded bytecode.
 */
export interface LinkReferences {
  [libraryLabel: string]: Array<{ start: number; length: number }>
}
