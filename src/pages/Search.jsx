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

// Fonction de calcul de distance (formule de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance en kilomètres
  return distance;
};

// Fonction pour filtrer les propriétés
const filterProperties = (properties, filters) => {
  if (!properties?.length) return [];
  
  const {
    searchLocation,
    radius = 20,
    priceRange,
    propertyType,
    dates
  } = filters;

  return properties.filter(property => {
    // Vérification de la validité des coordonnées
    if (!property.latitude || !property.longitude) {
      console.warn(`Propriété invalide - coordonnées manquantes:`, property.id);
      return false;
    }

    // Filtre par localisation et rayon si une recherche est active
    if (searchLocation?.latitude && searchLocation?.longitude) {
      const distance = calculateDistance(
        searchLocation.latitude,
        searchLocation.longitude,
        property.latitude,
        property.longitude
      );
      
      // Si la propriété est hors du rayon de recherche
      if (distance > radius) return false;
      
      // Ajouter la distance à la propriété pour l'affichage
      property.distance = Math.round(distance * 10) / 10;
    }

    // Filtre par type de logement
    if (propertyType && propertyType !== 'all') {
      if (property.type.toLowerCase() !== propertyType.toLowerCase()) return false;
    }

    // Filtre par prix
    if (priceRange?.length === 2) {
      const [minPrice, maxPrice] = priceRange;
      if (property.price < minPrice || property.price > maxPrice) return false;
    }

    // Filtre par disponibilité
    if (dates?.startDate && dates?.endDate) {
      const isAvailable = checkPropertyAvailability(property, dates.startDate, dates.endDate);
      if (!isAvailable) return false;
    }

    return true;
  });
};

// Fonction utilitaire pour vérifier la disponibilité
const checkPropertyAvailability = (property, startDate, endDate) => {
  if (!property.unavailableDates?.length) return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return !property.unavailableDates.some(dateRange => {
    const rangeStart = new Date(dateRange.start);
    const rangeEnd = new Date(dateRange.end);
    return (start <= rangeEnd && end >= rangeStart);
  });
};

