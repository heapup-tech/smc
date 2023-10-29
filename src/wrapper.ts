import { Compiler } from './bindings/compiler'
import { CompilerCore } from './bindings/core'
import { ISolJson } from './types'
import * as soljson from '../soljson'
import { setupBindings } from './bindings'
import { isNil } from './utils'
import { formatFatalError } from './formatters'
import translate from './translate'

const solJson = soljson as ISolJson
const Module = module.constructor as any

export const wrapper = (soljson: ISolJson) => {
  const { core, compiler, methodFlags } = setupBindings(solJson)

  return {
    version: core.version,
    semver: core.versionToSemver,
    license: core.license,
    lowlevel: {
      compileSingle: compiler.compileJson,
      compileMulti: compiler.compileJsonMulti,
      compileCallback: compiler.compileJsonCallback,
      compileStandard: compiler.compileStandard
    },
    features: {
      legacySingleInput: methodFlags.compileJsonStandardSupported,
      multipleInputs:
        methodFlags.compileJsonMultiSupported ||
        methodFlags.compileJsonStandardSupported,
      importCallback:
        methodFlags.compileJsonCallbackSuppported ||
        methodFlags.compileJsonStandardSupported,
      nativeStandardJSON: methodFlags.compileJsonStandardSupported
    },
    compile: compileStandardWrapper.bind(this, compiler),
    // Loads the compiler of the given version from the github repository
    // instead of from the local filesystem.
    loadRemoteVersion,
    // Use this if you want to add wrapper functions around the pure module.
    setupMethods: wrapper
  }
}

async function loadRemoteVersion(versionString: string, callback: any) {
  const url = `https://binaries.soliditylang.org/bin/soljson-${versionString}.js`

  const response = await fetch(url)
  if (response.status !== 200) {
    callback(new Error(`Error retrieving binary: ${response.statusText}`))
  } else {
    const soljson = new Module()
    soljson._compile(response.arrayBuffer, `soljson-${versionString}.js`)
    // @ts-ignore
    if (module.parent && module.parent.children) {
      // Make sure the module is plugged into the hierarchy correctly to have parent
      // properly garbage collected.
      // @ts-ignore
      module.parent.children.splice(module.parent.children.indexOf(soljson), 1)
    }

    callback(null, wrapper(soljson.exports))
  }
}

// Expects a Standard JSON I/O but supports old compilers
// @ts-ignore
function compileStandardWrapper(compile, inputRaw, readCallback) {
  if (!isNil(compile.compileStandard)) {
    return compile.compileStandard(inputRaw, readCallback)
  }

  let input: { language: string; sources: any[]; settings: any }

  try {
    input = JSON.parse(inputRaw)
  } catch (e) {
    // @ts-ignore
    return formatFatalError(`Invalid JSON supplied: ${e.message}`)
  }

  if (input.language !== 'Solidity') {
    return formatFatalError('Only "Solidity" is supported as a language.')
  }

  // NOTE: this is deliberately `== null`
  if (isNil(input.sources) || input.sources.length === 0) {
    return formatFatalError('No input sources specified.')
  }

  const sources = translateSources(input)
  const optimize = isOptimizerEnabled(input)
  const libraries = librariesSupplied(input)

  // @ts-ignore
  if (isNil(sources) || Object.keys(sources).length === 0) {
    return formatFatalError('Failed to process sources.')
  }

  // Try to wrap around old versions
  if (!isNil(compile.compileJsonCallback)) {
    const inputJson = JSON.stringify({ sources: sources })
    const output = compile.compileJsonCallback(
      inputJson,
      optimize,
      readCallback
    )
    return translateOutput(output, libraries)
  }

  if (!isNil(compile.compileJsonMulti)) {
    const output = compile.compileJsonMulti(
      JSON.stringify({ sources: sources }),
      optimize
    )
    return translateOutput(output, libraries)
  }

  // Try our luck with an ancient compiler
  if (!isNil(compile.compileJson)) {
    // @ts-ignore
    if (Object.keys(sources).length > 1) {
      return formatFatalError(
        'Multiple sources provided, but compiler only supports single input.'
      )
    }
    // @ts-ignore
    const input = sources[Object.keys(sources)[0]]
    const output = compile.compileJson(input, optimize)
    return translateOutput(output, libraries)
  }

  return formatFatalError('Compiler does not support any known interface.')
}
function isOptimizerEnabled(input: any) {
  return (
    input.settings &&
    input.settings.optimizer &&
    input.settings.optimizer.enabled
  )
}

function translateSources(input: { sources: any[] }) {
  const sources = {}

  for (const source in input.sources) {
    if (input.sources[source].content !== null) {
      // @ts-ignore
      sources[source] = input.sources[source].content
    } else {
      // force failure
      return null
    }
  }

  return sources
}

function librariesSupplied(input: any) {
  // @ts-ignore
  if (!isNil(input.settings)) return input.settings.libraries
}

function translateOutput(outputRaw: string, libraries: string) {
  let parsedOutput

  try {
    parsedOutput = JSON.parse(outputRaw)
  } catch (e: any) {
    return formatFatalError(`Compiler returned invalid JSON: ${e.message}`)
  }

  const output = translate.translateJsonCompilerOutput(parsedOutput, libraries)

  if (isNil(output)) {
    return formatFatalError('Failed to process output.')
  }

  return JSON.stringify(output)
}

wrapper(solJson)
