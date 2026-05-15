import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import type { AssessmentResult } from '../services/api';

/**
 * Normalizes assessment scores onto a consistent 0-100 "Health %" scale.
 * Higher percentage = better mental health / lower severity.
 */
export function getNormalizedHealthScore(assessment: AssessmentResult): number {
    if (!assessment) return 0;
    
    const { type, score } = assessment;
    if (type === 'daily') {
        // Daily: higher is better, max 35
        return (Math.min(35, Math.max(0, score)) / 35) * 100;
    } else if (type === 'phq9') {
        // PHQ-9: higher is worse, max 27
        return ((27 - Math.min(27, Math.max(0, score))) / 27) * 100;
    } else if (type === 'gad7') {
        // GAD-7: higher is worse, max 21
        return ((21 - Math.min(21, Math.max(0, score))) / 21) * 100;
    } else if (type === 'pss10') {
        // PSS-10: higher is worse, max 40
        return ((40 - Math.min(40, Math.max(0, score))) / 40) * 100;
    } else if (type === 'burnout') {
        // Burnout: higher is worse, max 100 (assuming 10 questions max 10)
        return ((100 - Math.min(100, Math.max(0, score))) / 100) * 100; 
    }
    // Fallback: assume raw score if out of bounds cap at 100
    return Math.min(100, Math.max(0, score));
}
