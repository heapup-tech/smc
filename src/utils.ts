export function isNil(value: any): boolean {
  // Uses == over === which compares both null and undefined.
  return value == null
}
