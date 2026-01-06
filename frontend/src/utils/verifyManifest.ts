/**
 * Verifies that the TON Connect manifest is accessible and valid
 */
export async function verifyManifest(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Manifest fetch failed: HTTP ${response.status}`);
      return false;
    }

    const manifest = await response.json();
    const required = ['url', 'name', 'iconUrl'];

    const isValid = required.every(field => field in manifest);

    if (!isValid) {
      console.error('Manifest missing required fields:', {
        found: Object.keys(manifest),
        required
      });
    }

    return isValid;
  } catch (error) {
    console.error('Manifest verification failed:', error);
    return false;
  }
}

/**
 * Logs manifest verification result to console
 */
export async function logManifestStatus(url: string): Promise<void> {
  const isValid = await verifyManifest(url);

  if (isValid) {
    console.log('✓ TON Connect manifest verified successfully');
  } else {
    console.warn('⚠ TON Connect manifest verification failed');
  }
}
