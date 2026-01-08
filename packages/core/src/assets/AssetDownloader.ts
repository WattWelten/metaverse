/**
 * Asset Downloader for PolyHaven and Sketchfab APIs
 * Automatically downloads HDRI and 3D models for templates
 */

interface DownloadOptions {
  outputPath: string;
  templateId?: string;
}

interface PolyHavenAsset {
  id: string;
  name: string;
  type: 'hdri' | 'texture' | 'model';
}

interface SketchfabAsset {
  id: string;
  name: string;
  license: 'CC0' | 'CC-BY' | 'CC-BY-SA';
}

export class AssetDownloader {
  private sketchfabApiKey?: string;

  constructor(options?: { polyHavenApiKey?: string; sketchfabApiKey?: string }) {
    // polyHavenApiKey is stored for potential future use but not currently required
    // Reserved for future API authentication if needed
    if (options?.polyHavenApiKey) {
      // Future: Store API key for authenticated requests
    }
    this.sketchfabApiKey = options?.sketchfabApiKey;
  }

  /**
   * Download HDRI from PolyHaven
   * PolyHaven API: https://api.polyhaven.com/files?type=hdr&id={id}
   */
  async downloadPolyHavenHDRI(hdriId: string, options: DownloadOptions): Promise<string> {
    try {
      // PolyHaven API doesn't require authentication for public assets
      const apiUrl = `https://api.polyhaven.com/files?type=hdr&id=${hdriId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch HDRI info: ${response.statusText}`);
      }

      const data = await response.json();

      // PolyHaven API returns structure: { hdr: { '1k': {...}, '2k': {...}, '4k': {...}, '8k': {...} } }
      // Each resolution has: { url: string, size: number, ... }
      const hdriData = data.hdr;
      if (!hdriData) {
        throw new Error('No HDRI data found in response');
      }

      // Prefer 4K, fallback to 2K, then 1K
      const hdriUrl =
        hdriData['4k']?.url || hdriData['2k']?.url || hdriData['1k']?.url || hdriData['8k']?.url;

      if (!hdriUrl) {
        throw new Error('No HDRI URL found in response');
      }

      // Download the file
      const fileResponse = await fetch(hdriUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download HDRI: ${fileResponse.statusText}`);
      }

      // In Node.js environment, write to file system
      if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const buffer = Buffer.from(await fileResponse.arrayBuffer());
        const quality = hdriData['4k'] ? '4k' : hdriData['2k'] ? '2k' : '1k';
        const outputFile = path.join(options.outputPath, `${hdriId}_${quality}.hdr`);
        fs.writeFileSync(outputFile, buffer);
        console.log(
          `✅ Downloaded HDRI: ${hdriId} (${quality}, ${(buffer.length / 1024 / 1024).toFixed(2)} MB)`
        );
        return outputFile;
      } else {
        // Browser: return URL
        return hdriUrl;
      }
    } catch (error) {
      console.error('Failed to download PolyHaven HDRI:', error);
      throw error;
    }
  }

  /**
   * Download 3D model from PolyHaven
   * PolyHaven API: https://api.polyhaven.com/files?type=model&id={id}
   */
  async downloadPolyHavenModel(modelId: string, options: DownloadOptions): Promise<string> {
    try {
      const apiUrl = `https://api.polyhaven.com/files?type=model&id=${modelId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch model info: ${response.statusText}`);
      }

      const data = await response.json();

      // PolyHaven API returns: { glb: {...}, fbx: {...}, obj: {...} }
      // Each format has: { url: string, size: number, ... }
      // Prefer GLB format for web
      const modelData = data.glb || data.fbx || data.obj;
      if (!modelData || !modelData.url) {
        throw new Error('No model URL found in response');
      }

      const modelUrl = modelData.url;
      const format = data.glb ? 'glb' : data.fbx ? 'fbx' : 'obj';

