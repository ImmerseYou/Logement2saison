export function getAssetPath(path) {
  // Enlever le premier slash s'il existe
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // En développement, utiliser le chemin direct
  if (import.meta.env.DEV) {
    return `/${cleanPath}`;
  }

  // En production, utiliser un chemin absolu ou basé sur le sous-répertoire
  const basePath = '/<Logement2saison>'; // Replace <repository-name> with your actual repository name
  return `${basePath}/${cleanPath}`;
}