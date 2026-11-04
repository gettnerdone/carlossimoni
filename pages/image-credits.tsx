import Head from 'next/head'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SITE } from '@/content/site'

const CREDITS = [
  {
    area: 'Sarasota & North Port',
    title: 'Sarasota Skyline',
    author: 'Cullen Morgan',
    license: 'CC BY 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Sarasota_Skyline.jpeg',
  },
  {
    area: 'Spring Hill',
    title: 'Spring Hill, Florida Gateway @ US 19',
    author: 'DanTD',
    license: 'CC BY-SA 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Spring_Hill,_Florida_Gateway_@_US_19.jpg',
  },
  {
    area: 'Lakeland',
    title: 'Lake Mirror Lakeland Florida September 2024',
    author: 'Trevorrrrvalent',
    license: 'CC BY 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Lake_Mirror_Lakeland_Florida_September_2024.jpg',
  },
  {
    area: 'Plant City',
    title: 'Plant City FL Downtown Comm Dist05',
    author: 'Ebyabe',
    license: 'CC BY-SA 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Plant_City_FL_Downtown_Comm_Dist05.JPG',
  },
  {
    area: 'FishHawk Ranch & Valrico',
    title: 'Alafia River at FishHawk, Florida',
    author: 'JaconaFrere',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Alafia_River_at_FishHawk,_Florida.JPG',
  },
] as const

export default function ImageCredits() {
  return (
    <>
      <Head>
        <title>Image Credits | {SITE.agentName}</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <Header />
      <main className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Image credits</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Licensed photographs are hosted locally for reliability and have been cropped and
            resized for this site. Other neighborhood images are original, AI-generated
            representative scenes and are not photographs of a specific property.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-200">
              {CREDITS.map((credit) => (
                <li key={credit.area} className="p-5">
                  <p className="font-semibold text-slate-900">{credit.area}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    <a
                      href={credit.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900"
                    >
                      {credit.title}
                    </a>{' '}
                    by {credit.author} · {credit.license} · cropped and resized
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <a href="/" className="mt-8 inline-block font-semibold text-blue-700 hover:text-blue-900">
            ← Back to the relocation guide
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
