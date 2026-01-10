export type Role = 'host' | 'moderator' | 'speaker' | 'guest';

export function canSpeak(role: Role): boolean {
  return role !== 'guest';
}

export function canModerate(role: Role): boolean {
  return role === 'host' || role === 'moderator';
}

export function canPublish(role: Role): boolean {
  return role !== 'guest';
}

export function canSubscribe(_role: Role): boolean {
  return true; // All roles can subscribe
}
