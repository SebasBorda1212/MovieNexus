const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
// Cambia esto a la ruta donde tengas tu logo (debe ser cuadrado)
const inputFile = './public/logo.png';
const outputDir = './public/assets/icons';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(inputFile)) {
  console.error(`ERROR: No se encontró el archivo ${inputFile}`);
  console.error('Por favor, coloca tu logo en esa ruta o cambia el script.');
  process.exit(1);
}

console.log('Generando íconos...');

sizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 17, g: 24, b: 39, alpha: 1 } // #111827 (Theme color)
    })
    .toFile(`${outputDir}/icon-${size}x${size}.png`)
    .then(() => console.log(`Generado: icon-${size}x${size}.png`))
    .catch(err => console.error(err));
});
