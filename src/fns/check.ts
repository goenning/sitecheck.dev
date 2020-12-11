import * as http from 'http'
import * as https from 'https'
import { tlsCheck, TLSVersion } from './tls'
import { parse as parseUrl, UrlWithStringQuery } from 'url'
import { TIMEOUT } from './consts'
import { TLSSocket } from 'tls'

const httpAgent = new http.Agent({})
const httpsAgent = new https.Agent({ maxCachedSessions: 0 })

const scoreTable = {
  https: 20,
  httpToHttpsRedirect: 10,
  'tls1.0': 10,
  'tls1.2': 10,
  hsts: 20,
  csp: 10,
  xcto: 10,
  xfo: 10,
}

interface Certificate {
  issuerCN: string
  validFrom: string
  validTo: string
}

export interface Response {
  statusCode: number
  certificate: Certificate | undefined
  header: http.IncomingHttpHeaders
}

function httpRedirectsToHTTPS(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const httpUrl = url.replace('https://', 'http://')
    const req = http.get(httpUrl, (res) => {
      const statusCode = res.statusCode || 0
      const isRedirect = statusCode >= 300 && statusCode <= 399
      const locationIsSecure = res.headers.location?.startsWith('https://') || false
      resolve(isRedirect && locationIsSecure)
    })

    req.on('error', (e) => reject(e))
    req.end()
  })
}

function extractCertificate(response: http.IncomingMessage): Certificate | undefined {
  const socket = response.socket as TLSSocket
  if ('getPeerCertificate' in socket) {
    const cert = socket.getPeerCertificate()
    return {
      issuerCN: cert.issuer?.CN,
      validTo: cert.valid_to,
      validFrom: cert.valid_from,
    }
  }

  return undefined
}

function getResponse(url: UrlWithStringQuery): Promise<Response> {
  return new Promise((resolve, reject) => {
    const isSecure = url.protocol === 'https:'
    const get = isSecure ? https.get : http.get
    const opts: http.RequestOptions = {
      ...url,
      agent: isSecure ? httpsAgent : httpAgent,
      headers: {
        Connection: 'close',
      },
      timeout: TIMEOUT,
    }

    const req = get(opts, (res) => {
      const cert = extractCertificate(res)
      resolve({ header: res.headers, statusCode: res.statusCode || 0, certificate: cert })
    })
    req.on('error', (e) => reject(e))
    req.end()
  })
}

export interface CheckResult {
  url: string
  isSecure: boolean
  score: number
  httpRedirect: boolean
  statusCode: number
  rawHeaders: http.IncomingHttpHeaders
  certificate: Certificate | undefined
  tls: {
    [TLSVersion.TLSv1]: boolean
    [TLSVersion.TLSv1_1]: boolean
    [TLSVersion.TLSv1_2]: boolean
    [TLSVersion.TLSv1_3]: boolean
  }
}

function calculateScore(result: CheckResult): number {
  let score = 0
  if (result.isSecure) {
    score += scoreTable.https
  }
  if (result.httpRedirect) {
    score += scoreTable.httpToHttpsRedirect
  }
  if (result.tls['TLSv1'] === false) {
    score += scoreTable['tls1.0']
  }
  if (result.tls['TLSv1.2'] === true) {
    score += scoreTable['tls1.2']
  }
  if ('content-security-policy' in result.rawHeaders) {
    score += scoreTable.csp
  }
  if ('strict-transport-security' in result.rawHeaders) {
    score += scoreTable.hsts
  }
  if ('x-content-type-options' in result.rawHeaders) {
    score += scoreTable.xcto
  }
  if ('x-frame-options' in result.rawHeaders) {
    score += scoreTable.xfo
  }
  return score
}

export async function checkUrl(url: string): Promise<CheckResult> {
  const u = parseUrl(url)
  const isSecure = u.protocol === 'https:'

  const values = await Promise.all([
    getResponse(u),
    httpRedirectsToHTTPS(url),
    tlsCheck(u, TLSVersion.TLSv1),
    tlsCheck(u, TLSVersion.TLSv1_1),
    tlsCheck(u, TLSVersion.TLSv1_2),
    tlsCheck(u, TLSVersion.TLSv1_3),
  ])

  const result: CheckResult = {
    url,
    isSecure,
    score: 0,
    statusCode: values[0].statusCode,
    certificate: values[0].certificate,
    rawHeaders: values[0].header,
    httpRedirect: values[1],
    tls: {
      [TLSVersion.TLSv1]: values[2],
      [TLSVersion.TLSv1_1]: values[3],
      [TLSVersion.TLSv1_2]: values[4],
      [TLSVersion.TLSv1_3]: values[5],
    },
  }

  result.score = calculateScore(result)
  return result
}
