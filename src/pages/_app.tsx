import { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import './globals.css'

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