// Fonction pour calculer le niveau de zoom optimal en fonction du rayon
const getZoomLevel = (radius) => {
  // Cette formule donne un zoom approprié en fonction du rayon en km
  return Math.round(14 - Math.log(radius) / Math.log(2));
};

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

  // États pour la géolocalisation
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);

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
    const filters = {
      searchLocation,
      radius: searchRadius,
      priceRange,
      propertyType: selectedAccommodationTypes.length > 0 ? selectedAccommodationTypes[0] : 'all',
      dates: selectedDates
    };

    const filtered = filterProperties(sampleProperties, filters);
    setFilteredProperties(filtered);
  }, [searchLocation, searchRadius, priceRange, selectedAccommodationTypes, selectedDates]);

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

  // Fonction pour obtenir la position de l'utilisateur
  const getUserLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const userPos = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setUserLocation(userPos);
      // Si aucune recherche n'est active, utiliser la position de l'utilisateur
      if (!searchLocation) {
        setSearchLocation(userPos);
        // Faire une recherche inverse pour obtenir le nom de la ville
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${userPos.latitude}+${userPos.longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}&language=fr`
          );
          const data = await response.json();
          if (data.results && data.results[0]) {
            const result = data.results[0];
            setSearchQuery(result.formatted.split(',')[0]); // Prend le premier élément (nom de la ville)
          }
        } catch (error) {
          console.error('Erreur lors de la géocodification inverse:', error);
        }
      }
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      setLocationError(
        error.code === 1 
          ? "Veuillez autoriser l'accès à votre position pour une meilleure expérience."
          : "Impossible d'obtenir votre position. Veuillez réessayer."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  }, [searchLocation]);

  // Obtenir la position de l'utilisateur au chargement
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

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

              {locationError && (
                <p className="mt-2 text-sm text-red-600">{locationError}</p>
              )}
            </div>
            {/* Filtres */}
            <div className={`mt-4 md:block ${isFiltersVisible ? 'block' : 'hidden'}`}>
              <div className="flex flex-col md:flex-row gap-2">
                {/* Date */}
                <div className="relative w-full md:w-auto">
                  <button
                    onClick={() => handleFilterClick('date')}
                    data-filter-button="date"
                    className="w-full md:w-auto flex items-center justify-between space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 border border-gray-300"
                  >
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {selectedDates.startDate ? format(selectedDates.startDate, 'dd/MM/yyyy', { locale: fr }) : 'Arrivée'} 
                        {' - '}
                        {selectedDates.endDate ? format(selectedDates.endDate, 'dd/MM/yyyy', { locale: fr }) : 'Départ'}
                      </span>
                    </div>
                  </button>

                  {activeFilter === 'date' && (
                    <div data-filter-content="date" className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <DateRange
                        ranges={[selectedDates]}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        rangeColors={['#3B82F6']}
                        monthDisplayFormat="MMMM yyyy"
                        locale={fr}
                      />
                    </div>
                  )}
                </div>

                {/* Rayon */}
                <div className="relative w-full md:w-auto">
                  <button
                    onClick={() => handleFilterClick('radius')}
                    data-filter-button="radius"
                    className="w-full md:w-auto flex items-center justify-between space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 border border-gray-300"
                  >
                    <div className="flex items-center space-x-2">
                      <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-700">{searchRadius} km</span>
                    </div>
                  </button>
                
                  {activeFilter === 'radius' && (
                    <div data-filter-content="radius" className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Rayon de recherche</span>
                          <span className="text-sm text-gray-500">{searchRadius} km</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="1"
                          value={searchRadius}
                          onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1 km</span>
                          <span>15 km</span>
                          <span>30 km</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prix */}
                <div className="relative w-full md:w-auto">
                  <button
                    onClick={() => handleFilterClick('price')}
                    data-filter-button="price"
                    className="w-full md:w-auto flex items-center justify-between space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 border border-gray-300"
                  >
                    <div className="flex items-center space-x-2">
                      <BanknotesIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {priceRange[0]}€ - {priceRange[1]}€
                      </span>
                    </div>
                  </button>

                  {activeFilter === 'price' && (
                    <div data-filter-content="price" className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Prix par nuit</span>
                          <span className="text-sm text-gray-500">
                            {priceRange[0]}€ - {priceRange[1]}€
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            value={priceRange[0]}
                            onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), priceRange[1]])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            value={priceRange[1]}
                            onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0€</span>
                          <span>500€</span>
                          <span>1000€</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Type de logement */}
                <div className="relative w-full md:w-auto">
                  <button
                    onClick={() => handleFilterClick('accommodation')}
                    data-filter-button="accommodation"
                    className="w-full md:w-auto flex items-center justify-between space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 border border-gray-300"
                  >
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Type de logement
                      </span>
                    </div>
                  </button>

                  {activeFilter === 'accommodation' && (
                    <div data-filter-content="accommodation" className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-2">
                        {['Studio', 'Appartement', 'Maison'].map((type) => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedAccommodationTypes.includes(type)}
                              onChange={() => handleAccommodationTypeChange(type)}
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Partenaire */}
                <div className="relative w-full md:w-auto">
                  <button
                    onClick={() => handleFilterClick('partner')}
                    data-filter-button="partner"
                    className="w-full md:w-auto flex items-center justify-between space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 border border-gray-300"
                  >
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Partenaire
                      </span>
                    </div>
                  </button>

                  {activeFilter === 'partner' && (
                    <div data-filter-content="partner" className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-2">
                        {[{ id: 1, name: 'Airbnb' }, { id: 2, name: 'Booking.com' }, { id: 3, name: 'Abritel' }].map((partner) => (
                          <label key={partner.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => console.log('Partenaire sélectionné:', partner.name)}
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                            />
                            <span className="text-sm text-gray-700">{partner.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                    <Popup>
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
                    <Popup>
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
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedProperty(property);
                  setIsPropertyModalOpen(true);
                }}
              >
                {/* Carrousel d'images */}
                <div className="relative h-48">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche l'ouverture du modal lors du clic sur le cœur
                      toggleFavorite(property.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200"
                  >
                    {isFavorite(property.id) ? (
                      <HeartSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartOutline className="h-6 w-6 text-gray-600 hover:text-red-500" />
                    )}
                  </button>
                </div>

                {/* Informations de la propriété */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {property.title}
                    </h3>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>
                      {searchLocation ? (
                        <span className={property.distance > searchRadius ? 'text-red-500' : 'text-green-600'}>
                          {property.distance} km
                          {property.distance > searchRadius && 
                            <span className="text-xs text-red-500 ml-1">(Hors rayon)</span>
                          }
                        </span>
                      ) : (
                        'Calcul en cours...'
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <HomeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{property.surface}m²</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {property.price}€<span className="text-sm font-normal">/mois</span>
                    </div>
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
                  <Popup>
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
                  <Popup>
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
                <Dialog.Panel className="w-full h-full sm:h-auto sm:max-w-4xl transform overflow-hidden bg-white sm:rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
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
                          {selectedProperty.images && selectedProperty.images.length > 0 ? (
                            <img
                              src={selectedProperty.images[0]}
                              alt={selectedProperty.title}
                              className="object-cover rounded-xl w-full h-[400px]"
                            />
                          ) : (
                            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-xl">
                              <PhotoIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <MapPinIcon className="h-6 w-6 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Distance</p>
                              <p className="text-gray-900 font-medium">
                                {searchLocation ? (
                                  `${calculateDistance(searchLocation.latitude, searchLocation.longitude, selectedProperty.latitude, selectedProperty.longitude).toFixed(1)} km`
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
