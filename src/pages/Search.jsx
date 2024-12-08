import React, { useState, useEffect, Fragment, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Combobox, Transition } from '@headlessui/react'
import { 
  MapPinIcon,
  CheckIcon,
  ChevronUpDownIcon,
  HomeIcon, 
  BanknotesIcon, 
  BuildingOfficeIcon, 
  BuildingStorefrontIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/20/solid'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Icon } from 'leaflet'
import { getCurrentPosition, reverseGeocode, findNearbyProperties, geocodeAddress } from '../services/geolocation'
import { getDistance } from 'geolib'
import 'leaflet/dist/leaflet.css'
import '../styles/map.css'
import axios from 'axios';
import { Dialog, Transition as HeadlessTransition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { properties as mockProperties } from '../data/properties'
import { debounce } from 'lodash'
import MapUpdater from '../components/MapUpdater';

// Correction pour l'icône de marker par défaut de Leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône rouge pour la ville sélectionnée
const cityIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Style du cercle de rayon
const circleStyle = {
  color: '#3B82F6',
  fillColor: '#3B82F6',
  fillOpacity: 0.1,
  weight: 1
};

// Style personnalisé pour les popups
const customPopupStyle = {
  className: 'custom-popup',
  closeButton: true,
  autoPan: true,
  maxWidth: 300,
};

// Données d'exemple de propriétés
const sampleProperties = mockProperties;

// Configuration des rayons de recherche prédéfinis (en km)
const SEARCH_RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' }
];

function Search() {
  // États pour la recherche et le filtrage
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour les filtres
  const [searchLocation, setSearchLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(SEARCH_RADIUS_OPTIONS[1].value); // 10km par défaut
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [propertyType, setPropertyType] = useState('all');
  const [selectedAccommodationTypes, setSelectedAccommodationTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });

  // États pour l'interface
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [mapCenter, setMapCenter] = useState([45.188529, 5.724524]); // Centre par défaut sur Grenoble
  const [mapZoom, setMapZoom] = useState(12);

  // Référence pour le conteneur des popups
  const popupRef = useRef(null);

  // Fonction utilitaire pour calculer la distance
  const getPropertyDistance = useCallback((property) => {
    if (!searchLocation || !property.latitude || !property.longitude) return null;
    return getDistance(
      { latitude: searchLocation.latitude, longitude: searchLocation.longitude },
      { latitude: property.latitude, longitude: property.longitude }
    ) / 1000; // Convertir de mètres en kilomètres
  }, [searchLocation]);

  // Fonction pour filtrer les propriétés
  const filterProperties = useCallback((properties) => {
    if (!properties) return [];
    if (!searchLocation) return properties;

    return properties.filter(property => {
      // Vérification des coordonnées valides
      if (!property.latitude || !property.longitude || 
          isNaN(property.latitude) || isNaN(property.longitude)) {
        return false;
      }

      // Calcul de la distance en utilisant geolib
      const distance = getPropertyDistance(property);

      // Filtrage par distance
      const withinRadius = searchRadius === Infinity ? true : distance <= searchRadius;

      // Filtrage par prix
      const withinPriceRange = property.price >= priceRange[0] && 
                              property.price <= priceRange[1];

      // Filtrage par type de logement
      const matchesType = selectedAccommodationTypes.length === 0 || 
                         selectedAccommodationTypes.includes(property.type);

      // Retourne true seulement si tous les critères sont satisfaits
      return withinRadius && withinPriceRange && matchesType;
    });
  }, [searchLocation, searchRadius, priceRange, selectedAccommodationTypes]);

  // Fonction pour calculer le niveau de zoom optimal en fonction du rayon
  const getZoomLevel = (radius) => {
    // Cette formule donne un zoom approprié en fonction du rayon en km
    return Math.round(14 - Math.log(radius) / Math.log(2));
  };

  // Gestionnaire de clic global
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ferme les popups si le clic est en dehors
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Ferme la modale de propriété
        setIsPropertyModalOpen(false);
        // Ferme la combobox de recherche
        setIsSearchOpen(false);
        // Ferme les filtres
        setIsFiltersVisible(false);
        setActiveFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gestionnaires d'événements pour les filtres
  const handleFilterClick = (filterName) => {
    if (activeFilter === filterName) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterName);
    }
  };

  const handleRadiusChange = (value) => {
    setSearchRadius(value);
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
  };

  const handleAccommodationTypeChange = (type) => {
    setSelectedAccommodationTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleDateChange = (ranges) => {
    setSelectedDates(ranges.selection);
  };

  // Fonction de recherche de ville avec debounce
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await geocodeAddress(query);
        setSuggestions(results);
      } catch (err) {
        setError('Erreur lors de la recherche. Veuillez réessayer.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Gestionnaire de changement de recherche
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Gestionnaire de sélection de ville
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchLocation(city.coordinates);
    setSearchQuery(city.fullName);
    setSuggestions([]);
  };

  // Mise à jour des propriétés filtrées
  useEffect(() => {
    const filtered = filterProperties(sampleProperties);
    setFilteredProperties(filtered);
  }, [searchLocation, searchRadius, priceRange, selectedAccommodationTypes]);

  const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setIsPropertyModalOpen(true);
  };

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Fonction pour gérer les favoris
  const toggleFavorite = (property) => {
    const newFavorites = favorites.some(fav => fav.id === property.id)
      ? favorites.filter(fav => fav.id !== property.id)
      : [...favorites, property];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (propertyId) => {
    return favorites.some(fav => fav.id === propertyId);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Barre de recherche et bouton filtres */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="p-4">
            {/* Barre de recherche et bouton filtres */}
            <div className="flex items-center gap-2">
              <div className="flex-grow">
                <Combobox value={selectedCity} onChange={handleCitySelect}>
                  <div className="relative">
                    <div className="relative w-full">
                      <Combobox.Input
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Où souhaitez-vous loger ?"
                        onChange={handleSearchChange}
                        displayValue={(city) => 
                          city ? city.name + (city.department ? `, ${city.department}` : '') : searchQuery
                        }
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setSearchQuery('')}
                    >
                      <Combobox.Options className="absolute left-0 top-[calc(100%+0.5rem)] w-full bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 max-h-60 overflow-auto">
                        {isLoading && (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Recherche en cours...
                          </div>
                        )}
                        {!isLoading && suggestions.length === 0 && searchQuery !== '' && (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Aucune ville trouvée.
                          </div>
                        )}
                        {suggestions.map((city) => (
                          <Combobox.Option
                            key={city.id}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 px-4 ${
                                active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                              }`
                            }
                            value={city}
                          >
                            {({ selected, active }) => (
                              <div className="flex items-center">
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {city.name}
                                  {city.department && (
                                    <span className="text-gray-500 ml-1">
                                      {city.department}
                                    </span>
                                  )}
                                  {city.region && (
                                    <span className="text-gray-400 text-sm ml-1">
                                      ({city.region})
                                    </span>
                                  )}
                                </span>
                                {selected && (
                                  <span
                                    className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                                      active ? 'text-primary-900' : 'text-primary-600'
                                    }`}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                )}
                              </div>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>

              {/* Bouton filtres mobile */}
              <button
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="md:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-500" />
              </button>

              {/* Bouton rechercher */}
              <button
                onClick={() => handleCitySelect(selectedCity)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Filtres */}
            <Transition
              show={isFiltersVisible}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => {
                  setIsFiltersVisible(false);
                  setActiveFilter(null);
                }}
                open={isFiltersVisible}
              >
                <div className="fixed inset-0" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-start justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                      {/* Contenu des filtres */}
                      <div className="space-y-4">
                        {/* Rayon de recherche */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Rayon de recherche
                          </label>
                          <select
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            {SEARCH_RADIUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Prix */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Prix
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="number"
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Min"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Max"
                            />
                          </div>
                        </div>

                        {/* Types de logement */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Types de logement
                          </label>
                          <div className="space-y-2">
                            {['Studio', 'Appartement', 'Maison'].map((type) => (
                              <label key={type} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedAccommodationTypes.includes(type)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAccommodationTypes([...selectedAccommodationTypes, type]);
                                    } else {
                                      setSelectedAccommodationTypes(
                                        selectedAccommodationTypes.filter((t) => t !== type)
                                      );
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Carte en version mobile (sticky) */}
        <div className="sticky top-0 w-full md:hidden z-10 bg-white">
          <div className="h-[30vh] p-2">
            <div className="h-full rounded-lg overflow-hidden shadow-lg relative">
              <MapContainer 
                center={searchLocation ? [searchLocation.latitude, searchLocation.longitude] : mapCenter}
                zoom={searchLocation ? 13 : mapZoom}
                className="h-full w-full rounded-lg shadow-lg"
                zoomControl={true}
                zoomControlPosition="topleft"
                style={{ zIndex: 0 }}
                closePopupOnClick={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapUpdater 
                  searchLocation={searchLocation}
                  searchRadius={searchRadius}
                  properties={filteredProperties}
                />
                {/* Marqueur pour la ville sélectionnée */}
                {searchLocation && (
                  <Marker
                    position={[searchLocation.latitude, searchLocation.longitude]}
                    icon={cityIcon}
                  >
                    <Popup 
                      closeButton={true}
                      autoPan={true}
                    >
                      <div className="p-2">
                        <h3 className="font-semibold">{searchQuery}</h3>
                        <p>Centre de recherche</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                {filteredProperties.map((property) => (
                  <Marker
                    key={property.id}
                    position={[property.latitude, property.longitude]}
                    icon={defaultIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedProperty(property);
                        setIsPropertyModalOpen(true);
                      }
                    }}
                  >
                    <Popup 
                      closeButton={true}
                      autoPan={true}
                    >
                      <div className="p-2">
                        <h3 className="font-semibold">{property.title}</h3>
                        <p>{property.price}€ / nuit</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Liste des logements */}
        <div className="w-full md:w-3/5 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow cursor-pointer relative"
              >
                {/* Bouton favori */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(property);
                  }}
                  className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-md"
                >
                  {isFavorite(property.id) ? (
                    <HeartSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartOutline className="h-5 w-5 text-gray-600 hover:text-red-500" />
                  )}
                </button>

                <div
                  className="relative"
                  onClick={() => openPropertyDetails(property)}
                >
                  <div className="aspect-w-16 aspect-h-9 mb-3">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="object-cover rounded-lg w-full h-40"
                    />
                  </div>
                  <h3 className="text-base font-semibold truncate">{property.title}</h3>
                  <div className="mt-2 flex items-center text-gray-600 text-sm">
                    <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {searchLocation ? (
                        <>
                          {(() => {
                            const distance = getPropertyDistance(property);
                            return distance !== null ? (
                              <>
                                <span className={distance > searchRadius ? 'text-red-500' : 'text-green-600'}>
                                  {distance.toFixed(1)} km
                                </span>
                                {distance > searchRadius && 
                                  <span className="text-xs text-red-500 ml-1">(Hors rayon)</span>
                                }
                              </>
                            ) : 'Distance non disponible'
                          })()}
                        </>
                      ) : (
                        'Calcul en cours...'
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-gray-600 text-sm">
                    <BanknotesIcon className="h-4 w-4 mr-1" />
                    <span className="truncate">{property.price}€/mois</span>
                  </div>
                  <div className="mt-1 flex items-center text-gray-600 text-sm">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    <span className="truncate">{property.surface}m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Popup d'information sur le rayon */}
          <div className="mt-2 text-xs text-gray-500">
            {filteredProperties.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-sm text-gray-600">
                  Aucun logement trouvé dans un rayon de {searchRadius} km
                </p>
              </div>
            ) : (
              <div className="text-center p-2">
                <p className="text-sm text-gray-600">
                  {filteredProperties.length} logement{filteredProperties.length > 1 ? 's' : ''} trouvé{filteredProperties.length > 1 ? 's' : ''} dans un rayon de {searchRadius} km
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Carte en version desktop */}
        <div className="hidden md:block w-2/5 p-4 h-auto">
          <div className="h-full rounded-lg overflow-hidden shadow-lg relative">
            <MapContainer 
              center={searchLocation ? [searchLocation.latitude, searchLocation.longitude] : mapCenter}
              zoom={searchLocation ? 13 : mapZoom}
              className="h-[calc(100vh-2rem)] w-full rounded-lg shadow-lg"
              zoomControl={true}
              zoomControlPosition="topleft"
              style={{ zIndex: 0 }}
              closePopupOnClick={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <MapUpdater 
                searchLocation={searchLocation}
                searchRadius={searchRadius}
                properties={filteredProperties}
              />
              {/* Marqueur pour la ville sélectionnée */}
              {searchLocation && (
                <Marker
                  position={[searchLocation.latitude, searchLocation.longitude]}
                  icon={cityIcon}
                >
                  <Popup 
                    closeButton={true}
                    autoPan={true}
                  >
                    <div className="p-2">
                      <h3 className="font-semibold">{searchQuery}</h3>
                      <p>Centre de recherche</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {filteredProperties.map((property) => (
                <Marker
                  key={property.id}
                  position={[property.latitude, property.longitude]}
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedProperty(property);
                      setIsPropertyModalOpen(true);
                    }
                  }}
                >
                  <Popup 
                    closeButton={true}
                    autoPan={true}
                  >
                    <div className="p-2">
                      <h3 className="font-semibold">{property.title}</h3>
                      <p>{property.price}€ / nuit</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Modal des détails de la propriété */}
      <HeadlessTransition appear show={isPropertyModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[9999]"
          onClose={() => setIsPropertyModalOpen(false)}
        >
          <HeadlessTransition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </HeadlessTransition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-0 sm:p-4 text-center">
              <HeadlessTransition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full h-full sm:h-auto sm:max-w-4xl transform overflow-hidden bg-white sm:rounded-2xl p-6 shadow-xl transition-all">
                  {selectedProperty && (
                    <>
                      <div className="relative flex justify-between items-start mb-4">
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-semibold text-gray-900 pr-8"
                        >
                          {selectedProperty.title}
                        </Dialog.Title>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(selectedProperty);
                            }}
                            className="p-2 rounded-full hover:bg-gray-100"
                          >
                            {isFavorite(selectedProperty.id) ? (
                              <HeartSolid className="h-6 w-6 text-red-500" />
                            ) : (
                              <HeartOutline className="h-6 w-6 text-gray-500 hover:text-red-500" />
                            )}
                          </button>
                          <button
                            onClick={() => setIsPropertyModalOpen(false)}
                            className="p-2 rounded-full hover:bg-gray-100"
                          >
                            <XMarkIcon className="h-6 w-6 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="aspect-w-16 aspect-h-9 mb-6">
                          <img
                            src={selectedProperty.imageUrl}
                            alt={selectedProperty.title}
                            className="object-cover rounded-xl w-full h-[400px]"
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <MapPinIcon className="h-6 w-6 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Distance</p>
                              <p className="text-gray-900 font-medium">
                                {searchLocation ? (
                                  `${getPropertyDistance(selectedProperty).toFixed(1)} km`
                                ) : (
                                  'Calcul en cours...'
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <BanknotesIcon className="h-6 w-6 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Prix mensuel</p>
                              <p className="text-gray-900 font-medium">{selectedProperty.price}€</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <HomeIcon className="h-6 w-6 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Type</p>
                              <p className="text-gray-900 font-medium">{selectedProperty.type}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <BuildingOfficeIcon className="h-6 w-6 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Surface</p>
                              <p className="text-gray-900 font-medium">{selectedProperty.surface}m²</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Durée de location</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                            {selectedProperty.duration} mois
                          </p>
                        </div>

                        <div className="mt-8 flex gap-4">
                          <button
                            type="button"
                            className="flex-1 inline-flex justify-center items-center rounded-lg px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(selectedProperty);
                            }}
                          >
                            {isFavorite(selectedProperty.id) ? (
                              <>
                                <HeartSolid className="h-5 w-5 text-red-500 mr-2" />
                                Retirer des favoris
                              </>
                            ) : (
                              <>
                                <HeartOutline className="h-5 w-5 mr-2" />
                                Ajouter aux favoris
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="flex-1 inline-flex justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            onClick={() => {
                              // Ici, vous pouvez ajouter la logique pour contacter le propriétaire
                              setIsPropertyModalOpen(false);
                            }}
                          >
                            Contacter le propriétaire
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </HeadlessTransition.Child>
            </div>
          </div>
        </Dialog>
      </HeadlessTransition>
    </div>
  );
};

export default Search;
