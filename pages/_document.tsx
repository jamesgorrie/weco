import Document, { Head, Main, NextScript } from 'next/document'
import { Global, css } from '@emotion/core'

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@700&amp;family=Share+Tech+Mono&amp;display=swap"
            rel="stylesheet"
          />
          <Global
            styles={css`
              body {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: 'Share Tech Mono', monospace;
              }
            `}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
