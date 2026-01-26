/**
 * Unit tests for rating utility functions
 * Tests time control parsing, rating selection by algorithm, and formatting
 */

import {
  parseTimeControl,
  formatRatingWithType,
  getKFactorForRating,
  getPlayerRatingByAlgorithm
} from '../../utils/ratingUtils';
import { RatingAlgorithm } from '../../types/ratingAlgorithm';
import type { MemberFIDERatingDTO } from '../../types';

describe('ratingUtils', () => {
  describe('parseTimeControl', () => {
    it('should return standard for null/undefined', () => {
      expect(parseTimeControl(null)).toBe('standard');
      expect(parseTimeControl(undefined)).toBe('standard');
    });

    it('should return standard for unparseable strings', () => {
      expect(parseTimeControl('unknown format')).toBe('standard');
      expect(parseTimeControl('')).toBe('standard');
    });

    it('should identify blitz (< 10 min)', () => {
      expect(parseTimeControl('3 min')).toBe('blitz');
      expect(parseTimeControl('5 min + 2 sek/drag')).toBe('blitz');
      expect(parseTimeControl('3 min + 2 sek/drag')).toBe('blitz');
    });

    it('should identify rapid (10-60 min)', () => {
      expect(parseTimeControl('10 min')).toBe('rapid');
      expect(parseTimeControl('10 min + 5 sek/drag')).toBe('rapid');
      expect(parseTimeControl('15 min')).toBe('rapid');
      expect(parseTimeControl('25 min')).toBe('rapid');
      expect(parseTimeControl('60 min')).toBe('rapid');
    });

    it('should identify standard (> 60 min)', () => {
      expect(parseTimeControl('90 min')).toBe('standard');
      expect(parseTimeControl('90+15 min')).toBe('standard');
      expect(parseTimeControl('90+30 min +30 sek/drag')).toBe('standard');
    });

    it('should handle compound time controls', () => {
      // 90+15 = 105 min > 60 = standard
      expect(parseTimeControl('90+15 min')).toBe('standard');
      // 30+30 = 60 min = rapid
      expect(parseTimeControl('30+30 min')).toBe('rapid');
    });
  });

  describe('formatRatingWithType', () => {
    it('should return dash for null rating', () => {
      expect(formatRatingWithType(null, 'standard')).toBe('-');
      expect(formatRatingWithType(null, 'rapid')).toBe('-');
      expect(formatRatingWithType(null, null)).toBe('-');
    });

    it('should format standard rating without suffix', () => {
      expect(formatRatingWithType(1500, 'standard', 'sv')).toBe('1500');
      expect(formatRatingWithType(1500, 'standard', 'en')).toBe('1500');
    });

    it('should format rapid rating with language-specific suffix', () => {
      expect(formatRatingWithType(1500, 'rapid', 'sv')).toBe('1500 S'); // Snabb
      expect(formatRatingWithType(1500, 'rapid', 'en')).toBe('1500 R'); // Rapid
    });

    it('should format blitz rating with B suffix', () => {
      expect(formatRatingWithType(1500, 'blitz', 'sv')).toBe('1500 B');
      expect(formatRatingWithType(1500, 'blitz', 'en')).toBe('1500 B');
    });

    it('should format LASK rating with L suffix', () => {
      expect(formatRatingWithType(1500, 'lask', 'sv')).toBe('1500 L');
      expect(formatRatingWithType(1500, 'lask', 'en')).toBe('1500 L');
    });

    it('should default to Swedish locale', () => {
      expect(formatRatingWithType(1500, 'rapid')).toBe('1500 S');
    });

    it('should handle null rating type', () => {
      expect(formatRatingWithType(1500, null)).toBe('1500');
    });
  });

  describe('getKFactorForRating', () => {
    it('should use K from playerElo if available', () => {
      expect(getKFactorForRating('standard', 1500, { k: 40 } as MemberFIDERatingDTO)).toBe(40);
      expect(getKFactorForRating('rapid', 2500, { k: 10 } as MemberFIDERatingDTO)).toBe(10);
    });

    it('should return 20 for null rating or rating type', () => {
      expect(getKFactorForRating(null, null)).toBe(20);
      expect(getKFactorForRating('standard', null)).toBe(20);
      expect(getKFactorForRating(null, 1500)).toBe(20);
    });

    it('should return 40 for rapid and blitz', () => {
      expect(getKFactorForRating('rapid', 1500)).toBe(40);
      expect(getKFactorForRating('blitz', 1500)).toBe(40);
      expect(getKFactorForRating('rapid', 2500)).toBe(40);
      expect(getKFactorForRating('blitz', 2500)).toBe(40);
    });

    it('should return 20 for standard under 2400', () => {
      expect(getKFactorForRating('standard', 1500)).toBe(20);
      expect(getKFactorForRating('standard', 2399)).toBe(20);
    });

    it('should return 10 for standard 2400 and above', () => {
      expect(getKFactorForRating('standard', 2400)).toBe(10);
      expect(getKFactorForRating('standard', 2700)).toBe(10);
    });

    it('should treat LASK like standard for K-factor', () => {
      expect(getKFactorForRating('lask', 1500)).toBe(20);
      expect(getKFactorForRating('lask', 2400)).toBe(10);
    });
  });

  describe('getPlayerRatingByAlgorithm', () => {
    const mockElo = {
      rating: 1500,
      rapidRating: 1600,
      blitzRating: 1400
    };

    it('should return null for null elo', () => {
      const result = getPlayerRatingByAlgorithm(null, RatingAlgorithm.STANDARD_ELO);
      expect(result.rating).toBeNull();
      expect(result.ratingType).toBeNull();
    });

    it('should return standard for null algorithm', () => {
      const result = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, null);
      expect(result.rating).toBe(1500);
      expect(result.ratingType).toBe('standard');
      expect(result.isFallback).toBe(false);
    });

    it('should return standard ELO for STANDARD_ELO algorithm', () => {
      const result = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, RatingAlgorithm.STANDARD_ELO);
      expect(result.rating).toBe(1500);
      expect(result.ratingType).toBe('standard');
      expect(result.isFallback).toBe(false);
    });

    it('should return rapid ELO for RAPID_ELO algorithm', () => {
      const result = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, RatingAlgorithm.RAPID_ELO);
      expect(result.rating).toBe(1600);
      expect(result.ratingType).toBe('rapid');
      expect(result.isFallback).toBe(false);
    });

    it('should return blitz ELO for BLITZ_ELO algorithm', () => {
      const result = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, RatingAlgorithm.BLITZ_ELO);
      expect(result.rating).toBe(1400);
      expect(result.ratingType).toBe('blitz');
      expect(result.isFallback).toBe(false);
    });

    it('should return null for NO_RATING algorithm', () => {
      const result = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, RatingAlgorithm.NO_RATING);
      expect(result.rating).toBeNull();
      expect(result.ratingType).toBeNull();
    });

    describe('priority algorithms', () => {
      it('should use priority order for STANDARD_RAPID_BLITZ_ELO', () => {
        // Has all ratings - should use standard
        const result1 = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO);
        expect(result1.rating).toBe(1500);
        expect(result1.ratingType).toBe('standard');
        expect(result1.isFallback).toBe(false);

        // Missing standard - should use rapid as fallback
        const eloNoStandard = { rapidRating: 1600, blitzRating: 1400 };
        const result2 = getPlayerRatingByAlgorithm(eloNoStandard as MemberFIDERatingDTO, RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO);
        expect(result2.rating).toBe(1600);
        expect(result2.ratingType).toBe('rapid');
        expect(result2.isFallback).toBe(true);

        // Missing standard and rapid - should use blitz as fallback
        const eloOnlyBlitz = { blitzRating: 1400 };
        const result3 = getPlayerRatingByAlgorithm(eloOnlyBlitz as MemberFIDERatingDTO, RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO);
        expect(result3.rating).toBe(1400);
        expect(result3.ratingType).toBe('blitz');
        expect(result3.isFallback).toBe(true);
      });

      it('should use priority order for RAPID_STANDARD_BLITZ_ELO', () => {
        // Has all ratings - should use rapid
        const result1 = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, RatingAlgorithm.RAPID_STANDARD_BLITZ_ELO);
        expect(result1.rating).toBe(1600);
        expect(result1.ratingType).toBe('rapid');
        expect(result1.isFallback).toBe(false);

        // Missing rapid - should use standard as fallback
        const eloNoRapid = { rating: 1500, blitzRating: 1400 };
        const result2 = getPlayerRatingByAlgorithm(eloNoRapid as MemberFIDERatingDTO, RatingAlgorithm.RAPID_STANDARD_BLITZ_ELO);
        expect(result2.rating).toBe(1500);
        expect(result2.ratingType).toBe('standard');
        expect(result2.isFallback).toBe(true);
      });

      it('should use priority order for BLITZ_STANDARD_RAPID_ELO', () => {
        // Has all ratings - should use blitz
        const result1 = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, RatingAlgorithm.BLITZ_STANDARD_RAPID_ELO);
        expect(result1.rating).toBe(1400);
        expect(result1.ratingType).toBe('blitz');
        expect(result1.isFallback).toBe(false);

        // Missing blitz - should use standard as fallback
        const eloNoBlitz = { rating: 1500, rapidRating: 1600 };
        const result2 = getPlayerRatingByAlgorithm(eloNoBlitz as MemberFIDERatingDTO, RatingAlgorithm.BLITZ_STANDARD_RAPID_ELO);
        expect(result2.rating).toBe(1500);
        expect(result2.ratingType).toBe('standard');
        expect(result2.isFallback).toBe(true);
      });
    });

    it('should handle unknown algorithm by falling back to standard', () => {
      const result = getPlayerRatingByAlgorithm(mockElo as MemberFIDERatingDTO, 999);
      expect(result.rating).toBe(1500);
      expect(result.ratingType).toBe('standard');
    });
  });
});
