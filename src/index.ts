import { wrapper } from './wrapper'
import * as soljson from '../soljson'
import { ISolJson } from './types'

const solJson = soljson as ISolJson

export default wrapper(solJson)
