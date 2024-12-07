import { useChat } from '../contexts/ChatContext';
import ChatBot from '../components/ChatBot';

function Support() {
  const { openChat } = useChat();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Service Client Section */}
        <div className="lg:text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">Service Client</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Plusieurs moyens de nous contacter pour répondre à tous vos besoins
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Phone Support */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📞</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Téléphonique</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Notre équipe est disponible pour vous aider à trouver le logement idéal</p>
            <p className="font-medium text-primary-600">01 23 45 67 89</p>
            <p className="text-sm text-gray-500">Lun-Ven: 9h-18h</p>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">✉️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Email</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Questions générales et assistance</p>
            <p className="font-medium text-primary-600">support@seasonstay.fr</p>
            <p className="text-sm text-gray-500">Réponse sous 24h</p>
          </div>

          {/* Chat Support */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Chat en Direct</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Assistance immédiate en ligne</p>
            <p className="text-sm text-gray-500 mb-4">7j/7: 9h-20h</p>
            <button 
              onClick={openChat}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-300"
            >
              Démarrer le chat
            </button>
          </div>
        </div>

        {/* Dispute Resolution Section */}
        <div className="mt-24">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Résolution des Litiges</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Un processus transparent et efficace pour résoudre les différends
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Déclaration de Problème</h3>
              <p className="text-gray-600 leading-relaxed">
                En cas de problème, signalez-le dans les 48h suivant votre arrivée. 
                Notre système de médiation permet une résolution rapide et équitable des litiges.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Processus de Médiation</h3>
              <ul className="space-y-3">
                <li className="flex items-start bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700">Signalement du problème via la plateforme</span>
                </li>
                <li className="flex items-start bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700">Communication directe entre les parties</span>
                </li>
                <li className="flex items-start bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700">Intervention d'un médiateur si nécessaire</span>
                </li>
                <li className="flex items-start bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700">Résolution sous 5 jours ouvrés</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Garanties</h3>
              <ul className="space-y-3">
                <li className="flex items-start bg-amber-50 rounded-lg p-3">
                  <span className="text-gray-700">Remboursement possible en cas de non-conformité</span>
                </li>
                <li className="flex items-start bg-amber-50 rounded-lg p-3">
                  <span className="text-gray-700">Protection des propriétaires contre les dommages</span>
                </li>
                <li className="flex items-start bg-amber-50 rounded-lg p-3">
                  <span className="text-gray-700">Système d'assurance intégré</span>
                </li>
                <li className="flex items-start bg-amber-50 rounded-lg p-3">
                  <span className="text-gray-700">Fonds de garantie pour plus de sécurité</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust & Safety Section */}
        <div className="mt-24">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Confiance et Sécurité</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Des mesures concrètes pour garantir votre sérénité
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Système d'Évaluation</h3>
              <p className="text-gray-600 leading-relaxed">
                Après chaque séjour, les locataires et propriétaires peuvent s'évaluer mutuellement,
                contribuant à créer une communauté de confiance.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Communication Sécurisée</h3>
              <p className="text-gray-600 leading-relaxed">
                Toutes les communications passent par notre plateforme sécurisée,
                garantissant la traçabilité et la protection de vos échanges.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  )
}

export default Support
