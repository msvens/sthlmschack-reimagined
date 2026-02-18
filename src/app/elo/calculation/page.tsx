'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/PageTitle';
import { TextField } from '@/components/TextField';
import { calculateExpectedScore } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/context/LanguageContext';

function ExpectedScoreWidget({ language }: { language: Language }) {
  const [playerRating, setPlayerRating] = useState('1500');
  const [opponentRating, setOpponentRating] = useState('1500');

  const pRating = parseInt(playerRating) || 0;
  const oRating = parseInt(opponentRating) || 0;
  const hasValidInputs = pRating > 0 && oRating > 0;

  const expected = hasValidInputs ? calculateExpectedScore(pRating, oRating) : null;
  const opponentExpected = hasValidInputs ? calculateExpectedScore(oRating, pRating) : null;

  const sv = language === 'sv';

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-200">
        {sv ? 'Testa: Förväntat resultat' : 'Try It: Expected Score'}
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <TextField
          label={sv ? 'Din rating' : 'Your rating'}
          value={playerRating}
          onChange={(e) => setPlayerRating(e.target.value)}
          type="number"
          compact
        />
        <TextField
          label={sv ? 'Motståndarens rating' : 'Opponent rating'}
          value={opponentRating}
          onChange={(e) => setOpponentRating(e.target.value)}
          type="number"
          compact
        />
      </div>
      {hasValidInputs && expected != null && opponentExpected != null && (
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p>
            <span className="font-medium">
              {sv ? 'Ditt förväntade resultat:' : 'Your expected score:'}
            </span>{' '}
            {(expected * 100).toFixed(1)}%
          </p>
          <p>
            <span className="font-medium">
              {sv ? 'Motståndarens förväntade resultat:' : 'Opponent expected score:'}
            </span>{' '}
            {(opponentExpected * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {sv ? 'Ratingskillnad' : 'Rating difference'}: {Math.abs(pRating - oRating)}{' '}
            {sv ? 'poäng' : 'points'}
            {Math.abs(pRating - oRating) > 400 && (sv ? ' (begränsad till 400)' : ' (capped at 400)')}
          </p>
        </div>
      )}
    </div>
  );
}

function CalculationEnglish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Expected Score
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          The foundation of the ELO system is the <em>expected score</em> &mdash; a prediction
          of how likely you are to score points against a given opponent. The formula is:
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-sm text-center text-gray-900 dark:text-gray-200">
          E = 1 / (1 + 10<sup>(R<sub>opponent</sub> - R<sub>player</sub>) / 400</sup>)
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          Where <code className="text-sm">E</code> is the expected score (between 0 and 1),
          and the ratings are FIDE ELO ratings. An expected score of 0.75 means you&apos;re
          expected to score 75% &mdash; roughly winning 3 out of 4 games.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Rating Change
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          After a game, your rating changes based on how your actual result compares to the
          expected score:
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-sm text-center text-gray-900 dark:text-gray-200">
          &Delta;R = K &times; (S - E)
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          Where:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li><strong>&Delta;R</strong> = rating change (positive or negative)</li>
          <li><strong>K</strong> = K-factor (determines sensitivity, see Fine Print)</li>
          <li><strong>S</strong> = actual score (1 for win, 0.5 for draw, 0 for loss)</li>
          <li><strong>E</strong> = expected score (from the formula above)</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          If you beat a stronger opponent, <code className="text-sm">S - E</code> is large and
          positive, so you gain many points. If you lose to a weaker opponent,{' '}
          <code className="text-sm">S - E</code> is large and negative, so you lose many points.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          The 400-Point Cap
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          FIDE applies a cap: if the rating difference between two players exceeds 400,
          it is treated as exactly 400 for calculation purposes. This means the expected
          score is always between about 8% and 92%, preventing extreme rating changes
          when a much stronger player faces a much weaker one.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Performance Rating
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          A performance rating estimates what rating you &ldquo;played at&rdquo; in a tournament.
          It&apos;s calculated as the average opponent rating adjusted by your score percentage.
          Scoring 50% against opponents averaging 2000 gives a performance rating of 2000.
          Scoring above 50% pushes it higher; below 50% pushes it lower.
        </p>
      </section>
    </div>
  );
}

function CalculationSwedish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Förväntat resultat
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          Grunden i ELO-systemet är det <em>förväntade resultatet</em> &mdash; en förutsägelse
          av hur sannolikt det är att du tar poäng mot en given motståndare. Formeln är:
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-sm text-center text-gray-900 dark:text-gray-200">
          E = 1 / (1 + 10<sup>(R<sub>motståndare</sub> - R<sub>spelare</sub>) / 400</sup>)
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          Där <code className="text-sm">E</code> är det förväntade resultatet (mellan 0 och 1),
          och ratingarna är FIDE ELO-ratingar. Ett förväntat resultat på 0,75 innebär att du
          förväntas ta 75% &mdash; ungefär att vinna 3 av 4 partier.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Ratingförändring
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          Efter ett parti ändras din rating baserat på hur ditt faktiska resultat jämförs med
          det förväntade:
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-sm text-center text-gray-900 dark:text-gray-200">
          &Delta;R = K &times; (S - E)
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          Där:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li><strong>&Delta;R</strong> = ratingförändring (positiv eller negativ)</li>
          <li><strong>K</strong> = K-faktor (bestämmer känsligheten, se Detaljerna)</li>
          <li><strong>S</strong> = faktiskt resultat (1 för vinst, 0,5 för remi, 0 för förlust)</li>
          <li><strong>E</strong> = förväntat resultat (från formeln ovan)</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          Om du slår en starkare motståndare är <code className="text-sm">S - E</code> stort och
          positivt, så du vinner många poäng. Om du förlorar mot en svagare motståndare är{' '}
          <code className="text-sm">S - E</code> stort och negativt, så du tappar många poäng.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          400-poängstaket
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          FIDE tillämpar ett tak: om ratingskillnaden mellan två spelare överstiger 400
          behandlas den som exakt 400 vid beräkning. Det innebär att det förväntade
          resultatet alltid ligger mellan cirka 8% och 92%, vilket förhindrar extrema
          ratingförändringar när en mycket starkare spelare möter en mycket svagare.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Prestationsrating
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          En prestationsrating uppskattar vilken rating du &ldquo;spelade på&rdquo; i en turnering.
          Den beräknas som motståndarnas genomsnittliga rating justerad efter din poängprocent.
          Att ta 50% mot motståndare med en snittrating på 2000 ger en prestationsrating på 2000.
          Tar du över 50% blir den högre; under 50% blir den lägre.
        </p>
      </section>
    </div>
  );
}

export default function EloCalculationPage() {
  const { language } = useLanguage();

  return (
    <>
      <PageTitle
        title={language === 'en' ? 'The Formula' : 'Formeln'}
        subtitle={language === 'en' ? 'How ELO ratings are calculated' : 'Hur ELO-rating beräknas'}
      />
      {language === 'en' ? <CalculationEnglish /> : <CalculationSwedish />}
      <div className="mt-8">
        <ExpectedScoreWidget language={language} />
      </div>
    </>
  );
}
