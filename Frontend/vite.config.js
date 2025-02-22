import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
		port: 7000,
		proxy: {
			"/api": {
				target: "http://localhost:7020",
				changeOrigin: true,
			},
		},
	},
})
