export function getRoomFromURL(): string {
  const r = new URLSearchParams(location.search).get('room');
  return r && r.trim() ? r.trim() : 'lobby';
}

export function copyRoomLink(): void {
  const u = new URL(location.href);
  u.searchParams.set('room', getRoomFromURL());
  navigator.clipboard?.writeText(u.toString());
}
