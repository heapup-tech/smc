export function isNil(value: any): boolean {
  // Uses == over === which compares both null and undefined.
  return value == null
}
export function isObject(value: any): boolean {
  // typeof [] will result in an 'object' so this additionally uses Array.isArray
  // to confirm it's just an object.
  return typeof value === 'object' && !Array.isArray(value)
}
