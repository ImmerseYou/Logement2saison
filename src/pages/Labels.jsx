import { HomeIcon, HeartIcon, CheckBadgeIcon, StarIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const labelFeatures = {
  solidaire: [
    "Tarifs mensuels 20% en dessous du marché local",
    "Engagement sur la durée de la saison complète",
    "Pas de frais d'agence ni de dossier",
    "Processus de réservation simplifié",
    "Priorité aux travailleurs saisonniers"
  ],
  qualite: [
    "Inspection complète du logement",
    "Équipements et mobilier adaptés",
    "Isolation thermique performante",
    "Proximité des transports",
    "Service de maintenance réactif"
  ]
}

function Labels() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[300px]">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/images/Labels-Garden.jpg"
          alt="Bannière labels"
        />
        {/* Overlay gradient plus sombre */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl drop-shadow-lg">
              Labels et Certifications
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-white drop-shadow-lg">
              Découvrez nos labels qui garantissent qualité, confort et engagement solidaire pour le logement saisonnier.
            </p>
          </div>
        </div>
      </div>

      {/* Labels Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">Nos Labels de Qualité</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Des certifications qui garantissent les meilleurs standards pour les propriétaires et les saisonniers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Label Solidaire */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <HeartIcon className="h-8 w-8 text-rose-600" />
                </div>
                <h2 className="ml-4 text-2xl font-bold text-gray-900">Label Solidaire</h2>
              </div>
              <p className="mt-6 text-gray-600 leading-relaxed">
                Notre label "Logement Solidaire" récompense les propriétaires qui s'engagent à proposer des tarifs abordables
                aux travailleurs saisonniers, contribuant ainsi à une économie locale plus inclusive.
              </p>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Avantages du label</h3>
                <ul className="space-y-4">
                  {labelFeatures.solidaire.map((feature, index) => (
                    <li key={index} className="flex items-start bg-rose-50 rounded-lg p-3">
                      <CheckBadgeIcon className="h-6 w-6 text-rose-500 flex-shrink-0" />
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/solidary-owners"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors duration-300"
                >
                  Devenir propriétaire solidaire
                </Link>
              </div>
            </div>
          </div>

          {/* Label Qualité */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <StarIcon className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="ml-4 text-2xl font-bold text-gray-900">Label Qualité Saisonnier</h2>
              </div>
              <p className="mt-6 text-gray-600 leading-relaxed">
                Notre certification "Qualité Saisonnier" garantit des standards élevés de confort et d'équipement,
                spécialement adaptés aux besoins des travailleurs saisonniers.
              </p>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Critères de qualité</h3>
                <ul className="space-y-4">
                  {labelFeatures.qualite.map((feature, index) => (
                    <li key={index} className="flex items-start bg-amber-50 rounded-lg p-3">
                      <CheckBadgeIcon className="h-6 w-6 text-amber-500 flex-shrink-0" />
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <button
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-amber-600 hover:bg-amber-700 transition-colors duration-300"
                >
                  Faire certifier mon logement
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="mt-24">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Comment obtenir nos labels ?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Un processus simple et transparent pour valoriser votre bien
            </p>
          </div>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* Étape 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Candidature</h3>
              <p className="text-gray-600 leading-relaxed">
                Remplissez notre formulaire en ligne détaillant votre logement et le label souhaité.
              </p>
            </div>
            {/* Étape 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Évaluation</h3>
              <p className="text-gray-600 leading-relaxed">
                Nos experts évaluent votre logement selon les critères du label choisi.
              </p>
            </div>
            {/* Étape 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Certification</h3>
              <p className="text-gray-600 leading-relaxed">
                Obtenez votre certification et bénéficiez de tous les avantages de nos labels.
              </p>
            </div>
          </div>
        </div>

        {/* Partenaires Institutionnels Section */}
        <div className="mt-24">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Partenaires Institutionnels</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Action Logement */}
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <div className="bg-white w-full flex justify-center items-center">
                <img
                  src="/logos/action-logement.svg"
                  alt="Action Logement"
                  className="h-24 object-contain mb-6"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Action Logement</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Acteur majeur du logement social en France, Action Logement s'engage à nos côtés pour faciliter l'accès au logement des travailleurs saisonniers.
              </p>
            </div>

            {/* CCI France */}
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <div className="bg-white w-full flex justify-center items-center">
                <img
                  src="/logos/cci-france.svg"
                  alt="CCI France"
                  className="h-24 object-contain mb-6"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">CCI France</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                La Chambre de Commerce et d'Industrie soutient notre initiative en facilitant les connexions avec les entreprises locales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Labels
