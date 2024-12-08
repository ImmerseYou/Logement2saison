import React, { useState, useEffect } from 'react';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { MapPinIcon, BanknotesIcon, HomeIcon } from '@heroicons/react/20/solid';

const Reservations = () => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('reservations');

  // Charger les favoris depuis le localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fonction pour retirer un favori
  const removeFavorite = (propertyId) => {
    const newFavorites = favorites.filter(fav => fav.id !== propertyId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Onglets */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          className={`pb-4 px-4 text-sm font-medium ${
            activeTab === 'reservations'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('reservations')}
        >
          Mes réservations
        </button>
        <button
          className={`pb-4 px-4 text-sm font-medium flex items-center space-x-2 ${
            activeTab === 'favorites'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('favorites')}
        >
          <HeartOutline className={`h-5 w-5 ${
            activeTab === 'favorites' ? 'text-primary-500' : 'text-gray-400'
          }`} />
          <span>Mes favoris</span>
          {favorites.length > 0 && (
            <span className="ml-2 bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full text-xs">
              {favorites.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'reservations' ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Mes réservations</h2>
          <p className="text-gray-500">Vous n'avez pas encore de réservation.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Mes favoris</h2>
            <span className="text-sm text-gray-500">
              {favorites.length} logement{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
            </span>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <HeartOutline className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun favori</h3>
              <p className="mt-2 text-gray-500">
                Vous n'avez pas encore sauvegardé de logement dans vos favoris.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeFavorite(property.id)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-200 shadow-md"
                    >
                      <HeartSolid className="h-5 w-5 text-red-500" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        <span>Localisation</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <BanknotesIcon className="h-5 w-5 mr-2" />
                        <span>{property.price}€/mois</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <HomeIcon className="h-5 w-5 mr-2" />
                        <span>{property.surface}m²</span>
                      </div>
                    </div>

                    <button
                      className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      onClick={() => {
                        // Ajouter la logique pour voir les détails ou contacter le propriétaire
                      }}
                    >
                      Voir les détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reservations;