      const fileResponse = await fetch(modelUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download model: ${fileResponse.statusText}`);
      }

      if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const buffer = Buffer.from(await fileResponse.arrayBuffer());
        const outputFile = path.join(options.outputPath, `${modelId}.${format}`);
        fs.writeFileSync(outputFile, buffer);
        console.log(
          `✅ Downloaded model: ${modelId} (${format}, ${(buffer.length / 1024 / 1024).toFixed(2)} MB)`
        );
        return outputFile;
      } else {
        return modelUrl;
      }
    } catch (error) {
      console.error('Failed to download PolyHaven model:', error);
      throw error;
    }
  }

  /**
   * Search PolyHaven assets
   * PolyHaven API: https://api.polyhaven.com/files?type={type}
   * Returns all assets of that type, then filter by query
   */
  async searchPolyHaven(
    query: string,
    type: 'hdri' | 'texture' | 'model' = 'hdri'
  ): Promise<PolyHavenAsset[]> {
    try {
      const apiUrl = `https://api.polyhaven.com/files?type=${type}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to search PolyHaven: ${response.statusText}`);
      }

      const data = await response.json();
      const assets: PolyHavenAsset[] = [];

      // PolyHaven API returns object with asset IDs as keys
      for (const [id, info] of Object.entries(data)) {
        const assetInfo = info as { name?: string; tags?: string[] };
        const name = assetInfo.name || id;
        const tags = assetInfo.tags || [];

        // Search in name and tags
        const searchLower = query.toLowerCase();
        const matchesName = name.toLowerCase().includes(searchLower);
        const matchesTags = tags.some((tag) => tag.toLowerCase().includes(searchLower));

        if (matchesName || matchesTags) {
          assets.push({
            id,
            name,
            type,
          });
        }
      }

      return assets;
    } catch (error) {
      console.error('Failed to search PolyHaven:', error);
      return [];
    }
  }

  /**
   * Download Sketchfab model (requires API key for download)
   */
  async downloadSketchfabModel(modelId: string, options: DownloadOptions): Promise<string> {
    if (!this.sketchfabApiKey) {
      throw new Error('Sketchfab API key required for downloads');
    }

    try {
      // Get model info
      const infoUrl = `https://api.sketchfab.com/v3/models/${modelId}`;
      const infoResponse = await fetch(infoUrl, {
        headers: {
          Authorization: `Token ${this.sketchfabApiKey}`,
        },
      });

      if (!infoResponse.ok) {
        throw new Error(`Failed to fetch model info: ${infoResponse.statusText}`);
      }

      // Model info fetched but not used (could be used for validation in future)
      await infoResponse.json(); // Reserved for future validation

      // Get download URL
      const downloadUrl = `https://api.sketchfab.com/v3/models/${modelId}/download`;
      const downloadResponse = await fetch(downloadUrl, {
        headers: {
          Authorization: `Token ${this.sketchfabApiKey}`,
        },
      });

      if (!downloadResponse.ok) {
        throw new Error(`Failed to get download URL: ${downloadResponse.statusText}`);
      }

      const downloadData = await downloadResponse.json();
      const glbUrl = downloadData.glb?.url;

      if (!glbUrl) {
        throw new Error('No GLB URL found in download response');
      }

      // Download the file
      const fileResponse = await fetch(glbUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download model: ${fileResponse.statusText}`);
      }

      if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const buffer = Buffer.from(await fileResponse.arrayBuffer());
        const outputFile = path.join(options.outputPath, `${modelId}.glb`);
        fs.writeFileSync(outputFile, buffer);
        return outputFile;
      } else {
        return glbUrl;
      }
    } catch (error) {
      console.error('Failed to download Sketchfab model:', error);
      throw error;
    }
  }

  /**
   * Search Sketchfab for CC0 models
   */
  async searchSketchfab(
    query: string,
    license: 'CC0' | 'CC-BY' = 'CC0'
  ): Promise<SketchfabAsset[]> {
    try {
      const apiUrl = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&downloadable=true&license=${license}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to search Sketchfab: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        results?: Array<{ uid: string; name: string; license?: string }>;
      };
      return (data.results || []).map((result) => {
        // Validate license type
        const resultLicense = result.license as 'CC0' | 'CC-BY' | 'CC-BY-SA' | undefined;
        const validLicense: 'CC0' | 'CC-BY' | 'CC-BY-SA' =
          resultLicense === 'CC0' || resultLicense === 'CC-BY' || resultLicense === 'CC-BY-SA'
            ? resultLicense
            : license;
        return {
          id: result.uid,
          name: result.name,
          license: validLicense,
        };
      });
    } catch (error) {
      console.error('Failed to search Sketchfab:', error);
      return [];
    }
  }
}
