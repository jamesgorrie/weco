
import { Global, css } from '@emotion/react'

const App = ({ Component, pageProps }) => (
  <>
    <Global
      styles={css`
        body {
          box-sizing: border-box;
          padding: '10px';
          margin: '10px';
          font-family: 'Share Tech Mono', monospace;
          background: papayawhip;
        }
      `}
    />
    <Component {...pageProps} />
  </>
)

export default App


