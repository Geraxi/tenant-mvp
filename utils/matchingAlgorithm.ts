import { User, UserPreferences } from '../types';

export const calculateMatchScore = (user1: User, user2: User): number => {
  let score = 0;
  const maxScore = 100;

  // Verification bonus
  if (user1.verified === 'verified' && user2.verified === 'verified') {
    score += 20;
  }

  // Location proximity (simplified)
  if (user1.location === user2.location) {
    score += 15;
  }

  // Type compatibility
  if (
    (user1.userType === 'tenant' && user2.userType === 'homeowner') ||
    (user1.userType === 'homeowner' && user2.userType === 'tenant') ||
    (user1.userType === 'roommate' && user2.userType === 'roommate')
  ) {
    score += 25;
  }

  // Preference matching
  const pref1 = user1.preferences;
  const pref2 = user2.preferences;

  // Budget/Rent matching for tenant-homeowner
  if (pref1.budget && pref2.rent) {
    const budgetDiff = Math.abs(pref1.budget - pref2.rent);
    if (budgetDiff < 200) score += 15;
    else if (budgetDiff < 500) score += 10;
  }

  // Pet and smoking preferences
  if (pref1.petFriendly === pref2.petFriendly) score += 5;
  if (pref1.smoking === pref2.smoking) score += 5;

  // Age range compatibility
  if (pref1.ageRange && pref2.ageRange) {
    const overlap = 
      Math.min(pref1.ageRange.max, pref2.ageRange.max) - 
      Math.max(pref1.ageRange.min, pref2.ageRange.min);
    if (overlap > 0) score += 10;
  }

  // Special preferences (e.g., cabin crew near airport)
  if (pref2.nearAirport && pref1.preferredTenantTypes?.includes('cabin crew')) {
    score += 15;
  }

  return Math.min(score, maxScore);
};

export const shouldShowUser = (currentUser: User, potentialMatch: User): boolean => {
  // Don\'t show yourself
  if (currentUser.id === potentialMatch.id) return false;

  // Only show verified users if current user is verified
  if (currentUser.verified === 'verified' && potentialMatch.verified !== 'verified') {
    return false;
  }

  // Type compatibility check
  if (currentUser.userType === 'tenant' && potentialMatch.userType !== 'homeowner') {
    return false;
  }
  if (currentUser.userType === 'homeowner' && potentialMatch.userType !== 'tenant') {
    return false;
  }
  if (currentUser.userType === 'roommate' && potentialMatch.userType !== 'roommate') {
    return false;
  }

  return true;
};