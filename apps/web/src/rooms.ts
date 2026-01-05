export function getRoomFromURL(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || 'lobby';
}

export function getCopyLink(roomId: string): string {
  return `${window.location.origin}${window.location.pathname}?room=${roomId}`;
}

export function copyRoomLink(roomId: string): Promise<void> {
  const link = getCopyLink(roomId);
  return navigator.clipboard.writeText(link);
}
