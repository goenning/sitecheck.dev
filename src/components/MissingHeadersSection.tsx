import React from 'react'
import { TableRow } from './TableRow'
import type { IncomingHttpHeaders } from 'http'

interface MissingHeadersSectionProps {
  headers: IncomingHttpHeaders
}

export function MissingHeadersSection(props: MissingHeadersSectionProps): JSX.Element | null {
  const hasCSP = 'content-security-policy' in props.headers
  const hasHSTS = 'strict-transport-security' in props.headers
  const hasContentTypeOptions = 'x-content-type-options' in props.headers
  const hasFrameOptions = 'x-frame-options' in props.headers

  if (hasCSP && hasHSTS && hasContentTypeOptions && hasFrameOptions) {
    return null
  }

  return (
    <section className="text-gray-700 body-font mt-12">
      <div className="container px-5 mx-auto">
        <h2 className="sm:text-2xl text-xl font-medium title-font mb-4 text-gray-900">Missing Headers</h2>
        <p className="mb-6">We have identified a few headers that are missing from your website and are recommended.</p>
        <table>
          <tbody>
            {!hasCSP && (
              <TableRow
                name="content-security-policy"
                type="bad"
                content={
                  <>
                    Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks and it&apos;s highly
                    recommended to be configured.{' '}
                    <a className="text-xs whitespace-nowrap" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" rel="noreferrer" target="_blank">
                      Learn more →
                    </a>
                  </>
                }
              />
            )}
            {!hasContentTypeOptions && (
              <TableRow
                name="x-content-type-options"
                type="bad"
                content={
                  <>
                    This header prevents the browser from trying to sniff the MIME type and it should just use the media types advertised by the Content-Type
                    header. <span className="font-medium">X-Content-Type-Options: nosniff</span> is the only option available.{' '}
                    <a
                      className="text-xs whitespace-nowrap"
                      href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Learn more →
                    </a>
                  </>
                }
              />
            )}
            {!hasFrameOptions && (
              <TableRow
                name="x-frame-options"
                type="bad"
                content={
                  <>
                    Sites can use this to avoid click-jacking attacks, by ensuring that their content is not embedded into other sites. Use{' '}
                    <span className="font-medium">X-Frame-Options: SAMEORIGIN</span> for best protection.{' '}
                    <a
                      className="text-xs whitespace-nowrap"
                      href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Learn more →
                    </a>
                  </>
                }
              />
            )}
            {!hasHSTS && (
              <TableRow
                name="strict-transport-security"
                type="bad"
                content={
                  <>
                    HTTP Strict-Transport-Security (HSTS) tell a browser that your site should only be accessed using HTTPS instead of HTTP.{' '}
                    <a
                      className="text-xs whitespace-nowrap"
                      href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Learn more →
                    </a>{' '}
                  </>
                }
              />
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
