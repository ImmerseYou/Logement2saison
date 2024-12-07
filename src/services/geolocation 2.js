const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY; // Vous devrez remplacer ceci par votre clé API OpenCage

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      { enableHighAccuracy: true }
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=fr`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        formatted: data.results[0].formatted,
        city: data.results[0].components.city || data.results[0].components.town,
        state: data.results[0].components.state,
        country: data.results[0].components.country,
        postcode: data.results[0].components.postcode,
      };
    }
    throw new Error('Aucun résultat trouvé');
  } catch (error) {
    console.error('Erreur lors du géocodage inverse:', error);
    throw error;
  }
};

export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        address
      )}&key=${OPENCAGE_API_KEY}&language=fr&countrycode=fr`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.lat,
        longitude: result.geometry.lng,
        formatted: result.formatted
      };
    }
    throw new Error('Aucun résultat trouvé pour cette adresse');
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    throw error;
  }
};

export const findNearbyProperties = (userLocation, properties, radius = 10) => {
  // Conversion du rayon de km en degrés (approximation simple)
  const radiusInDegrees = radius / 111;

  return properties.filter(property => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      property.location[0],
      property.location[1]
    );
    return distance <= radius;
  });
};

// Calcul de la distance entre deux points en km (formule de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => (value * Math.PI) / 180;
