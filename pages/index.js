import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Methodology from '../components/Methodology'
import Generator from '../components/Generator'
import Watchlist from '../components/Watchlist'
import Footer from '../components/Footer'

export default function Home() {
  const [selectedInstitution, setSelectedInstitution] = useState(null)

  return (
    <>
      <Head>
        <title>Institutional Risk Index</title>
        <meta name="description" content="A machine learning system for predicting college closure risk across 1,719 four-year institutions, validated against 44 confirmed closures from 2017–2026." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <main style={{ paddingTop: 56 }}>
        <Hero />
        <Methodology />
        <Generator selectedInstitution={selectedInstitution} />
        <Watchlist setSelectedInstitution={setSelectedInstitution} />
      </main>
      <Footer />
    </>
  )
}
