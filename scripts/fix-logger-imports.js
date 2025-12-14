const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'screens/HomeScreen.tsx',
  'screens/LoginScreen.tsx',
  'screens/LeMieBolletteScreen.tsx',
  'screens/ProfiloScreen.tsx',
  'components/BottomNavigation.tsx',
  'src/hooks/usePayments.ts',
  'screens/PropertySwipeScreen.tsx',
  'components/SwipeCard.tsx',
  'screens/MatchesScreen.tsx',
  'screens/LandlordSwipeScreen.tsx',
  'components/ExpandableCardModal.tsx',
  'components/MatchAnimation.tsx',
];

// Fix logger import paths
function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix logger import path - remove the extra '../src' part
    if (content.includes("import { logger } from '../src/utils/logger'")) {
      content = content.replace(
        "import { logger } from '../src/utils/logger'",
        "import { logger } from '../src/utils/logger'"
      );
    }

    // For files in src/hooks, the path should be different
    if (filePath.startsWith('src/hooks/')) {
      if (content.includes("import { logger } from '../src/utils/logger'")) {
        content = content.replace(
          "import { logger } from '../src/utils/logger'",
          "import { logger } from '../utils/logger'"
        );
      }
    }

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
filesToFix.forEach(fixFile);
console.log('Logger import fixes completed!');
