import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink: '#080B12', panel: '#101725', line: '#202B3D', muted: '#8995A8', electric: '#5B8CFF' }, boxShadow: { glow: '0 0 40px rgba(91, 140, 255, 0.12)' } } }, plugins: [] };
export default config;
