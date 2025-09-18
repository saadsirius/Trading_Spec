export function formatDateTime(ts: number | string, locale = 'fr-FR') {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleString(locale, { year:'2-digit', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
}
export function formatHm(ts: number | string, locale = 'fr-FR') {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleTimeString(locale, { hour:'2-digit', minute:'2-digit' });
}
