export function isWebMCPEnabled(): boolean {
  return new URLSearchParams(window.location.search).get('webmcp') !== 'off';
}