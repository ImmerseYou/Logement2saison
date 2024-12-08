import { Link } from 'react-router-dom'
import { MapPinIcon, HomeIcon, ShieldCheckIcon, UserGroupIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { useRef } from 'react'
import { getAssetPath } from '../utils/assetPath';

const features = [
  {
    name: 'Localisation stratégique',
    description: 'Trouvez des logements proches de votre lieu de travail saisonnier',
    icon: MapPinIcon,
  },
  {
    name: 'Logements vérifiés',
    description: 'Tous nos logements sont contrôlés et labellisés pour votre confort',
    icon: HomeIcon,
  },
  {
    name: 'Réservation sécurisée',
    description: 'Paiement sécurisé et assistance 24/7 pendant votre séjour',
    icon: ShieldCheckIcon,
  },
]

export default function Home() {
  const featuresSectionRef = useRef(null)

  const scrollToFeatures = () => {
    featuresSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Video Hero section */}
      <div className="relative h-screen">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover"
            style={{ pointerEvents: 'none' }}
            preload="metadata"
            loading="eager"
          >
            <source src={getAssetPath('videos/ski-resort.mp4')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block">Trouvez votre logement</span>
            <span className="block mt-2">pour la saison</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-center text-xl text-gray-200 sm:max-w-3xl">
            Logement2saison vous aide à trouver le logement idéal pour votre travail saisonnier.
            Des solutions adaptées à vos besoins, validées par nos experts.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/search"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-white/30 hover:text-white hover:border-white transition-all duration-300"
            >
              Rechercher
            </Link>
            <button
              onClick={scrollToFeatures}
              className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/30 transition-all duration-300"
            >
              Comment ça marche
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDownIcon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div ref={featuresSectionRef} className="py-16 bg-gray-50 overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Une solution simple pour votre logement saisonnier
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Nous simplifions la recherche de logement pour les travailleurs saisonniers
              avec des solutions adaptées et sécurisées.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                Des logements de qualité pour tous les saisonniers
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Nous sélectionnons rigoureusement chaque logement pour vous garantir
                confort et tranquillité pendant votre séjour professionnel.
              </p>

              <dl className="mt-10 space-y-10">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0">
              <img
                className="relative mx-auto rounded-lg shadow-lg"
                src={getAssetPath('images/Logementpieces.png')}
                alt="Intérieur d'un logement"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Impact section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Notre Impact
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
              Logement2saison s'engage pour un impact positif sur la société, l'économie locale et l'environnement
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Impact Social */}
              <div className="bg-primary-50 rounded-lg p-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                  <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 text-center">Impact Social</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600">
                      Amélioration des conditions de vie des travailleurs saisonniers
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600">
                      Facilitation de la mobilité et de l'accès à l'emploi
                    </p>
                  </div>
                </div>
              </div>

              {/* Soutien Économique */}
              <div className="bg-primary-50 rounded-lg p-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                  <CurrencyEuroIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 text-center">Soutien Économique</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600">
                      Renforcement des entreprises locales par la stabilisation de la main-d'œuvre
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600">
                      Dynamisation de l'économie régionale
                    </p>
                  </div>
                </div>
              </div>

              {/* Développement Durable */}
              <div className="bg-primary-50 rounded-lg p-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 text-center">Développement Durable</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600">
                      Promotion de pratiques responsables en matière de logement
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600">
                      Optimisation énergétique des logements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/about"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              En savoir plus sur notre impact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
