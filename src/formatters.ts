export function formatFatalError(message: string) {
  return JSON.stringify({
    errors: [
      {
        type: 'JSONError',
        component: 'solcjs',
        severity: 'error',
        message: message,
        formattedMessage: 'Error: ' + message
      }
    ]
  })
}
