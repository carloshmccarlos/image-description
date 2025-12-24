import Link from 'next/link'
import { getI18n } from '@/lib/i18n/server'

export default async function LandingPage() {
  const { messages } = await getI18n()
  const hero = messages.landing

  return (
    <div className='flex flex-col items-center'>
      <section className='py-20 px-6 text-center max-w-5xl mx-auto'>
        <div className='inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary rounded-full'>
          {hero.heroBadge}
        </div>
        <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-slate-900'>
          {hero.heroTitle} <br />
          <span className='text-primary'>{hero.heroHighlight}</span>
        </h1>
        <p className='text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed'>
          {hero.heroDescription}
        </p>
        <div className='flex flex-wrap gap-4 justify-center'>
          <Link
            href='/analyze'
            className='bg-primary text-white px-10 py-4 rounded-full text-lg font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95'
          >
            {hero.primaryCta}
          </Link>
          <button className='bg-white border border-slate-200 text-slate-900 px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all'>
            {hero.secondaryCta}
          </button>
        </div>
      </section>

      <div className='w-full max-w-6xl px-6 pb-32'>
        <div className='relative group'>
          <div className='absolute -inset-1 bg-gradient-to-r from-primary to-indigo-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200'></div>
          <div className='relative bg-white rounded-[2rem] p-3 shadow-2xl border border-slate-100 overflow-hidden'>
            <img
              src='https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop'
              alt='Learner exploring AI powered image descriptions'
              className='w-full rounded-[1.5rem]'
            />
          </div>
        </div>
      </div>

      <section className='w-full bg-slate-50 py-24'>
        <div className='max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-12'>
          {hero.features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className='flex flex-col items-center text-center'>
      <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 border border-slate-100'>
        {icon}
      </div>
      <h3 className='text-xl font-bold mb-3 text-slate-900'>{title}</h3>
      <p className='text-slate-600 leading-relaxed'>{description}</p>
    </div>
  )
}
