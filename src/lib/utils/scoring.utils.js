/**
 * Scoring Utilities
 * Pure functions for darts scoring calculations
 */

/**
 * Calculate the value of a dart throw
 * @param {number} multiplier - 1 (single), 2 (double), 3 (treble)
 * @param {number} number - 0-20 or 25 (bull)
 * @returns {number} - Calculated dart value
 */
export function calculateDartValue(multiplier, number) {
  // Bull (25) can only be single (25) or double (50)
  if (number === 25) {
    return multiplier === 2 ? 50 : 25
  }
  return multiplier * number
}

/**
 * Calculate new score after a dart throw
 * @param {number} currentScore - Current remaining score
 * @param {number} dartValue - Value of the dart thrown
 * @returns {number} - New score (or current if bust)
 */
export function calculateNewScore(currentScore, dartValue) {
  const newScore = currentScore - dartValue
  return newScore >= 0 ? newScore : currentScore
}

/**
 * Check if a throw results in a bust
 * @param {number} currentScore - Current remaining score
 * @param {number} dartValue - Value of the dart thrown
 * @param {number} multiplier - The multiplier used (1, 2, or 3)
 * @returns {boolean} - True if bust
 */
export function isBust(currentScore, dartValue, multiplier) {
  const newScore = currentScore - dartValue

  // Bust if score goes below 0
  if (newScore < 0) return true

  // Bust if score goes to 1 (can't checkout on 1)
  if (newScore === 1) return true

  // Bust if score goes to 0 but not on a double
  if (newScore === 0 && multiplier !== 2) return true

  return false
}

/**
 * Check if a throw is a valid checkout
 * @param {number} currentScore - Current remaining score
 * @param {number} dartValue - Value of the dart thrown
 * @param {number} multiplier - The multiplier used
 * @returns {boolean} - True if valid checkout
 */
export function isCheckout(currentScore, dartValue, multiplier) {
  return currentScore - dartValue === 0 && multiplier === 2
}

/**
 * Check if a score is checkable (can be finished with remaining darts)
 * @param {number} score - Remaining score
 * @returns {boolean} - True if checkable
 */
export function isCheckable(score) {
  // Minimum checkout is 2 (double 1)
  // Maximum checkout with 3 darts is 170 (T20, T20, D25)
  return score >= 2 && score <= 170
}

/**
 * Calculate the three-dart average
 * @param {number} totalScore - Total points scored
 * @param {number} dartsThrown - Number of darts thrown
 * @returns {number} - Three-dart average
 */
export function calculateThreeDartAverage(totalScore, dartsThrown) {
  if (dartsThrown === 0) return 0
  return (totalScore / dartsThrown) * 3
}

/**
 * Calculate checkout percentage
 * @param {number} successfulCheckouts - Number of successful checkouts
 * @param {number} checkoutAttempts - Number of checkout attempts
 * @returns {number} - Checkout percentage
 */
export function calculateCheckoutPercentage(successfulCheckouts, checkoutAttempts) {
  if (checkoutAttempts === 0) return 0
  return (successfulCheckouts / checkoutAttempts) * 100
}

/**
 * Get the maximum possible score with remaining darts
 * @param {number} dartsRemaining - Darts remaining in turn (1-3)
 * @returns {number} - Maximum possible score
 */
export function getMaxPossibleScore(dartsRemaining) {
  // Max single dart is T20 = 60
  return dartsRemaining * 60
}

/**
 * Format a dart throw for display
 * @param {number} multiplier - 1, 2, or 3
 * @param {number} number - 0-20 or 25
 * @returns {string} - Formatted string (e.g., "T20", "D16", "25", "D25")
 */
export function formatDart(multiplier, number) {
  if (number === 0) return '0'

  if (number === 25) {
    return multiplier === 2 ? 'D25' : '25'
  }

  const prefix = multiplier === 3 ? 'T' : multiplier === 2 ? 'D' : ''
  return `${prefix}${number}`
}

/**
 * Get suggested checkout routes for a score
 * @param {number} score - Remaining score
 * @returns {string[]} - Array of suggested checkout routes
 */
export function getSuggestedCheckouts(score) {
  const checkouts = {
    170: ['T20 T20 D25'],
    167: ['T20 T19 D25'],
    164: ['T20 T18 D25'],
    161: ['T20 T17 D25'],
    160: ['T20 T20 D20'],
    158: ['T20 T20 D19'],
    157: ['T20 T19 D20'],
    156: ['T20 T20 D18'],
    155: ['T20 T19 D19'],
    154: ['T20 T18 D20'],
    153: ['T20 T19 D18'],
    152: ['T20 T20 D16'],
    151: ['T20 T17 D20'],
    150: ['T20 T18 D18'],
    149: ['T20 T19 D16'],
    148: ['T20 T20 D14'],
    147: ['T20 T17 D18'],
    146: ['T20 T18 D16'],
    145: ['T20 T19 D14'],
    144: ['T20 T20 D12'],
    143: ['T20 T17 D16'],
    142: ['T20 T14 D20'],
    141: ['T20 T19 D12'],
    140: ['T20 T20 D10'],
    139: ['T20 T13 D20'],
    138: ['T20 T18 D12'],
    137: ['T20 T19 D10'],
    136: ['T20 T20 D8'],
    135: ['T20 T17 D12'],
    134: ['T20 T14 D16'],
    133: ['T20 T19 D8'],
    132: ['T20 T16 D12'],
    131: ['T20 T13 D16'],
    130: ['T20 T18 D8'],
    129: ['T19 T16 D12'],
    128: ['T18 T14 D16'],
    127: ['T20 T17 D8'],
    126: ['T19 T19 D6'],
    125: ['T20 T19 D4'],
    124: ['T20 T16 D8'],
    123: ['T19 T16 D9'],
    122: ['T18 T18 D7'],
    121: ['T20 T11 D14'],
    120: ['T20 S20 D20'],
    // Common lower checkouts
    100: ['T20 D20'],
    80: ['T20 D10'],
    60: ['S20 D20'],
    50: ['S10 D20', 'D25'],
    40: ['D20'],
    36: ['D18'],
    32: ['D16'],
    20: ['D10'],
    16: ['D8'],
    12: ['D6'],
    10: ['D5'],
    8: ['D4'],
    6: ['D3'],
    4: ['D2'],
    2: ['D1']
  }

  return checkouts[score] || []
}

/**
 * Validate if a dart combination is valid
 * @param {number} multiplier - 1, 2, or 3
 * @param {number} number - The number hit
 * @returns {boolean} - True if valid
 */
export function isValidDart(multiplier, number) {
  // Check multiplier
  if (![1, 2, 3].includes(multiplier)) return false

  // Check number
  if (number === 25) {
    // Bull can only be single or double
    return multiplier <= 2
  }

  if (number === 0) {
    // Miss is always single
    return multiplier === 1
  }

  // Regular numbers 1-20
  return number >= 1 && number <= 20
}
