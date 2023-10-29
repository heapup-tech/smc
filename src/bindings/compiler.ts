import assert from 'assert'
import { ISolJson } from '../types'
import { isNil } from '../utils'
import { CompilerCore } from './core'
import { bindSolcMethod } from './helpers'

export class Compiler {
  private solJson: ISolJson
  private core: CompilerCore

  public compileJson
  public compileJsonCallback
  public compileJsonMulti
  public compileStandard
  constructor(solJson: ISolJson, core: CompilerCore) {
    this.solJson = solJson
    this.core = core

    this.compileJson = this.bindCompileJson()
    this.compileJsonCallback = this.bindCompileJsonCallback()
    this.compileJsonMulti = this.bindCompileJsonMulti()
    this.compileStandard = this.bindCompileStandard()
  }

  bindCompileJson() {
    return bindSolcMethod(
      this.solJson,
      'compileJSON',
      'string',
      ['string', 'number'],
      null
    )
  }
  bindCompileJsonMulti() {
    return bindSolcMethod(
      this.solJson,
      'compileJSONMulti',
      'string',
      ['string', 'number'],
      null
    )
  }

  bindCompileJsonCallback() {
    const compileInternal = bindSolcMethod(
      this.solJson,
      'compileJSONCallback',
      'string',
      ['string', 'number', 'number'],
      null
    )

    if (isNil(compileInternal)) return null

    return (input: any, optimize: any, readCallback: any) => {
      return this.runWithCallbacks(readCallback, compileInternal, [
        input,
        optimize
      ])
    }
  }

  bindCompileStandard() {
    let boundFunctionSolidity: any = null
    let boundFunctionStandard: any = null
    const compileInternal = bindSolcMethod(
      this.solJson,
      'compileStandard',
      'string',
      ['string', 'number'],
      null
    )

    if (this.core.isVersion6OrNewer) {
      boundFunctionSolidity = bindSolcMethod(
        this.solJson,
        'solidity_compile',
        'string',
        ['string', 'number', 'number'],
        null
      )
    } else {
      boundFunctionSolidity = bindSolcMethod(
        this.solJson,
        'solidity_compile',
        'string',
        ['string', 'number'],
        null
      )
    }

    if (!isNil(compileInternal)) {
      boundFunctionStandard = (input: { name: string }, readCallback: any) => {
        return this.runWithCallbacks(readCallback, compileInternal, [input])
      }
    }

    if (!isNil(boundFunctionSolidity)) {
      boundFunctionStandard = (input: { name: string }, callbacks: any) => {
        return this.runWithCallbacks(callbacks, boundFunctionSolidity, [input])
      }
    }

    return boundFunctionStandard
  }

  runWithCallbacks(callbacks: any, compile: Function, args: any[]) {
    if (callbacks) assert
    else callbacks = {}

    let readCallback = callbacks.import

    if (readCallback === undefined) {
      readCallback = () => {
        return {
          error: 'File import callback not supported'
        }
      }
    }

    let singleCallback
    if (this.core.isVersion6OrNewer) {
      // After 0.6.x multiple kind of callbacks are supported.
      let smtSolverCallback = callbacks.smtSolver
      if (smtSolverCallback === undefined) {
        smtSolverCallback = () => {
          return {
            error: 'SMT solver callback not supported'
          }
        }
      }

      singleCallback = (kind: string, data: any) => {
        if (kind === 'source') {
          return readCallback(data)
        } else if (kind === 'smt-query') {
          return smtSolverCallback(data)
        } else {
          assert(false, 'Invalid callback kind specified.')
        }
      }

      singleCallback = this.wrapCallbackWithKind(singleCallback)
    } else {
      // Old Solidity version only supported imports.
      singleCallback = this.wrapCallback(readCallback)
    }

    const cb = this.core.addFunction(singleCallback, 'viiiii')
    let output
    try {
      args.push(cb)
      if (this.core.isVersion6OrNewer) {
        // Callback context.
        args.push(null)
      }

      output = compile(...args)
    } finally {
      this.core.removeFunction(cb)
    }

    if (this.core.reset) {
      // Explicitly free memory.
      //
      // NOTE: cwrap() of "compile" will copy the returned pointer into a
      //       Javascript string and it is not possible to call free() on it.
      //       reset() however will clear up all allocations.
      this.core.reset()
    }
    return output
  }

  wrapCallbackWithKind(callback: Function) {
    return (context: any, kind: any, data: any, contents: any, error: any) => {
      // Must be a null pointer.
      assert(context === 0, 'Callback context must be null.')
      const result = callback(
        this.core.copyFromCString(kind),
        this.core.copyFromCString(data)
      )
      if (typeof result.contents === 'string') {
        this.core.copyToCString(result.contents, contents)
      }
      if (typeof result.error === 'string') {
        this.core.copyToCString(result.error, error)
      }
    }
  }

  wrapCallback(callback: Function) {
    assert(typeof callback === 'function', 'Invalid callback specified.')

    return (data: any, contents: any, error: any) => {
      const result = callback(this.core.copyFromCString(data))
      if (typeof result.contents === 'string') {
        this.core.copyToCString(result.contents, contents)
      }
      if (typeof result.error === 'string') {
        this.core.copyToCString(result.error, error)
      }
    }
  }
}
