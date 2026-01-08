/**
 * Professional Asset Configuration
 * Curated list of high-quality assets from PolyHaven
 * Similar quality to Arthur, RaveSpace Metaverse Nordwest
 */

export interface AssetConfig {
  id: string;
  polyHavenId: string;
  name: string;
  category: 'tree' | 'rock' | 'vegetation' | 'ground' | 'hdri';
  scale?: number;
  variants?: number;
}

/**
 * Professional HDRI environments
 * High-quality 4K HDRIs for photorealistic lighting
 */
export const PROFESSIONAL_HDRIS: AssetConfig[] = [
  {
    id: 'forest_slope',
    polyHavenId: 'forest_slope',
    name: 'Forest Slope',
    category: 'hdri',
  },
  {
    id: 'spruit_sunrise',
    polyHavenId: 'spruit_sunrise',
    name: 'Spruit Sunrise',
    category: 'hdri',
  },
  {
    id: 'sunset_jhb_central',
    polyHavenId: 'sunset_jhb_central',
    name: 'Sunset JHB Central',
    category: 'hdri',
  },
  {
    id: 'kiara_1_dawn',
    polyHavenId: 'kiara_1_dawn',
    name: 'Kiara Dawn',
    category: 'hdri',
  },
];

/**
 * Professional tree models
 * High-quality forest trees from PolyHaven
 */
export const PROFESSIONAL_TREES: AssetConfig[] = [
  {
    id: 'tree_oak_01',
    polyHavenId: 'tree_oak_01',
    name: 'Oak Tree',
    category: 'tree',
    scale: 1.0,
    variants: 3,
  },
  {
    id: 'tree_pine_01',
    polyHavenId: 'tree_pine_01',
    name: 'Pine Tree',
    category: 'tree',
    scale: 1.2,
    variants: 2,
  },
  {
    id: 'tree_birch_01',
    polyHavenId: 'tree_birch_01',
    name: 'Birch Tree',
    category: 'tree',
    scale: 0.9,
    variants: 2,
  },
];

/**
 * Professional rock models
 * Realistic rock formations
 */
export const PROFESSIONAL_ROCKS: AssetConfig[] = [
  {
    id: 'rock_large_01',
    polyHavenId: 'rock_large_01',
    name: 'Large Rock',
    category: 'rock',
    scale: 0.8,
    variants: 3,
  },
  {
    id: 'rock_medium_01',
    polyHavenId: 'rock_medium_01',
    name: 'Medium Rock',
    category: 'rock',
    scale: 0.6,
    variants: 4,
  },
  {
    id: 'rock_small_01',
    polyHavenId: 'rock_small_01',
    name: 'Small Rock',
    category: 'rock',
    scale: 0.4,
    variants: 5,
  },
];

/**
 * Professional vegetation
 * Grass, bushes, flowers
 */
export const PROFESSIONAL_VEGETATION: AssetConfig[] = [
  {
    id: 'grass_patch_01',
    polyHavenId: 'grass_patch_01',
    name: 'Grass Patch',
    category: 'vegetation',
    scale: 0.3,
    variants: 4,
  },
  {
    id: 'bush_01',
    polyHavenId: 'bush_01',
    name: 'Bush',
    category: 'vegetation',
    scale: 0.5,
    variants: 3,
  },
  {
    id: 'flower_patch_01',
    polyHavenId: 'flower_patch_01',
    name: 'Flower Patch',
    category: 'vegetation',
    scale: 0.2,
    variants: 2,
  },
];

/**
 * Professional ground textures
 * Photorealistic terrain textures
 */
export const PROFESSIONAL_GROUND_TEXTURES: AssetConfig[] = [
  {
    id: 'ground_forest',
    polyHavenId: 'ground_forest',
    name: 'Forest Ground',
    category: 'ground',
  },
  {
    id: 'ground_dirt',
    polyHavenId: 'ground_dirt',
    name: 'Dirt Path',
    category: 'ground',
  },
  {
    id: 'ground_grass',
    polyHavenId: 'ground_grass',
    name: 'Grass',
    category: 'ground',
  },
];

/**
 * Get all professional assets
 */
export function getAllProfessionalAssets(): AssetConfig[] {
  return [
    ...PROFESSIONAL_HDRIS,
    ...PROFESSIONAL_TREES,
    ...PROFESSIONAL_ROCKS,
    ...PROFESSIONAL_VEGETATION,
    ...PROFESSIONAL_GROUND_TEXTURES,
  ];
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: AssetConfig['category']): AssetConfig[] {
  return getAllProfessionalAssets().filter((asset) => asset.category === category);
}
