const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'components/MatchAnimation.tsx',
  'components/ExpandableCardModal.tsx',
  'screens/LandlordSwipeScreen.tsx',
  'screens/MatchesScreen.tsx',
  'components/SwipeCard.tsx',
  'screens/PropertySwipeScreen.tsx',
  'src/hooks/usePayments.ts',
  'src/hooks/useSupabaseAuth.ts',
  'components/BottomNavigation.tsx',
  'screens/ProfiloScreen.tsx',
  'screens/HomeScreen.tsx',
  'screens/LeMieBolletteScreen.tsx',
];

// Fix import paths
function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix logger import path
    if (content.includes("import { logger } from './src/utils/logger'")) {
      content = content.replace(
        "import { logger } from './src/utils/logger'",
        "import { logger } from '../src/utils/logger'"
      );
    }

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
filesToFix.forEach(fixFile);
console.log('Import path fixes completed!');
