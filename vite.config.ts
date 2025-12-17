import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 你的 Repo 網址是 https://github.com/woszma/NFC-Keychain-Journey-events
  // 所以 base 必須是 /NFC-Keychain-Journey-events/
  base: '/NFC-Keychain-Journey-events/', 
});