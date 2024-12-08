const OPENCAGE_API_KEY = "0eac43f553c74f72884eca422e2805be"; // Clé API OpenCage

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      error => reject(error),
      { enableHighAccuracy: true }
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    throw new Error('Latitude et longitude sont requises');
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=fr`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        formatted: result.formatted,
        city: result.components.city || result.components.town || result.components.village,
        state: result.components.state,
        country: result.components.country,
        postcode: result.components.postcode,
      };
    }
    throw new Error('Aucun résultat trouvé');
  } catch (error) {
    console.error('Erreur lors du géocodage inverse:', error);
    throw error;
  }
};

export const geocodeAddress = async (address) => {
  if (!address?.trim()) {
    return [];
  }

  try {
    // Configuration de base pour Nominatim
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      addressdetails: 1,
      limit: 10,
      countrycodes: 'fr',  // Limite aux résultats en France
      accept_language: 'fr',
      featuretype: 'city,town,village'  // Inclut les villes, communes et villages
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'SeasonStay/1.0'  // Identification de l'application
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Traitement et déduplication des résultats
    const processedResults = new Map();
    
    data.forEach(item => {
      const address = item.address;
      const mainName = address.city || address.town || address.village;
      const department = address.county || address.state || '';
      const region = address.state || '';
      
      if (!mainName) return; // Ignore les résultats sans nom principal
      
      const key = `${mainName.toLowerCase()}-${department.toLowerCase()}`;
      
      if (!processedResults.has(key) || processedResults.get(key).importance < item.importance) {
        processedResults.set(key, {
          id: key,
          name: mainName,
          department,
          region,
          fullName: `${mainName}${department ? `, ${department}` : ''}${region ? ` (${region})` : ''}`,
          coordinates: {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon)
          },
          importance: item.importance || 0,
          type: address.city ? 'city' : address.town ? 'town' : 'village'
        });
      }
    });

    // Conversion et tri des résultats
    return Array.from(processedResults.values())
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);
      
  } catch (error) {
    console.error('Erreur lors de la recherche de ville:', error);
    throw new Error('La recherche de ville a échoué. Veuillez réessayer.');
  }
};

export const findNearbyProperties = (userLocation, properties, radius = 10) => {
  if (!userLocation || !properties) return [];
  
  return properties.filter(property => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      property.latitude,
      property.longitude
    );
    return distance <= radius;
  });
};

// Calcul de la distance entre deux points en km (formule de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value) => value * Math.PI / 180;
