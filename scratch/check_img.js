const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '../public/assets/images/product/glow-skincare-bundle.png');
console.log("Path:", imgPath);
console.log("Exists:", fs.existsSync(imgPath));
if (fs.existsSync(imgPath)) {
  const stats = fs.statSync(imgPath);
  console.log("Size in bytes:", stats.size);
}
