import { ISolJson } from '../types'
import { isNil } from '../utils'
import { bindSolcMethod, bindSolcMethodWithFallbackFunc } from './helpers'

export const setupCore = (solJson: ISolJson) => {
  const core = {
    alloc: bindAlloc(solJson),
    license: bindLicense(solJson),
    version: bindVersion(solJson),
    reset: bindReset(solJson)
  }
  const helpers = {
    addFunction: unboundAddFunction.bind(this, solJson),
    removeFunction: unboundRemoveFunction.bind(this, solJson),
    copyFromCString: unboundCopyFromCString.bind(this, solJson),
    copyToCString: unboundCopyToCString.bind(this, solJson, core.alloc)
  }

  return {
    ...core,
    ...helpers
  }
}

export const bindAlloc = (solJson: ISolJson) => {
  const allocBinding = bindSolcMethod(
    solJson,
    'solidity_alloc',
    'number',
    ['number'],
    null
  )

  if (isNil(allocBinding)) {
    return solJson._malloc
  }

  return allocBinding
}

export const bindLicense = (solJson: ISolJson) => {
  return bindSolcMethodWithFallbackFunc(
    solJson,
    'solidity_license',
    'string',
    [],
    'license',
    () => {}
  )
}

export const bindVersion = (solJson: ISolJson) => {
  return bindSolcMethodWithFallbackFunc(
    solJson,
    'solidity_version',
    'string',
    [],
    'version'
  )
}
export const bindReset = (solJson: ISolJson) => {
  return bindSolcMethod(solJson, 'solidity_reset', null, [], null)
}

export const unboundAddFunction = (
  solJson: ISolJson,
  func: Function,
  signature?: string
) => {
  return (solJson.addFunction || solJson.Runtime.addFunction)(func, signature)
}

export const unboundRemoveFunction = (solJson: ISolJson, ptr: number) => {
  return (solJson.removeFunction || solJson.Runtime.removeFunction)(ptr)
}

export const unboundCopyToCString = (
  solJson: ISolJson,
  alloc: Function,
  str: string,
  ptr: number
) => {
  const length = solJson.lengthBytesUTF8(str)

  const buffer = alloc(length + 1)

  solJson.stringToUTF8(str, buffer, length + 1)
  solJson.setValue(ptr, buffer, '*')
}

export const unboundCopyFromCString = (solJson: ISolJson, ptr: number) => {
  const copyFromCString = solJson.UTF8ToString || solJson.Pointer_stringify
  return copyFromCString(ptr)
}
