import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 這裡非常重要：必須設定成你的 Repo 名字，前後都要有斜線
  base: '/NFC-Keychain-Journey-events/', 
});