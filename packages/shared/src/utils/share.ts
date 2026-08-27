export function buildShareUrl(origin: string, proposalId: string): string {
  return `${origin}/${proposalId}`;
}

export function buildWhatsAppShareUrl(shareUrl: string, text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
}
