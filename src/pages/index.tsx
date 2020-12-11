import React, { useState } from 'react'
import Head from 'next/head'
import { CheckResult, checkUrl } from '@app/fns/check'
import { CheckIcon, HeaderTableRow, StatusCodeBadge, TableRow, Spinner, ScoreRing, MissingHeadersSection } from '@app/components'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { parse as parseUrl } from 'url'
import * as qs from 'querystring'

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

interface HomeProps {
  queryUrl: string
  result?: CheckResult
}

export default function Home(props: HomeProps): JSX.Element {
  const router = useRouter()
  const [url, setUrl] = useState(props.queryUrl)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | undefined>(props.result)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setUrl(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!urlRegex.test(url)) {
      setError('Please enter a valid URL')
      return
    }

    router.push('/', `/?url=${url}`)

    setIsLoading(true)
    fetch('/api/check', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })
      .then((x) => {
        if (x.status !== 200) {
          alert("Oops, something wen't wrong. Please try again.")
          return
        }
        return x.json()
      })
      .then((x: CheckResult) => {
        setResult(x)
        setIsLoading(false)
      })
  }

  let certificateExpiryInDays: number | undefined
  if (result?.certificate?.validTo) {
    const now = Date.now()
    const expiry = new Date(result.certificate.validTo)
    const diff = expiry.getTime() - now
    certificateExpiryInDays = Math.floor(diff / (1000 * 3600 * 24))
  }

  const tweetIntent = result
    ? `My website scored ${result.score}/100 on #sitecheckdev. See the result https://sitecheck.dev?url=${result.url} and analyze your website too!`
    : ''

  return (
    <>
      <Head>
        <title>Analyze your website headers and configuration - sitecheck.dev</title>
        <meta name="description" content="Scan your website for best practices on headers and server configuration" />
        <meta property="og:title" content="Analyze your website headers and configuration - sitecheck.dev" />
        <meta property="og:url" content="https://sitecheck.dev" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sitecheck.dev/images/large-screenshot.png" />
        <meta property="og:description" content="Scan your website for best practices on headers and server configuration" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Analyze your website headers and configuration - sitecheck.dev" />
        <meta name="twitter:description" content="Scan your website for best practices on headers and server configuration" />
        <meta name="twitter:url" content="https://sitecheck.dev" />
        <meta name="twitter:image" content="https://sitecheck.dev/images/large-screenshot.png" />
      </Head>

      <section className="text-gray-700 body-font">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-col text-center w-full mb-12">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Check your site now</h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              Our scanner can help you find headers and configuration that are missing on your website.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto items-end">
            <div className="relative sm:mr-4 mb-4 sm:mb-0 flex-grow w-full">
              <label htmlFor="full-name" className={`leading-7 text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
                {error || 'Enter your website URL'}
              </label>
              <input
                value={url}
                onChange={handleUrlChange}
                type="text"
                placeholder="https://example.org"
                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <button
              type="submit"
              className="text-white bg-indigo-500 border-0 h-10 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg w-full sm:w-1/6"
            >
              {isLoading ? <Spinner className="w-6 h-6" /> : 'Check'}
            </button>
          </form>
        </div>
      </section>

      {result && (
        <>
          <section className="text-gray-700 body-font">
            <div className="container px-5 mx-auto">
              <h2 className="sm:text-2xl text-xl font-medium title-font mb-4 text-gray-900">Report</h2>
              <div className="flex flex-wrap">
                <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6">
                  <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">Score</h2>
                  <ScoreRing className="" progress={result.score} radius={70} stroke={8} />
                  <a
                    className="tweet-button mt-2"
                    target="_blank"
                    rel="noreferrer"
                    href={`http://www.twitter.com/intent/tweet?text=${encodeURIComponent(tweetIntent)}`}
                  >
                    <span>
                      <svg className="w-4 h-4 mr-1" x="0px" y="0px" viewBox="0 0 512 512">
                        <path
                          fill="white"
                          d="M512,97.248c-19.04,8.352-39.328,13.888-60.48,16.576c21.76-12.992,38.368-33.408,46.176-58.016
		c-20.288,12.096-42.688,20.64-66.56,25.408C411.872,60.704,384.416,48,354.464,48c-58.112,0-104.896,47.168-104.896,104.992
		c0,8.32,0.704,16.32,2.432,23.936c-87.264-4.256-164.48-46.08-216.352-109.792c-9.056,15.712-14.368,33.696-14.368,53.056
		c0,36.352,18.72,68.576,46.624,87.232c-16.864-0.32-33.408-5.216-47.424-12.928c0,0.32,0,0.736,0,1.152
		c0,51.008,36.384,93.376,84.096,103.136c-8.544,2.336-17.856,3.456-27.52,3.456c-6.72,0-13.504-0.384-19.872-1.792
		c13.6,41.568,52.192,72.128,98.08,73.12c-35.712,27.936-81.056,44.768-130.144,44.768c-8.608,0-16.864-0.384-25.12-1.44
		C46.496,446.88,101.6,464,161.024,464c193.152,0,298.752-160,298.752-298.688c0-4.64-0.16-9.12-0.384-13.568
		C480.224,136.96,497.728,118.496,512,97.248z"
                        />
                      </svg>
                      Tweet
                    </span>
                  </a>
                </div>
                <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6">
                  <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">HTTPS</h2>
                  <p className="flex items-top">
                    <CheckIcon positive={result.isSecure} />
                    <span>{result.isSecure ? 'Yes' : 'No'}</span>
                  </p>
                  {result.certificate && result.certificate.validTo && (
                    <p className="mt-4">
                      Certificate issued by <span className="font-medium">{result.certificate.issuerCN}</span> and is valid for{' '}
                      <span className="font-medium">{certificateExpiryInDays}</span> days.
                    </p>
                  )}
                </div>
                <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6">
                  <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">HTTP to HTTPS Redirect</h2>
                  <p className="flex items-center">
                    <CheckIcon positive={result.httpRedirect} />
                    {result.httpRedirect ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6">
                  <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">TLS</h2>
                  <div className="leading-relaxed text-base mb-4">
                    <p className="flex items-center">
                      <CheckIcon positive={!result.tls.TLSv1} />
                      <span className="font-medium mr-2">TLSv1.0:</span>
                      <span>{result.tls.TLSv1 ? 'Yes' : 'No'}</span>
                    </p>
                    <p className="flex items-center">
                      <CheckIcon positive={!result.tls['TLSv1.1']} />
                      <span className="font-medium mr-2">TLSv1.1:</span>
                      <span>{result.tls['TLSv1.1'] ? 'Yes' : 'No'}</span>
                    </p>
                    <p className="flex items-center">
                      <CheckIcon positive={result.tls['TLSv1.2']} />
                      <span className="font-medium mr-2">TLSv1.2:</span>
                      <span>{result.tls['TLSv1.2'] ? 'Yes' : 'No'}</span>
                    </p>
                    <p className="flex items-center">
                      <CheckIcon positive={result.tls['TLSv1.3']} />
                      <span className="font-medium mr-2">TLSv1.3:</span>
                      <span>{result.tls['TLSv1.3'] ? 'Yes' : 'No'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="text-gray-700 body-font">
            <div className="container px-5 mx-auto">
              <h2 className="sm:text-2xl text-xl font-medium title-font mb-4 text-gray-900">Response</h2>
              <table>
                <tbody>
                  <TableRow name="Status" content={<StatusCodeBadge statusCode={result.statusCode} />} />

                  {Object.keys(result.rawHeaders).map((key) => (
                    <HeaderTableRow key={key} name={key} value={result.rawHeaders[key]} showRecommendation={true} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <MissingHeadersSection headers={result.rawHeaders} />
        </>
      )}

      <div className="container p-5 mt-24 mx-auto border-t border-gray-300 text-center">
        This is an open source project. Help us improve it{' '}
        <a target="_blank" rel="noreferrer" href="https://github.com/goenning/sitecheck.dev">
          https://github.com/goenning/sitecheck.dev
        </a>
        .
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const u = parseUrl(req?.url || '')
  const queryUrl = qs.parse(u.query || '')?.url?.toString() || ''
  if (queryUrl) {
    try {
      const result = await checkUrl(queryUrl)
      return { props: { result, queryUrl } }
    } catch (err) {
      console.log(err)
    }
  }
  return { props: { queryUrl } }
}
