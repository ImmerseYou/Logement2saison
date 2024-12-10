import { BuildingOffice2Icon, HomeModernIcon, WrenchScrewdriverIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { getAssetPath } from '../utils/assetPath';

const partners = {
  institutional: [
    {
      name: "Action Logement",
      logo: "/logos/Action-logement.png",
      description: "Acteur majeur du logement social en France, Action Logement s'engage à nos côtés pour faciliter l'accès au logement des travailleurs saisonniers.",
      link: "https://www.actionlogement.fr"
    },
    {
      name: "CCI France",
      logo: "/logos/CCI-France.avif",
      description: "La Chambre de Commerce et d'Industrie soutient notre initiative en facilitant les connexions avec les entreprises locales.",
      link: "https://www.cci.fr"
    }
  ],
  services: [
    {
      name: "CleanHome Pro",
      type: "Entretien",
      description: "Service d'entretien professionnel pour les logements entre deux locations.",
    },
    {
      name: "SeasonJob",
      type: "Recrutement",
      description: "Agence spécialisée dans le recrutement de travailleurs saisonniers.",
    },
    {
      name: "HomeCheck",
      type: "Certification",
      description: "Expert en certification et validation des normes de logement.",
    }
  ]
}

function SolidaryOwners() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[300px]">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src={getAssetPath('images/Partenaire-image.png')}
          alt="Bannière partenaires"
        />
        {/* Overlay gradient plus sombre */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl drop-shadow-lg">
              Partenaires Solidaires
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-white drop-shadow-lg">
              Ensemble, construisons une solution durable pour le logement saisonnier
            </p>
          </div>
        </div>
      </div>

      {/* Notre Mission */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">Notre écosystème de partenaires</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Logements 2 Saisons s'appuie sur un réseau de partenaires de confiance pour offrir une solution complète 
            aux propriétaires et aux travailleurs saisonniers.
          </p>
        </div>

        {/* Partenaires Institutionnels */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Partenaires Institutionnels</h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {partners.institutional.map((partner) => (
              <div key={partner.name} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-8">
                  <div className="flex items-center">
                    <div className="w-40 h-16 flex items-center justify-center bg-gray-50 rounded-lg">
                      <img 
                        src={getAssetPath(partner.logo)} 
                        alt={partner.name} 
                        className="max-h-full w-auto object-contain"
                      />
                    </div>
                    <h4 className="ml-6 text-xl font-semibold text-gray-900">{partner.name}</h4>
                  </div>
                  <p className="mt-6 text-gray-600 leading-relaxed">{partner.description}</p>
                  <a
                    href={partner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300"
                  >
                    En savoir plus →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Partenaires */}
        <div className="mt-24">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Services Partenaires</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Des services professionnels pour une expérience optimale
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {partners.services.map((service) => (
              <div key={service.name} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500">{service.type}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Avantages */}
        <div className="mt-24">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Nos engagements envers les partenaires</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Des avantages exclusifs pour une collaboration fructueuse
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <BuildingOffice2Icon className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Visibilité Premium</h4>
              <p className="text-gray-600 leading-relaxed">Mise en avant de votre marque sur notre plateforme et nos supports de communication</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <HomeModernIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Accès Prioritaire</h4>
              <p className="text-gray-600 leading-relaxed">Accès exclusif à notre base de données de logements et de saisonniers</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Réseau Qualifié</h4>
              <p className="text-gray-600 leading-relaxed">Mise en relation avec un réseau de professionnels du secteur</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Support Dédié</h4>
              <p className="text-gray-600 leading-relaxed">Accompagnement personnalisé et support technique prioritaire</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-primary-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Devenez partenaire Logements 2 Saisons
                </h3>
                <p className="mt-3 text-lg text-primary-100">
                  Rejoignez notre réseau de partenaires et participez à la transformation du logement saisonnier.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <a
                    href="mailto:partenaires@Logements2Saisons.fr"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
                  >
                    Contactez-nous
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolidaryOwners
