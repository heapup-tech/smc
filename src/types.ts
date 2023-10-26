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
