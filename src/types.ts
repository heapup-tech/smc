export type Hex = `0x${string}`

export interface ISolBinList {
  builds: {
    path: string
    version: string
    longVersion: string
    keccak256: Hex
    sha256: Hex
    urls: string[]
  }[]
  releases: Record<string, string>
  latestRelease: string
}

export type SolJsonMethod = string
export type SolJsonMethodReturn = any
export type SolJsonMethodArgs = string[]

export type ISolJson = {
  cwrap: (
    method: SolJsonMethod,
    returnType: SolJsonMethodReturn,
    args: SolJsonMethodArgs
  ) => Function
  addFunction: (func: Function, sig?: string) => number
  removeFunction: (index: number) => void
  lengthBytesUTF8: (str: string) => number
  stringToUTF8: (str: string, outPtr: number, maxBytesToWrite: number) => number
} & Record<string, any>
