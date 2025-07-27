// pages/_app.tsx
import type { AppProps } from 'next/app'
import '../styles/global.css'
import '../styles/HomePage.css'
import '../styles/CategoryPage.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}