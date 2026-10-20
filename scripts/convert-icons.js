const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
const imagesDir = path.join(__dirname, '..', 'assets', 'icons');

async function convertSvgToPng() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  const sizes = [16, 48, 128];
  
  for (const size of sizes) {
    const outputPath = path.join(imagesDir, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created icon-${size}.png`);
  }
  
  console.log('All icons created successfully!');
}

convertSvgToPng().catch(console.error);

