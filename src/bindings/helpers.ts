import {
  ISolJson,
  SolJsonMethodName,
  SolJsonMethodArgs,
  SolJsonMethodReturn
} from '../types'
import { isNil } from '../utils'

export const bindSolcMethod = (
  solJson: ISolJson,
  method: SolJsonMethodName,
  returnType: SolJsonMethodReturn,
  args: SolJsonMethodArgs = [],
  defaultValue?: any
): Function => {
  if (isNil(solJson[`_${method}`]) && defaultValue !== undefined) {
    return defaultValue
  }
  return solJson.cwrap(method, returnType, args)
}

export const bindSolcMethodWithFallbackFunc = (
  solJson: ISolJson,
  method: SolJsonMethodName,
  returnType: SolJsonMethodReturn,
  args: SolJsonMethodArgs,
  fallbackMethod: string,
  finalFallback?: Function
) => {
  const methodFunc = bindSolcMethod(solJson, method, returnType, args, null)

  if (!isNil(methodFunc)) {
    return methodFunc
  }

  return bindSolcMethod(
    solJson,
    fallbackMethod,
    returnType,
    args,
    finalFallback
  )
}

const anyMethodExists = (solJson: ISolJson, ...names: string[]) => {
  return names.some((name) => !isNil(solJson[`_${name}`]))
}

export const getSupportedMethods = (solJson: ISolJson) => {
  return {
    licenseSupported: anyMethodExists(solJson, 'solidity_license'),
    versionSupported: anyMethodExists(solJson, 'solidity_version'),
    allocSupported: anyMethodExists(solJson, 'solidity_alloc'),
    resetSupported: anyMethodExists(solJson, 'solidity_reset'),
    compileJsonSupported: anyMethodExists(solJson, 'compileJSON'),
    compileJsonMultiSupported: anyMethodExists(solJson, 'compileJSONMulti'),
    compileJsonCallbackSuppported: anyMethodExists(
      solJson,
      'compileJSONCallback'
    ),
    compileJsonStandardSupported: anyMethodExists(
      solJson,
      'compileStandard',
      'solidity_compile'
    )
  }
}
