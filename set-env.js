const fs = require('fs');

// process.env.API_KEY leerá la variable que configuraste en Vercel
const envConfigFile = `export const environment = {
  production: true,
  baseUrl: 'https://api.themoviedb.org/3',
  apiKey: '${process.env.API_KEY}',
  imgPath: 'https://image.tmdb.org/t/p'
};
`;

const targetFolderPath = './src/environments';
if (!fs.existsSync(targetFolderPath)) {
  fs.mkdirSync(targetFolderPath, { recursive: true });
}
const targetPath = './src/environments/environment.ts';
fs.writeFileSync(targetPath, envConfigFile);
console.log('✅ Archivo environment.ts generado correctamente en Vercel.');
