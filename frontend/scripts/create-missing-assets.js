/**
 * This script creates any missing assets needed for the application build,
 * such as favicon and logo files.
 */
const fs = require('fs');
const path = require('path');

// Paths
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const FAVICON_PATH = path.join(PUBLIC_DIR, 'favicon.ico');
const LOGO192_PATH = path.join(PUBLIC_DIR, 'logo192.png');
const LOGO512_PATH = path.join(PUBLIC_DIR, 'logo512.png');

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Create a simple 1x1 pixel transparent placeholder
const createPlaceholder = (filePath) => {
  if (!fileExists(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (ext === '.ico') {
        // Create a minimal 1x1 ICO file (16 bytes)
        const buffer = Buffer.from([
          0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x01, 
          0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x0C, 0x00, 
          0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 
          0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 
          0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x00, 0x00, 
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC3, 0x07, 
          0x3F, 0x00, 0x00, 0x00, 0x00
        ]);
        fs.writeFileSync(filePath, buffer);
      } else if (ext === '.png') {
        // Create a minimal 1x1 PNG file with the brand color (red)
        const buffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 
          0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 
          0x54, 0x08, 0xD7, 0x63, 0xC8, 0xC0, 0x00, 0x00, 
          0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 
          0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 
          0xAE, 0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(filePath, buffer);
      }
      
      console.log(`Created placeholder for ${path.basename(filePath)}`);
    } catch (err) {
      console.error(`Error creating placeholder for ${path.basename(filePath)}:`, err);
    }
  } else {
    console.log(`${path.basename(filePath)} already exists, skipping`);
  }
};

// Main function
const main = () => {
  console.log('Checking for missing assets...');
  
  // Create favicon.ico if missing
  createPlaceholder(FAVICON_PATH);
  
  // Create logo192.png if missing
  createPlaceholder(LOGO192_PATH);
  
  // Create logo512.png if missing
  createPlaceholder(LOGO512_PATH);
  
  console.log('Asset check complete!');
};

// Run the script
main(); 