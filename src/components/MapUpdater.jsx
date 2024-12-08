import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapUpdater = ({ searchLocation, searchRadius, properties }) => {
  const map = useMap();

  // Fonction pour valider les coordonnées
  const isValidCoordinate = (lat, lng) => {
    return lat !== undefined && 
           lng !== undefined && 
           !isNaN(lat) && 
           !isNaN(lng) && 
           lat >= -90 && 
           lat <= 90 && 
           lng >= -180 && 
           lng <= 180;
  };

  // Fonction améliorée pour calculer le zoom optimal
  const calculateZoomLevel = (radius) => {
    const radiusInKm = radius;
    if (radiusInKm <= 1) return 15;
    if (radiusInKm <= 2) return 14;
    if (radiusInKm <= 5) return 13;
    if (radiusInKm <= 10) return 12;
    if (radiusInKm <= 20) return 11;
    if (radiusInKm <= 50) return 10;
    if (radiusInKm <= 100) return 9;
    return 8;
  };

  useEffect(() => {
    if (!map) return;

    // Vérifier si searchLocation est valide
    if (!searchLocation || 
        !isValidCoordinate(searchLocation.latitude, searchLocation.longitude)) {
      // Si pas de localisation valide, centrer sur Grenoble par défaut
      map.setView([45.188529, 5.724524], 12);
      return;
    }

    try {
      const { latitude, longitude } = searchLocation;
      const center = L.latLng(latitude, longitude);
      
      // Vérifier si le rayon est valide
      const radiusInMeters = (searchRadius && !isNaN(searchRadius)) 
        ? searchRadius * 1000 
        : 10000; // 10km par défaut
      
      const zoomLevel = calculateZoomLevel(searchRadius || 10);
      
      // Nettoyer les anciens cercles
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Créer le cercle de recherche
      const searchCircle = L.circle(center, {
        radius: radiusInMeters,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 5'
      });

      searchCircle.addTo(map);

      // Créer les limites initiales avec le centre
      const bounds = L.latLngBounds([center]);
      
      // Ajouter les propriétés valides aux limites
      if (Array.isArray(properties)) {
        properties.forEach(property => {
          if (property && 
              isValidCoordinate(property.latitude, property.longitude)) {
            bounds.extend([property.latitude, property.longitude]);
          }
        });
      }

      // Étendre les limites pour inclure le cercle
      bounds.extend(searchCircle.getBounds());

      // Vérifier si les limites sont valides avant d'ajuster la vue
      if (bounds.isValid()) {
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: zoomLevel,
          duration: 1,
          easeLinearity: 0.5
        });
      } else {
        // Fallback si les limites ne sont pas valides
        map.setView(center, zoomLevel);
      }

      return () => {
        map.removeLayer(searchCircle);
      };
    } catch (error) {
      console.error('Erreur dans MapUpdater:', error);
      // Fallback en cas d'erreur
      map.setView([45.188529, 5.724524], 12);
    }
  }, [map, searchLocation, searchRadius, properties]);

  return null;
};

export default MapUpdater;
