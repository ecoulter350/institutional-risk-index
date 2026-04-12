import Head from 'next/head'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Methodology from '../components/Methodology'
import Generator from '../components/Generator'
import Watchlist from '../components/Watchlist'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>Institutional Risk Index</title>
        <meta name="description" content="A machine learning system for predicting college closure risk across 1,728 four-year institutions, validated against 31 confirmed closures from 2019–2025." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <main style={{ paddingTop: 56 }}>
        <Hero />
        <Methodology />
        <Generator />
        <Watchlist />
      </main>
      <Footer />
    </>
  )
}
