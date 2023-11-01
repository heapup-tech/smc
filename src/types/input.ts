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

import { Hex, Address } from './misc'

export type CodeLang = 'Solidity' | 'Yul' | 'SolidityAST'

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

export interface Optimizer {
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

interface Debug {
  revertStrings: 'default' | 'strip' | 'debug' | 'verboseDebug'
  debugInfo: string[]
}

interface Library {
  [key: string]: Address
}

interface Metadata {
  appendCBOR: boolean
  useLiteralContent: boolean
  bytecodeHash: 'none' | 'ipfs' | 'bzzr1'
}

interface OutputSelection {
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
  debug: Debug
  evmVersion: EvmVersion
  libraries: Record<string, Library>
  metadata: Metadata
  modelChecker: ModelChecker
  optimizer: Optimizer
  outputSelection: OutputSelection
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
