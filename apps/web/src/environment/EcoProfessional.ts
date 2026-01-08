/**
 * Professional Eco Environment
 * Uses high-quality 3D models from PolyHaven/Sketchfab
 * Professional quality like Arthur, RaveSpace Metaverse Nordwest
 */

import type { TemplateInstance } from '@metaverse/core';
import * as THREE from 'three';

import { ProfessionalLandscapeBuilder } from './ProfessionalLandscape';

/**
 * Build professional eco environment with high-quality assets
 * Loads assets from template manifest or uses intelligent placement
 */
export async function buildEcoProfessional(
  scene: THREE.Scene,
  template?: TemplateInstance | null
): Promise<void> {
  const builder = new ProfessionalLandscapeBuilder(scene);

  // Load asset placements from manifest if available
  let assetPlacements: Array<{
    id: string;
    url: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    variant?: number;
  }> = [];

  interface AssetPlacement {
    id?: string;
    assetId?: string;
    model?: string;
    url?: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    variant?: number;
  }
  if (template?.manifest?.placedAssets && template.manifest.placedAssets.length > 0) {
    // Use placements from manifest
    assetPlacements = (template.manifest.placedAssets as AssetPlacement[])
      .filter(
        (placement) => (placement.id || placement.assetId) && (placement.model || placement.url)
      )
      .map((placement) => ({
        id: (placement.id || placement.assetId) as string,
        url: (placement.model || placement.url) as string,
        position: placement.position,
        rotation: placement.rotation,
        scale: placement.scale,
        variant: placement.variant,
      }));
    console.log(`📦 Loading ${assetPlacements.length} assets from manifest`);
  } else {
    // Fallback to default professional placements
    assetPlacements = [
      // Trees - creating natural forest boundaries
      {
        id: 'tree_oak_01',
        url: '/assets/watt-eco/models/tree_oak_01.glb',
        position: [8, 0, -3] as [number, number, number],
        scale: 1.0,
        variant: 0,
      },
      {
        id: 'tree_pine_01',
        url: '/assets/watt-eco/models/tree_pine_01.glb',
        position: [-8, 0, -3] as [number, number, number],
        scale: 1.1,
        variant: 1,
      },
      {
        id: 'tree_birch_01',
        url: '/assets/watt-eco/models/tree_birch_01.glb',
        position: [10, 0, 2] as [number, number, number],
        scale: 0.9,
        variant: 2,
      },
      {
        id: 'tree_oak_01',
        url: '/assets/watt-eco/models/tree_oak_01.glb',
        position: [-10, 0, 2] as [number, number, number],
        scale: 1.0,
        variant: 0,
      },
      {
        id: 'tree_pine_01',
        url: '/assets/watt-eco/models/tree_pine_01.glb',
        position: [12, 0, -6] as [number, number, number],
        scale: 1.2,
        variant: 1,
      },
      {
        id: 'tree_birch_01',
        url: '/assets/watt-eco/models/tree_birch_01.glb',
        position: [-12, 0, -6] as [number, number, number],
        scale: 0.9,
        variant: 2,
      },

      // Rocks near the lake
      {
        id: 'rock_large_01',
        url: '/assets/watt-eco/models/rock_large_01.glb',
        position: [-4, 0, -12] as [number, number, number],
        scale: 0.8,
      },
      {
        id: 'rock_medium_01',
        url: '/assets/watt-eco/models/rock_medium_01.glb',
        position: [-8, 0, -14] as [number, number, number],
        scale: 0.6,
      },
      {
        id: 'rock_small_01',
        url: '/assets/watt-eco/models/rock_small_01.glb',
        position: [-2, 0, -13] as [number, number, number],
        scale: 0.4,
      },

      // Vegetation patches
      {
        id: 'grass_patch_01',
        url: '/assets/watt-eco/models/grass_patch_01.glb',
        position: [3, 0, -4] as [number, number, number],
        scale: 0.3,
      },
      {
        id: 'grass_patch_01',
        url: '/assets/watt-eco/models/grass_patch_01.glb',
        position: [-3, 0, -4] as [number, number, number],
        scale: 0.3,
      },
      {
        id: 'bush_01',
        url: '/assets/watt-eco/models/bush_01.glb',
        position: [5, 0, -6] as [number, number, number],
        scale: 0.5,
      },
      {
        id: 'bush_01',
        url: '/assets/watt-eco/models/bush_01.glb',
        position: [-5, 0, -6] as [number, number, number],
        scale: 0.5,
      },
    ];
    console.log(`📦 Using ${assetPlacements.length} default asset placements`);
  }

  // Get texture paths from manifest or use defaults
  const groundTexture =
    template?.manifest?.assets?.textures?.ground || '/assets/watt-eco/textures/ground_forest.jpg';
  const pathTexture =
    template?.manifest?.assets?.textures?.path || '/assets/watt-eco/textures/ground_dirt.jpg';

  // Build landscape with professional assets
  await builder.build({
    assets: assetPlacements,
    groundTexture,
    pathTexture,
    enableShadows: true,
    enableLOD: true,
  });

  console.log(`✅ Professional eco environment built with ${assetPlacements.length} assets`);
}
