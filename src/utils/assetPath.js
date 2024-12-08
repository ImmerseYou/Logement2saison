export function getAssetPath(path) {
  // Enlever le premier slash s'il existe
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // En développement, utiliser le chemin direct
  if (import.meta.env.DEV) {
    return `/${cleanPath}`;
  }

  // En production, utiliser le chemin basé sur le sous-répertoire GitHub Pages
  return `${import.meta.env.BASE_URL}${cleanPath}`;
}