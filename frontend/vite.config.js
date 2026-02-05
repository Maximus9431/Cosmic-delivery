import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/Cosmic-delivery/',  // Имя твоего GitHub репо
    plugins: [react()],
})
