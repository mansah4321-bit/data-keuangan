import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

function gasHtmlPlugin() {
  return {
    name: 'gas-html-plugin',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html
        .replace(/<script type="module" crossorigin>/g, '<script>')
        .replace(/<script type="module">/g, '<script>')
        .replace(/<script crossorigin/g, '<script');
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isBuild ? [viteSingleFile(), gasHtmlPlugin()] : []),
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});

