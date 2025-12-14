const fs = require('fs');
const path = require('path');

// Files to clean (excluding node_modules, .git, etc.)
const filesToClean = [
  'App.tsx',
  'screens/LeMieBolletteScreen.tsx',
  'screens/HomeScreen.tsx',
  'screens/ProfiloScreen.tsx',
  'components/BottomNavigation.tsx',
  'src/hooks/useSupabaseAuth.ts',
  'src/hooks/usePayments.ts',
  'screens/LoginScreen.tsx',
  'screens/PropertySwipeScreen.tsx',
  'components/SwipeCard.tsx',
  'screens/MatchesScreen.tsx',
  'screens/LandlordSwipeScreen.tsx',
  'components/ExpandableCardModal.tsx',
  'components/MatchAnimation.tsx',
];

// Replace console.log with logger.debug
function cleanFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add logger import if not present
    if (content.includes('console.log') && !content.includes('import { logger }')) {
      // Find the last import statement
      const importRegex = /import.*from.*['"];?\s*$/gm;
      const imports = content.match(importRegex);
      if (imports) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        content = content.slice(0, insertIndex) + 
          "\nimport { logger } from './src/utils/logger';\n" + 
          content.slice(insertIndex);
      }
    }

    // Replace console.log with logger.debug
    content = content.replace(/console\.log\(/g, 'logger.debug(');
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    content = content.replace(/console\.info\(/g, 'logger.info(');
    content = content.replace(/console\.debug\(/g, 'logger.debug(');
    // Keep console.error as logger.error (already handled above)

    fs.writeFileSync(fullPath, content);
    console.log(`Cleaned: ${filePath}`);
  } catch (error) {
    console.error(`Error cleaning ${filePath}:`, error.message);
  }
}

// Clean all files
filesToClean.forEach(cleanFile);
console.log('Console log cleanup completed!');
