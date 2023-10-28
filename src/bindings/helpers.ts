import {
  ISolJson,
  SolJsonMethod,
  SolJsonMethodArgs,
  SolJsonMethodReturn
} from '../types'
import { isNil } from '../utils'

export const bindSolcMethod = (
  solJson: ISolJson,
  method: SolJsonMethod,
  returnType: SolJsonMethodReturn,
  args: SolJsonMethodArgs = [],
  defaultValue?: any
) => {
  if (isNil(solJson[`_${method}`]) && defaultValue !== undefined) {
    return defaultValue
  }
  return solJson.cwrap(method, returnType, args)
}

export const bindSolcMethodWithFallbackFunc = (
  solJson: ISolJson,
  method: SolJsonMethod,
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
