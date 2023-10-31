/**
 * Example:
 * const input = {
  language: 'Solidity',
  settings: {
    libraries: {
      'lib.sol': {
        L: '0x4200000000000000000000000000000000000001'
      }
    },
    outputSelection: {
      '*': {
        '*': ['evm.bytecode', 'evm.gasEstimates']
      }
    }
  },
  sources: {
    'x.sol': {
      content: 'contract x { this is an invalid contract }'
    }
  }
}
 */

// see parseInput

export type CodeLang = 'Solidity' | 'Yul' | 'SolidityAST'
export type Hex = `0x${string}`
export type Address = Hex
export type EvmVersion =
  | 'homestead'
  | 'tangerineWhistle'
  | 'spuriousDragon'
  | 'byzantium'
  | 'constantinople'
  | 'petersburg'
  | 'istanbul'
  | 'berlin'
  | 'london'
  | 'paris'
  | 'shanghai'

export interface CompileOptimizer {
  enabled: boolean
  runs: number
  details: {
    peephole: boolean
    inliner: boolean
    jumpdestRemover: boolean
    orderLiterals: boolean
    deduplicate: boolean
    cse: boolean
    constantOptimizer: boolean
    yul: boolean
    simpleCounterForLoopUncheckedIncrement: boolean
    yulDetails: {
      stackAllocation: boolean
      optimizerSteps: string
    }
  }
}

interface CompileDebug {
  revertStrings: 'default' | 'strip' | 'debug' | 'verboseDebug'
  debugInfo: string[]
}

interface CompileLibrary {
  [key: string]: Address
}

interface CompileMetadata {
  appendCBOR: boolean
  useLiteralContent: boolean
  bytecodeHash: 'none' | 'ipfs' | 'bzzr1'
}

interface CompileOutputSelection {
  [index: string]: Record<string, string[]>
}

interface ModelChecker {
  bmcLoopIterations: number
  contracts: Record<string, string[]>
  divModNoSlacks: boolean
  engine: 'all' | 'bmc' | 'chc' | 'none'
  extCalls: string
  invariants: string[]
  printQuery: boolean
  showProvedSafe: boolean
  showUnproved: boolean
  showUnsupported: boolean
  solvers: string[]
  targets: string[]
  timeout: number
}

export type CompileSettings = {
  debug: CompileDebug
  evmVersion: EvmVersion
  libraries: Record<string, CompileLibrary>
  metadata: CompileMetadata
  modelChecker: ModelChecker
  optimizer: CompileOptimizer
  outputSelection: CompileOutputSelection
  remappings: string[]
  stopAfter: 'parsing'
  viaIR: boolean
}

export interface CompileSource {
  content: string
  keccak256: Hex
  urls: string[]
}

export interface CompileInput {
  language: CodeLang
  sources: Record<string, CompileSource>
  settings: CompileSettings
}

export interface CompileOutput {}
