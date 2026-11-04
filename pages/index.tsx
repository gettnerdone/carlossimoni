import Head from 'next/head'
import { Header } from '@/components/Header'
import { StickyCallBar } from '@/components/StickyCallBar'
import { Hero } from '@/components/Hero'
import { TrustStrip } from '@/components/TrustStrip'
import { WhyMoveSection } from '@/components/WhyMoveSection'
import { WhoCarlosHelps } from '@/components/WhoCarlosHelps'
import { NeighborhoodGrid } from '@/components/NeighborhoodGrid'
import { ProcessSteps } from '@/components/ProcessSteps'
import { RelocationSupport } from '@/components/RelocationSupport'
import { Testimonials } from '@/components/Testimonials'
import { FAQSection, FAQ_ITEMS } from '@/components/FAQSection'
import { LeadForm } from '@/components/LeadForm'
import { Footer } from '@/components/Footer'
import { SITE } from '@/content/site'

const TITLE = 'Moving to Tampa? Tampa Relocation Specialist | Carlos Simoni'
const DESCRIPTION =
  "Moving to Florida from out of state? Carlos Simoni is a licensed Tampa Bay real estate agent who helps relocating buyers, retirees, remote workers, and families — including full relocation support for seniors — find the right neighborhood. Virtual tours, honest area guidance, no cost to you."

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

const agentJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: SITE.agentName,
  telephone: SITE.phoneDisplay,
  email: SITE.email,
  areaServed: { '@type': 'Place', name: SITE.areaServed },
  url: SITE.siteUrl,
  description: DESCRIPTION,
}

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={SITE.siteUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / social preview */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE.siteUrl} />
        <meta property="og:image" content={`${SITE.siteUrl}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <WhyMoveSection />
        <WhoCarlosHelps />
        <NeighborhoodGrid />
        <ProcessSteps />
        <RelocationSupport />
        <Testimonials />
        <FAQSection />

        <section id="contact" className="bg-slate-50">
          <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              Ready to talk specifics?
            </h2>
            <p className="mt-3 text-center text-lg text-slate-600">
              Tell Carlos a bit about your move and he&apos;ll personally follow up — or grab the
              free guide above if you&apos;re still in research mode.
            </p>
            <div className="mt-8">
              <LeadForm source="Bottom inquiry form" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyCallBar />
      {/* Leaves room for the mobile sticky call bar so the footer's last line isn't covered. */}
      <div className="h-14 md:hidden" aria-hidden="true" />
    </>
  )
}
