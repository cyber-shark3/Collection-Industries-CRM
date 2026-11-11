import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}"], theme: { extend: { colors: { panel: "#101725", line: "#202B3D" } } }, plugins: [] } satisfies Config;