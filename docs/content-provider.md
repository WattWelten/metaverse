# Content Provider

Das Content Provider System ermöglicht die Integration verschiedener CMS-Lösungen.

## Provider-Typen

### Local Provider

Lädt Content aus lokalen JSON-Dateien:

```typescript
import { LocalProvider } from '@metaverse/content';

const provider = new LocalProvider('/content/local');

const entry = await provider.getEntry('posts', 'post-1');
const posts = await provider.list('posts');
```

### Strapi Provider

Integration mit Strapi CMS:

```typescript
import { StrapiProvider } from '@metaverse/content';

const provider = new StrapiProvider({
  baseUrl: 'https://cms.example.com',
  token: 'your-token',
});

const entry = await provider.getEntry('articles', '1');
const articles = await provider.list('articles', { published: true });

// Erstellen
const newArticle = await provider.create('articles', {
  title: 'New Article',
  content: '...',
});

// Aktualisieren
await provider.update('articles', '1', {
  title: 'Updated Title',
});

// Asset hochladen
const asset = await provider.uploadAsset(file, 'images/');
```

## Factory Pattern

```typescript
import { createContentProvider } from '@metaverse/content';

const provider = createContentProvider('local');
// oder
const provider = createContentProvider('strapi', {
  baseUrl: 'https://cms.example.com',
  token: 'your-token',
});
```

