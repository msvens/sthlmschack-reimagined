'use client';

import { PageTitle } from '@/components/PageTitle';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

function FormatsEnglish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Why Different Formats?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Not all chess tournaments work the same way. The format determines how players are
          paired, how many rounds are played, and how the final ranking is decided. The choice
          of format depends on the number of participants, available time, and the purpose of
          the event. A small club championship can afford to let everyone play everyone, while
          a large open tournament with hundreds of players needs a more efficient system.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Individual Formats
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Swiss System (Monrad)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The most common format for open tournaments. Players are paired each round based on
              their current score &mdash; winners play winners, losers play losers. Everyone plays
              all rounds (typically 5&ndash;9), but you don&apos;t meet every opponent. This makes
              it efficient for large fields: a 7-round Swiss can handle over 100 players while still
              producing a clear winner. &ldquo;Monrad&rdquo; is the Scandinavian name for the same system.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Round Robin (Berger)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Each player meets every other player exactly once, requiring n&minus;1 rounds for
              n players. Considered the fairest format since there are no pairing luck factors,
              but only practical for small groups of 6&ndash;12 players. Commonly used in club
              championships, elite invitationals, and league divisions.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Double Round Robin
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Same as Round Robin, but each pair plays twice &mdash; once with white and once
              with black. This eliminates the color advantage and gives a more reliable result.
              Used in top-level events like the Candidates Tournament and World Championship
              matches. Requires 2&times;(n&minus;1) rounds, so usually limited to 6&ndash;8 players.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Knockout
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Lose and you&apos;re out. Often played as two-game mini-matches with tiebreak
              games (rapid, then blitz) if the match is drawn. Dramatic and decisive, but
              half the field is eliminated after one round. Used in World Cup and knockout
              stages of major events.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Team Formats
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          In team tournaments, two teams face each other with one game per board (typically
          4&ndash;8 boards). The team result is determined by total board points (e.g. 4.5&ndash;3.5)
          or match points (win/draw/loss). Used in league play (Elitserien, division leagues)
          and team championships. The overall tournament structure can itself be Swiss or
          Round Robin.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Tiebreak Systems
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          When players finish with the same score, tiebreak systems determine the final ranking.
          Several methods are commonly used, often in combination:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-900 dark:text-gray-200">System</th>
                <th className="text-left py-2 font-semibold text-gray-900 dark:text-gray-200">How it works</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-medium">Buchholz</td>
                <td className="py-2">Sum of all opponents&apos; scores. Rewards playing against strong opposition.</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-medium">Sonneborn&ndash;Berger</td>
                <td className="py-2">Sum of defeated opponents&apos; scores + half of drawn opponents&apos; scores. Rewards beating strong players.</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-medium">Direct encounter</td>
                <td className="py-2">The result between the tied players. Simple and intuitive when only two players are tied.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Number of wins</td>
                <td className="py-2">Player with more wins ranks higher. Discourages overly cautious play.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          The tiebreak columns shown in tournament results on this site (often labeled &ldquo;QP&rdquo;
          or &ldquo;PP&rdquo;) correspond to whichever system the tournament organizer has chosen.
        </p>
      </section>
    </div>
  );
}

function FormatsSwedish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Varför olika format?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Inte alla schackturneringar fungerar likadant. Formatet bestämmer hur spelare lottas,
          hur många ronder som spelas och hur slutställningen avgörs. Valet av format beror på
          antalet deltagare, tillgänglig tid och syftet med tävlingen. En liten klubbmästerskapsturnering
          har råd att låta alla möta alla, medan en stor öppen turnering med hundratals spelare
          behöver ett mer effektivt system.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Individuella format
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Schweizer (Monrad)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Det vanligaste formatet för öppna turneringar. Spelare lottas varje rond baserat på
              aktuell poängställning &mdash; vinnare möter vinnare, förlorare möter förlorare. Alla
              spelar samtliga ronder (vanligtvis 5&ndash;9), men man möter inte alla motståndare.
              Detta gör systemet effektivt för stora startfält: en 7-rondsswiss kan hantera över
              100 spelare och ändå ge en tydlig vinnare. &ldquo;Monrad&rdquo; är det skandinaviska
              namnet för samma system.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Rundrobbin (Berger)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Varje spelare möter alla andra spelare exakt en gång, vilket kräver n&minus;1
              ronder för n spelare. Anses vara det rättvisaste formatet eftersom det inte finns
              någon lottningsfaktor, men är bara praktiskt för små grupper om 6&ndash;12 spelare.
              Vanligt i klubbmästerskap, elitinbjudningar och seriedivisioner.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Dubbel rundrobbin
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Samma som rundrobbin, men varje par spelar två gånger &mdash; en gång med vit och
              en gång med svart. Detta eliminerar fördelarna med färgen och ger ett mer tillförlitligt
              resultat. Används i toppevenemang som Kandidatturneringen och VM-matcher.
              Kräver 2&times;(n&minus;1) ronder, så det begränsas vanligen till 6&ndash;8 spelare.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-1">
              Utslagsspel
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Förlorar du åker du ut. Spelas ofta som tvåpartiminimatcher med särskiljande
              partier (snabb, sedan blixt) vid oavgjort. Dramatiskt och avgörande, men hälften
              av fältet slås ut efter en rond. Används i Världscupen och utslagsstadier i
              stora evenemang.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Lagformat
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          I lagturneringar möts två lag med ett parti per bord (vanligtvis 4&ndash;8 bord).
          Lagresultatet avgörs av totala brädpoäng (t.ex. 4,5&ndash;3,5) eller matchpoäng
          (vinst/remi/förlust). Används i seriekamp (Elitserien, divisionsserier) och
          lagmästerskap. Själva turneringsstrukturen kan i sin tur vara schweizer eller rundrobbin.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Särskiljningssystem
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          När spelare slutar på samma poäng avgör särskiljningssystem den slutgiltiga placeringen.
          Flera metoder används ofta i kombination:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-900 dark:text-gray-200">System</th>
                <th className="text-left py-2 font-semibold text-gray-900 dark:text-gray-200">Så fungerar det</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-medium">Buchholz</td>
                <td className="py-2">Summan av alla motståndares poäng. Belönar att ha mött starkt motstånd.</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-medium">Sonneborn&ndash;Berger</td>
                <td className="py-2">Summan av besegrade motståndares poäng + hälften av remimotståndares poäng. Belönar att slå starka spelare.</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-medium">Inbördes möte</td>
                <td className="py-2">Resultatet mellan de jämnställda spelarna. Enkelt och intuitivt när bara två spelare delar poäng.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Antal vinster</td>
                <td className="py-2">Spelaren med flest vinster placeras högre. Motverkar alltför försiktigt spel.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Särskiljningskolumnerna i turneringsresultat på den här sidan (ofta märkta &ldquo;SP&rdquo;
          eller &ldquo;BP&rdquo;) motsvarar det system som turneringsarrangören har valt.
        </p>
      </section>
    </div>
  );
}

export default function GuideFormatsPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <>
      <PageTitle
        title={t.pages.guide.formats.title}
        subtitle={t.pages.guide.formats.subtitle}
      />
      {language === 'en' ? <FormatsEnglish /> : <FormatsSwedish />}
    </>
  );
}