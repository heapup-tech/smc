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

export type Settings = {
  /**
   * Debugging settings
   */
  debug?: Debug
  /**
   * Version of the EVM to compile for
   */
  evmVersion: EvmVersion
  /**
   * Addresses of the libraries
   */
  libraries?: Record<string, Library>
  /**
   * Metadata settings
   */
  metadata?: Metadata
  modelChecker: ModelChecker
  /**
   * Optimizer settings
   */
  optimizer?: Optimizer
  outputSelection: OutputSelection
  /**
   * Sorted list of remappings
   */
  remappings?: string[]
  /**
   * Stop compilation after the given stage. Currently only "parsing" is valid here
   */
  stopAfter?: 'parsing'
  /**
   * Change compilation pipeline to go through the Yul intermediate representation.
   * @default false
   */
  viaIR: boolean
}

export type Source = (
  | {
      /**
       * Source code string
       */
      content: string
      /**
       * keccak256 hash of the source file
       */
      keccak256?: Hex
    }
  | {
      /**
       * Source file path
       *
       * @example ['bzzr://56ab...', 'ipfs://Qma...', '/tmp/path/to/file.sol']
       */
      urls: string[]
    }
) & {
  /**
   * keccak256 hash of the source file
   */
  keccak256?: Hex
}

export interface CompileInput {
  /**
   * Source code language, Currently supported are "Solidity", "Yul" and "SolidityAST"
   *
   */
  language: CodeLang
  sources: Record<string, Source>
  settings?: Settings
}
