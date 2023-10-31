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

export type CodeLang = 'Solidity' | 'Yul' | 'SolidityAST'
export type Hex = `0x${string}`
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
}

interface CompileDebug {
  revertStrings: 'default' | 'strip' | 'debug' | 'verboseDebug'
  debugInfo: string[]
}

export type CompileSettings = {
  debug: CompileDebug
  evmVersion: EvmVersion
  libraries: any
  metadata: any
  modelChecker: any
  optimizer: CompileOptimizer
  outputSelection: any
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
  settings: {}
}

export interface CompileOutput {}
