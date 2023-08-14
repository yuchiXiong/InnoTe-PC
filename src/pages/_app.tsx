import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import 'core-js/actual/array/at';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
