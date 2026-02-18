'use client';

import { PageTitle } from '@/components/PageTitle';
import { useLanguage } from '@/context/LanguageContext';

function FinePrintEnglish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Getting Your First Rating
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          To receive an initial FIDE rating, a player must meet all of the following conditions:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>Play at least <strong>5 games</strong> against rated opponents (results can be
            pooled across multiple tournaments)</li>
          <li>If you score zero in your <strong>first event</strong>, that entire tournament
            is disregarded &mdash; you&apos;ll need to play another event</li>
          <li>The resulting rating must be at least <strong>1400</strong></li>
          <li>Complete the required games within a <strong>26-month period</strong></li>
          <li>The initial rating is capped at a maximum of <strong>2200</strong></li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          The initial rating is calculated using your opponents&apos; average rating plus two
          hypothetical 1800-rated opponents (counted as draws), adjusted by your score percentage.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          K-Factors
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          The K-factor determines how much your rating changes after each game. A higher K-factor
          means bigger swings. FIDE uses three tiers:
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-1">K = 40</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              For <strong>juniors</strong> (under 18 by end of calendar year) and{' '}
              <strong>new players</strong> with fewer than 30 rated games.
              Allows rapid rating adjustment.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-1">K = 20</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              For players whose rating has <strong>never reached 2400</strong>.
              The standard K-factor for most adult players.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-1">K = 10</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              For players whose rating has <strong>ever reached 2400</strong>,
              even if it later dropped below. Provides stability at the top.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          The Junior Rule
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The K=40 junior bonus applies through the <strong>end of the calendar year</strong> in
          which the player turns 18. For example, a player born on January 15, 2008 would have
          K=40 through all of 2026 (the year they turn 18). Starting January 1, 2027, they would
          drop to K=20 (assuming their rating is below 2400).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Rating Floor
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          FIDE has a <strong>rating floor of 1400</strong>. If a player&apos;s calculated rating
          drops below 1400, they are shown as unrated on the FIDE rating list. Their rating is
          not published, though it is still tracked internally. Once they perform well enough to
          rise above 1400 again, their rating reappears on the list.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Can You Lose Your Rating?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          Yes, there are two ways to effectively lose your FIDE rating:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong>Drop below 1400:</strong> Your rating is no longer published
            (see Rating Floor above).
          </li>
          <li>
            <strong>Inactivity:</strong> If you don&apos;t play any rated games within approximately
            1 year, your rating may become &ldquo;inactive&rdquo; on the FIDE list. It can be
            reactivated by playing rated games again.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Same Rules for All Time Controls
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The K-factor rules apply identically to Standard, Rapid, and Blitz ratings. However,
          each time control has its own independent rating and K-factor history. A player could
          have K=10 for Standard (having reached 2400) but K=20 for Rapid (if their rapid rating
          never reached 2400).
        </p>
      </section>
    </div>
  );
}

function FinePrintSwedish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Att få sin första rating
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          För att få en initial FIDE-rating måste en spelare uppfylla alla följande villkor:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>Spela minst <strong>5 partier</strong> mot ratade motståndare (resultat kan
            samlas från flera turneringar)</li>
          <li>Om du får noll poäng i din <strong>första turnering</strong> stryks hela den
            turneringen &mdash; du behöver spela ytterligare en</li>
          <li>Den resulterande ratingen måste vara minst <strong>1400</strong></li>
          <li>Slutföra de nödvändiga partierna inom en <strong>26-månadersperiod</strong></li>
          <li>Den initiala ratingen har ett tak på maximalt <strong>2200</strong></li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          Den initiala ratingen beräknas med motståndarnas genomsnittliga rating plus två
          hypotetiska motståndare med 1800 i rating (räknade som remier), justerat efter
          din poängprocent.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          K-faktorer
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          K-faktorn bestämmer hur mycket din rating ändras efter varje parti. En högre K-faktor
          innebär större svängningar. FIDE använder tre nivåer:
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-1">K = 40</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              För <strong>juniorer</strong> (under 18 vid kalenderårets slut) och{' '}
              <strong>nya spelare</strong> med färre än 30 ratade partier.
              Möjliggör snabb ratingjustering.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-1">K = 20</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              För spelare vars rating <strong>aldrig nått 2400</strong>.
              Standard-K-faktorn för de flesta vuxna spelare.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-1">K = 10</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              För spelare vars rating <strong>någonsin nått 2400</strong>,
              även om den senare sjunkit under. Ger stabilitet i toppen.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Juniorregeln
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Juniorbonus med K=40 gäller till och med <strong>slutet av det kalenderår</strong> då
          spelaren fyller 18. Till exempel skulle en spelare född den 15 januari 2008 ha K=40
          under hela 2026 (året de fyller 18). Från och med 1 januari 2027 sjunker de till
          K=20 (förutsatt att deras rating är under 2400).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Ratinggolv
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          FIDE har ett <strong>ratinggolv på 1400</strong>. Om en spelares beräknade rating
          sjunker under 1400 visas de som orankade på FIDE:s ratinglista. Ratingen publiceras
          inte, men spåras fortfarande internt. När de presterar tillräckligt bra för att
          stiga över 1400 igen dyker ratingen upp på listan igen.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Kan man förlora sin rating?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          Ja, det finns två sätt att i praktiken förlora sin FIDE-rating:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong>Sjunka under 1400:</strong> Din rating publiceras inte längre
            (se Ratinggolv ovan).
          </li>
          <li>
            <strong>Inaktivitet:</strong> Om du inte spelar några ratade partier på ungefär
            1 år kan din rating bli &ldquo;inaktiv&rdquo; på FIDE:s lista. Den kan
            återaktiveras genom att spela ratade partier igen.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Samma regler för alla tidskontroller
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          K-faktorreglerna gäller identiskt för Standard-, Rapid- och Blixtratingar. Däremot
          har varje tidskontroll sin egen oberoende rating och K-faktorhistorik. En spelare kan
          ha K=10 för Standard (efter att ha nått 2400) men K=20 för Rapid (om deras
          rapidrating aldrig nått 2400).
        </p>
      </section>
    </div>
  );
}

export default function EloFinePrintPage() {
  const { language } = useLanguage();

  return (
    <>
      <PageTitle
        title={language === 'en' ? 'Fine Print' : 'Detaljerna'}
        subtitle={language === 'en' ? 'Qualification rules, K-factors, and edge cases' : 'Kvalificeringsregler, K-faktorer och specialfall'}
      />
      {language === 'en' ? <FinePrintEnglish /> : <FinePrintSwedish />}
    </>
  );
}
