import { ISolJson } from '../types'
import { CompilerCore } from './core'
import { Compiler } from './compiler'
import { getSupportedMethods } from './helpers'

export const setupBindings = (solJson: ISolJson) => {
  const core = new CompilerCore(solJson)
  const compiler = new Compiler(solJson, core)
  const methodFlags = getSupportedMethods(solJson)

  return {
    methodFlags,
    core,
    compiler
  }
}
