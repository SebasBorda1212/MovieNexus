const fs = require('fs');

// Usa la variable de entorno de Vercel. Si no existe, usa la clave local como fallback.
const apiKey = process.env.API_KEY || '575dd81c257bdc29a7e64c8f46836de4';

const envConfigFile = `export const environment = {
  production: true,
  baseUrl: 'https://api.themoviedb.org/3',
  apiKey: '${apiKey}',
  imgPath: 'https://image.tmdb.org/t/p'
};
`;

const targetFolderPath = './src/environments';
if (!fs.existsSync(targetFolderPath)) {
  fs.mkdirSync(targetFolderPath, { recursive: true });
}

const targetPath = './src/environments/environment.ts';
const targetDevPath = './src/environments/environment.development.ts';
fs.writeFileSync(targetPath, envConfigFile);
fs.writeFileSync(targetDevPath, envConfigFile);
console.log(`✅ environment.ts y environment.development.ts generados con apiKey: ${apiKey.substring(0, 6)}...`);
