export type Quality = 'low' | 'fair' | 'high';
export type ViewMode = 'fp' | 'tp';

export interface Prefs {
  username: string;
  avatarUrl?: string;
  quality: Quality;
  viewMode: ViewMode;
  mouseInvert?: boolean;
  mouseLockEnabled?: boolean;
  audioVolume?: number;
  recentAvatars?: string[];
  role?: 'host' | 'moderator' | 'speaker' | 'guest';
}

const KEY = 'ww_prefs_v1';
const DEF: Prefs = {
  username: 'Gast',
  quality: 'fair',
  viewMode: 'tp',
  mouseInvert: false,
  mouseLockEnabled: true,
  audioVolume: 1.0,
};

export function loadPrefs(): Prefs {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEF, ...v };
  } catch {
    return DEF;
  }
}

export function savePrefs(p: Partial<Prefs>): void {
  const cur = loadPrefs();
  localStorage.setItem(KEY, JSON.stringify({ ...cur, ...p }));
}
