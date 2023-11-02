import { CompileInput } from '../types/input'

const input: CompileInput = {
  language: 'Solidity',
  settings: {
    debug: {
      revertStrings: 'debug'
    },
    outputSelection: {
      '*': {
        '*': ['evm.bytecode']
      }
    }
  },
  sources: {
    'a.sol': {
      content: 'contract A { function f() public returns (uint) { return 7; } }'
    },
    'b.sol': {
      content:
        'import "a.sol"; contract B is A { function g() public { f(); } }'
    }
  }
}
