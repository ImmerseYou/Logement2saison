import React, { useState, useEffect, Fragment } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
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

// Correction pour l'icône de marker par défaut de Leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Style du cercle de rayon
const circleStyle = {
  color: '#4F46E5', // Couleur Indigo plus moderne
  weight: 2,
  fillColor: '#4F46E5',
  fillOpacity: 0.08,
  dashArray: '5, 5',
};

// Style personnalisé pour les popups
const customPopupStyle = {
  className: 'custom-popup',
  closeButton: true,
  autoPan: true,
  maxWidth: 300,
};

// Données d'exemple de propriétés
const sampleProperties = [
  {
    id: 1,
    title: 'Studio Cosy Paris Centre',
    location: [48.8566, 2.3522], // Paris centre
    price: 800,
    type: 'Studio',
    duration: 6,
    partnerId: 'p1',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
    surface: 25
  },
  {
    id: 2,
    title: 'Appartement Moderne Versailles',
    location: [48.8049, 2.1204], // Versailles (~20km de Paris)
    price: 1200,
    type: 'Appartement',
    duration: 12,
    partnerId: 'p2',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
    surface: 45
  },
  {
    id: 3,
    title: 'Loft Spacieux Saint-Denis',
    location: [48.9362, 2.3574], // Saint-Denis (~8km de Paris)
    price: 1100,
    type: 'Loft',
    duration: 12,
    partnerId: 'p1',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
    surface: 55
  },
  {
    id: 4,
    title: 'Studio Étudiant Nanterre',
    location: [48.8924, 2.2071], // Nanterre (~12km de Paris)
    price: 700,
    type: 'Studio',
    duration: 9,
    partnerId: 'p3',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
    surface: 20
  },
  {
    id: 5,
    title: 'Maison avec Jardin Melun',
    location: [48.5421, 2.6607], // Melun (~28km de Paris)
    price: 1500,
    type: 'Maison',
    duration: 12,
    partnerId: 'p2',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
    surface: 90
  },
  {
    id: 6,
    title: 'Appartement Rénové Créteil',
    location: [48.7898, 2.4545], // Créteil (~15km de Paris)
    price: 950,
    type: 'Appartement',
    duration: 12,
    partnerId: 'p1',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
    surface: 35
  }
];

// Fonction pour calculer la distance entre deux points
const calculateDistance = (point1, point2) => {
  return getDistance(
    { latitude: point1.latitude, longitude: point1.longitude },
    { latitude: point2[0], longitude: point2[1] }
  ) / 1000; // Convertir en kilomètres
};

// Fonction pour filtrer les propriétés
const filterProperties = (properties, filters) => {
  const { userLocation, searchRadius, priceRange, selectedAccommodationTypes } = filters;

  return properties.filter(property => {
    // Filtre par distance si une localisation est définie
    if (userLocation) {
      const distance = calculateDistance(userLocation, property.location);
      if (distance > searchRadius) {
        return false;
      }
    }

    // Filtre par prix
    const priceMatch = 
      property.price >= priceRange[0] && 
      property.price <= priceRange[1];

    // Filtre par type de logement
    const typeMatch = 
      selectedAccommodationTypes.length === 0 || 
      selectedAccommodationTypes.includes(property.type);
    
    return priceMatch && typeMatch;
  });
};

function MapUpdater({ center, radius }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      // Calcul du zoom optimal en fonction du rayon
      // Plus le rayon est grand, plus le zoom sera petit (vue plus éloignée)
      let zoom = 14
      if (radius <= 5) zoom = 13
      else if (radius <= 10) zoom = 12
      else if (radius <= 20) zoom = 11
      else if (radius <= 30) zoom = 10
      else zoom = 9

      map.flyTo([center.latitude, center.longitude], zoom, {
        duration: 1.5 // durée de l'animation en secondes
      })
    }
  }, [center, radius, map])
  
  return null
}

function LocationMarker() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const map = useMap()

  useEffect(() => {
    getCurrentPosition()
      .then(pos => {
        const newPos = [pos.coords.latitude, pos.coords.longitude]
        setPosition(newPos)
        map.flyTo(newPos, 13)
      })
      .catch(error => {
        console.error("Erreur de géolocalisation:", error)
        setError(error.message)
      })
  }, [map])

  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup className="custom-popup">
        <div className="text-center">
          <span className="font-medium">Votre position</span>
        </div>
      </Popup>
    </Marker>
  )
}

