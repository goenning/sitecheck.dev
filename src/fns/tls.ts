import { connect, ConnectionOptions, createSecureContext } from 'tls'
import { Url } from 'url'
import { TIMEOUT } from './consts'

export enum TLSVersion {
  TLSv1 = 'TLSv1',
  TLSv1_1 = 'TLSv1.1',
  TLSv1_2 = 'TLSv1.2',
  TLSv1_3 = 'TLSv1.3',
}

export function tlsCheck(url: Url, version: TLSVersion): Promise<boolean> {
  return new Promise((resolve) => {
    const secureContext = createSecureContext({ minVersion: version, maxVersion: version })
    const opt: ConnectionOptions = {
      host: url.host || '',
      servername: url.host || '',
      port: 443,
      secureContext,
      timeout: TIMEOUT,
    }

    const socket = connect(opt, () => {
      if (!socket.authorized) {
        resolve(false)
        return
      }

      socket.end()
      resolve(true)
    })

    socket.on('error', () => resolve(false))
  })
}
