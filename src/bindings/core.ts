import translate from '../translate'
import { ISolJson } from '../types'
import { isNil } from '../utils'
import { bindSolcMethod, bindSolcMethodWithFallbackFunc } from './helpers'

export class CompilerCore {
  private solJson: ISolJson

  public alloc
  public license
  public version
  public reset
  public isVersion6OrNewer = true

  constructor(solJson: ISolJson) {
    this.solJson = solJson

    this.alloc = this.bindAlloc()
    this.license = this.bindLicense()
    this.version = this.bindVersion()
    this.reset = this.bindReset()
  }

  bindAlloc() {
    const allocBinding = bindSolcMethod(
      this.solJson,
      'solidity_alloc',
      'number',
      ['number'],
      null
    )

    if (isNil(allocBinding)) {
      return this.solJson._malloc
    }

    return allocBinding
  }

  bindLicense() {
    return bindSolcMethodWithFallbackFunc(
      this.solJson,
      'solidity_license',
      'string',
      [],
      'license',
      () => {}
    )
  }

  bindVersion() {
    return bindSolcMethodWithFallbackFunc(
      this.solJson,
      'solidity_version',
      'string',
      [],
      'version'
    )
  }
  bindReset() {
    return bindSolcMethod(this.solJson, 'solidity_reset', null, [], null)
  }

  addFunction(func: Function, signature?: string) {
    return (this.solJson.addFunction || this.solJson.Runtime.addFunction)(
      func,
      signature
    )
  }

  removeFunction(ptr: number) {
    return (this.solJson.removeFunction || this.solJson.Runtime.removeFunction)(
      ptr
    )
  }

  copyToCString(str: string, ptr: number) {
    const length = this.solJson.lengthBytesUTF8(str)

    const buffer = this.alloc(length + 1)

    this.solJson.stringToUTF8(str, buffer, length + 1)
    this.solJson.setValue(ptr, buffer, '*')
  }

  copyFromCString(ptr: number) {
    const copyFromCString =
      this.solJson.UTF8ToString || this.solJson.Pointer_stringify
    return copyFromCString(ptr)
  }

  versionToSemver(version: string) {
    return translate.versionToSemver.bind(this, version)
  }
}