function Search() {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [searchCity, setSearchCity] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationDetails, setLocationDetails] = useState(null)
  const [searchRadius, setSearchRadius] = useState(5)  // Valeur par défaut réduite à 5km
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [partners] = useState([
    { id: 1, name: 'Airbnb' },
    { id: 2, name: 'Booking.com' },
    { id: 3, name: 'Abritel' }
  ])
  const [propertyTypes] = useState(['Studio', 'Appartement', 'Maison'])
  const [isRadiusOpen, setIsRadiusOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isPriceOpen, setIsPriceOpen] = useState(false)
  const [isAccommodationTypeOpen, setIsAccommodationTypeOpen] = useState(false)
  const [isPartnerOpen, setIsPartnerOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  })
  const [accommodationTypes] = useState(['Studio', 'Appartement', 'Maison'])
  const [selectedAccommodationTypes, setSelectedAccommodationTypes] = useState([])
  const [selectedPartners, setSelectedPartners] = useState([])
  const [mapKey, setMapKey] = useState(0)
  const [mapCenter, setMapCenter] = useState([46.227638, 2.213749])
  const [mapZoom, setMapZoom] = useState(5)
  const [nearbyProperties, setNearbyProperties] = useState([])

  const [map, setMap] = useState(null);

  useEffect(() => {
    if (userLocation) {
      setMapKey(prev => prev + 1); // Force le remontage de la carte quand la localisation change
      setMapCenter([userLocation.latitude, userLocation.longitude])
    }
  }, [userLocation]);

  // Fonction de recherche de suggestions modifiée
  const getSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          featuretype: 'city'
        }
      })
      
      const cities = response.data.map(item => ({
        ...item,
        mainName: item.display_name.split(',')[0],
        details: item.display_name.split(',').slice(1).join(',').trim()
      }))
      setSuggestions(cities)
    } catch (error) {
      console.error('Erreur lors de la recherche de villes:', error)
      setSuggestions([])
    }
  }

  // Gestion du changement de ville
  const handleCitySelect = (city) => {
    setSelectedCity(city)
    if (city?.lat && city?.lon) {
      setUserLocation({
        latitude: parseFloat(city.lat),
        longitude: parseFloat(city.lon)
      })
    }
  }

  // Gestionnaire de changement de ville
  const handleCityChange = async (city) => {
    if (!city) return;

    setIsSearching(true);
    setSearchError(null);
    setSelectedCity(city);

    try {
      const newLocation = {
        latitude: parseFloat(city.lat),
        longitude: parseFloat(city.lon)
      };
      setUserLocation(newLocation);
      setLocationDetails({
        formatted: city.display_name
      });
      
      // Appliquer les filtres avec la nouvelle localisation
      const nearby = filterProperties(sampleProperties, {
        userLocation: newLocation,
        searchRadius,
        priceRange,
        selectedAccommodationTypes
      });
      
      setNearbyProperties(nearby);
    } catch (error) {
      setSearchError("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce pour la recherche de suggestions avec un délai plus long pour respecter les limites de l'API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSuggestions(searchCity)
    }, 500) // Augmenté à 500ms pour respecter les limites de l'API

    return () => clearTimeout(timeoutId)
  }, [searchCity])

  useEffect(() => {
    // Géolocalisation initiale
    getCurrentPosition()
      .then(async position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        setUserLocation(coords)
        
        try {
          const details = await reverseGeocode(coords.latitude, coords.longitude)
          setLocationDetails(details)
          
          let nearby = filterProperties(sampleProperties, {
            userLocation: coords,
            searchRadius,
            priceRange,
            selectedAccommodationTypes
          });
          setNearbyProperties(nearby)
        } catch (error) {
          console.error("Erreur lors de la récupération des détails de localisation:", error)
        }
      })
      .catch(error => {
        console.error("Erreur de géolocalisation:", error)
      })
  }, [])

  useEffect(() => {
    if (userLocation) {
      const filtered = filterProperties(sampleProperties, {
        userLocation,
        searchRadius,
        priceRange,
        selectedAccommodationTypes
      });
      setNearbyProperties(filtered);
    }
  }, [userLocation, searchRadius, priceRange, selectedAccommodationTypes]);

  const togglePropertyType = (type) => {
    if (selectedAccommodationTypes.includes(type)) {
      setSelectedAccommodationTypes(selectedAccommodationTypes.filter(t => t !== type))
    } else {
      setSelectedAccommodationTypes([...selectedAccommodationTypes, type])
    }
  }

  const handleDateChange = (ranges) => {
    setSelectedDates(ranges.selection)
  }

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange)
  }

  const handleAccommodationTypeChange = (type) => {
    if (selectedAccommodationTypes.includes(type)) {
      setSelectedAccommodationTypes(selectedAccommodationTypes.filter(t => t !== type))
    } else {
      setSelectedAccommodationTypes([...selectedAccommodationTypes, type])
    }
  }

  const handlePartnerChange = (partner) => {
    if (selectedPartners.includes(partner)) {
      setSelectedPartners(selectedPartners.filter(p => p !== partner))
    } else {
      setSelectedPartners([...selectedPartners, partner])
    }
  }

  // Fonction pour fermer tous les filtres
  const closeAllFilters = () => {
    setIsRadiusOpen(false);
    setIsDatePickerOpen(false);
    setIsPriceOpen(false);
    setIsAccommodationTypeOpen(false);
    setIsPartnerOpen(false);
  };

  // Gestionnaire de clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isFilterButton = event.target.closest('[data-filter-button]');
      const isFilterContent = event.target.closest('[data-filter-content]');
      
      if (!isFilterButton && !isFilterContent) {
        closeAllFilters();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour gérer l'ouverture des filtres
  const handleFilterOpen = (filterName) => {
    // Ferme tous les autres filtres
    setIsRadiusOpen(filterName === 'radius' ? !isRadiusOpen : false);
    setIsDatePickerOpen(filterName === 'date' ? !isDatePickerOpen : false);
    setIsPriceOpen(filterName === 'price' ? !isPriceOpen : false);
    setIsAccommodationTypeOpen(filterName === 'accommodation' ? !isAccommodationTypeOpen : false);
    setIsPartnerOpen(filterName === 'partner' ? !isPartnerOpen : false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Barre de recherche et filtres */}
      <div className="z-[1000] bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Search Bar Container */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-5xl">
              <div className="relative flex items-center bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5">
                {/* Recherche de ville */}
                <div className="flex-[2] flex items-center min-w-[300px] relative">
                  <MapPinIcon className="h-5 w-5 text-gray-400 ml-1.5 flex-shrink-0" />
                  <Combobox value={selectedCity} onChange={handleCitySelect}>
                    <div className="relative w-full">
                      <Combobox.Input
                        className="w-full border-0 pl-2 py-1.5 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                        placeholder="Où souhaitez-vous loger ?"
                        onChange={(event) => {
                          setSearchCity(event.target.value)
                          getSuggestions(event.target.value)
                        }}
                        displayValue={(city) => city?.mainName || searchCity}
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
                      afterLeave={() => setSearchCity('')}
                    >
                      <Combobox.Options className="absolute left-0 top-[calc(100%+0.5rem)] w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-h-60 overflow-auto">
                        {suggestions.length === 0 && searchCity !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Aucun résultat trouvé.
                          </div>
                        ) : (
                          suggestions.map((city) => (
                            <Combobox.Option
                              key={city.place_id}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 px-3 my-1 rounded-md transition-colors duration-200 ${
                                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-900 hover:bg-gray-50'
                                }`
                              }
                              value={city}
                            >
                              {({ selected, active }) => (
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" aria-hidden="true" />
                                    <span className={`truncate ${selected ? 'font-medium' : ''}`}>
                                      {city.mainName}
                                    </span>
                                    {selected && (
                                      <CheckIcon className="h-4 w-4 ml-auto text-blue-600 flex-shrink-0" aria-hidden="true" />
                                    )}
                                  </div>
                                  {city.details && (
                                    <span className="text-xs text-gray-500 ml-6 mt-0.5">
                                      {city.details}
                                    </span>
                                  )}
                                </div>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </Combobox>
                </div>

                {/* Séparateur vertical */}
                <div className="h-5 w-px bg-gray-300 mx-2" />

                {/* Contrôle du rayon */}
                <div className="relative">
                  <button
                    onClick={() => handleFilterOpen('radius')}
                    data-filter-button="radius"
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  {isRadiusOpen && (
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
                          onChange={(e) => setSearchRadius(parseInt(e.target.value))}
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

                {/* Séparateur vertical */}
                <div className="h-8 w-px bg-gray-300 mx-4"></div>

                {/* Filtre de dates */}
                <div className="relative">
                  <button
                    onClick={() => handleFilterOpen('date')}
                    data-filter-button="date"
                    className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors duration-200"
                  >
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {selectedDates.startDate ? format(selectedDates.startDate, 'dd/MM/yyyy', { locale: fr }) : 'Arrivée'} 
                      {' - '}
                      {selectedDates.endDate ? format(selectedDates.endDate, 'dd/MM/yyyy', { locale: fr }) : 'Départ'}
                    </span>
                  </button>

                  {isDatePickerOpen && (
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

                {/* Séparateur vertical */}
                <div className="h-8 w-px bg-gray-300 mx-4"></div>

                {/* Filtre de prix */}
                <div className="relative">
                  <button
                    onClick={() => handleFilterOpen('price')}
                    data-filter-button="price"
                    className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors duration-200"
                  >
                    <BanknotesIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {priceRange[0]}€ - {priceRange[1]}€
                    </span>
                  </button>

                  {isPriceOpen && (
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
                            onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            value={priceRange[1]}
                            onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
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

                {/* Séparateur vertical */}
                <div className="h-8 w-px bg-gray-300 mx-4"></div>

                {/* Filtre de type de logement */}
                <div className="relative">
                  <button
                    onClick={() => handleFilterOpen('accommodation')}
                    data-filter-button="accommodation"
                    className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200"
                  >
                    <HomeIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Type de logement
                    </span>
                  </button>

                  {isAccommodationTypeOpen && (
                    <div data-filter-content="accommodation" className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-2">
                        {accommodationTypes.map((type) => (
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

                {/* Séparateur vertical */}
                <div className="h-8 w-px bg-gray-300 mx-4"></div>

                {/* Filtre de partenaire */}
                <div className="relative">
                  <button
                    onClick={() => handleFilterOpen('partner')}
                    data-filter-button="partner"
                    className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200"
                  >
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Partenaire
                    </span>
                  </button>

                  {isPartnerOpen && (
                    <div data-filter-content="partner" className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-2">
                        {partners.map((partner) => (
                          <label key={partner.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPartners.includes(partner.id)}
                              onChange={() => handlePartnerChange(partner.id)}
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                            />
                            <span className="text-sm text-gray-700">{partner.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton Rechercher */}
                <button
                  onClick={handleCityChange}
                  className="ml-2 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 flex-shrink-0"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal en deux colonnes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Colonne de gauche - Liste des logements */}
        <div className="w-3/5 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {nearbyProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProperty(property)}
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
                    {userLocation ? (
                      <>
                        <span className={calculateDistance(userLocation, property.location) > searchRadius ? 'text-red-500' : 'text-green-600'}>
                          {calculateDistance(userLocation, property.location).toFixed(1)} km
                        </span>
                        {calculateDistance(userLocation, property.location) > searchRadius && 
                          <span className="text-xs text-red-500 ml-1">(Hors rayon)</span>
                        }
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
            ))}
          </div>
          {/* Popup d'information sur le rayon */}
          <div className="mt-2 text-xs text-gray-500">
            {nearbyProperties.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-sm text-gray-600">
                  Aucun logement trouvé dans un rayon de {searchRadius} km
                </p>
              </div>
            ) : (
              <div className="text-center p-2">
                <p className="text-sm text-gray-600">
                  {nearbyProperties.length} logement{nearbyProperties.length > 1 ? 's' : ''} trouvé{nearbyProperties.length > 1 ? 's' : ''} dans un rayon de {searchRadius} km
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne de droite - Carte */}
        <div className="w-2/5 p-4">
          <div className="h-full rounded-lg overflow-hidden shadow-lg relative">
            <MapContainer 
              center={mapCenter}
              zoom={mapZoom}
              className="h-[calc(100vh-2rem)] w-full rounded-lg shadow-lg"
              style={{ minHeight: "600px" }}
              zoomControl={true}
              zoomControlPosition="topleft"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              {userLocation && (
                <>
                  <LocationMarker />
                  <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={searchRadius * 1000}
                    pathOptions={circleStyle}
                  />
                </>
              )}
              {nearbyProperties.map((property) => (
                <Marker
                  key={property.id}
                  position={property.location}
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => setSelectedProperty(property),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <h3 className="font-semibold text-blue-600 mb-1">{property.title}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <BanknotesIcon className="h-4 w-4 mr-1" />
                        <span>{property.price}€/mois</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <HomeIcon className="h-4 w-4 mr-1" />
                        <span>{property.surface}m²</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <MapUpdater center={userLocation} radius={searchRadius} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search;
