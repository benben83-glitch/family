/**
 * Les clés d'objets Supabase Storage rejettent certains caractères (virgules,
 * espaces, accents...) qu'on retrouve couramment dans des noms de fichiers
 * générés par un téléphone ou un outil tiers (ex. "Image 19 août, 00_48.jpg").
 * On ne garde jamais le nom d'origine tel quel : seule l'extension est
 * réutilisée, le reste du nom est un UUID.
 */
export function safeStorageFilename(originalName: string): string {
  const match = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = match ? match[1].toLowerCase() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}
