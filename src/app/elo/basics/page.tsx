'use client';

import { PageTitle } from '@/components/PageTitle';
import { useLanguage } from '@/context/LanguageContext';

function BasicsEnglish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Why Ratings Exist
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Chess ratings provide an objective measure of playing strength, making it possible
          to pair opponents of similar skill, seed tournaments, and track improvement over time.
          The system was developed by Hungarian-American physicist Arpad Elo in the 1960s and
          adopted by FIDE (the World Chess Federation) in 1970. Today, virtually every national
          federation uses FIDE Elo ratings as their official rating system.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          The Three FIDE Categories
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          FIDE maintains three separate rating lists, each for a different time control.
          A player can have different ratings in each category.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Standard</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">&gt; 60 min per player</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The classical time control. Most prestigious and historically the only rated format.
              Typical controls are 90 min + 30 sec/move.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Rapid</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">10&ndash;60 min per player</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              A faster format that became FIDE-rated in 2012. Common controls include
              15 min + 10 sec/move or 25 min + 5 sec/move.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Blixt</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">3&ndash;10 min per player</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The fastest rated format. Popular online and in over-the-board events.
              Typical controls are 3 min + 2 sec/move or 5 min + 0.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Rating Scale
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Elo ratings are numbers typically ranging from about 1000 to 2900. Here is a rough
          guide to what the numbers mean:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-900 dark:text-gray-200">Rating</th>
                <th className="text-left py-2 font-semibold text-gray-900 dark:text-gray-200">Level</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">2500+</td>
                <td className="py-2">Grandmaster level</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">2200&ndash;2499</td>
                <td className="py-2">Master / International Master level</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">2000&ndash;2199</td>
                <td className="py-2">Expert / Candidate Master</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">1800&ndash;1999</td>
                <td className="py-2">Strong club player</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">1600&ndash;1799</td>
                <td className="py-2">Club player</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">1400&ndash;1599</td>
                <td className="py-2">Beginner / casual player</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          LASK &mdash; Sweden&apos;s Old Rating System
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Before September 2016, the Swedish Chess Federation (SSF) maintained its own national
          rating system called <strong>LASK</strong>. It was broadly similar to Elo but had its
          own formula and scale. In September 2016, SSF switched entirely to FIDE Elo ratings
          for all official purposes. LASK ratings are still visible in historical data but are
          no longer updated.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          When Are Ratings Updated?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          FIDE publishes updated rating lists on the 1st of every month. Tournament organizers
          submit results to their national federation, which forwards them to FIDE. There can
          be a delay of a few weeks between a tournament ending and the results appearing in
          the monthly list.
        </p>
      </section>
    </div>
  );
}

function BasicsSwedish() {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Varför rating finns
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Schackratingar ger ett objektivt mått på spelstyrka, vilket gör det möjligt att
          lotta motståndare med liknande skicklighet, seeda turneringar och följa utveckling
          över tid. Systemet utvecklades av den ungersk-amerikanske fysikern Arpad Elo på
          1960-talet och antogs av FIDE (Internationella schackförbundet) 1970. Idag använder
          i princip alla nationella förbund FIDE:s Elo-ratingar som sitt officiella ratingsystem.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          FIDE:s tre kategorier
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          FIDE har tre separata ratinglistor, en för varje tidskontroll.
          En spelare kan ha olika ratingar i varje kategori.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Standard</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">&gt; 60 min per spelare</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Den klassiska tidskontrollen. Mest prestigefylld och historiskt den enda ratade
              formaten. Typisk betänketid är 90 min + 30 sek/drag.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Rapid</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">10&ndash;60 min per spelare</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Ett snabbare format som blev FIDE-ratat 2012. Vanliga betänketider är
              15 min + 10 sek/drag eller 25 min + 5 sek/drag.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Blixt</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">3&ndash;10 min per spelare</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Det snabbaste ratade formatet. Populärt online och i brädturneringar.
              Typisk betänketid är 3 min + 2 sek/drag eller 5 min + 0.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          Ratingskalan
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Elo-ratingar är tal som normalt sträcker sig från cirka 1000 till 2900. Här är en
          ungefärlig guide till vad siffrorna betyder:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-900 dark:text-gray-200">Rating</th>
                <th className="text-left py-2 font-semibold text-gray-900 dark:text-gray-200">Nivå</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">2500+</td>
                <td className="py-2">Stormästarnivå</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">2200&ndash;2499</td>
                <td className="py-2">Mästare / Internationell mästare</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">2000&ndash;2199</td>
                <td className="py-2">Expert / Kandidatmästare</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">1800&ndash;1999</td>
                <td className="py-2">Stark klubbspelare</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">1600&ndash;1799</td>
                <td className="py-2">Klubbspelare</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">1400&ndash;1599</td>
                <td className="py-2">Nybörjare / hobbyspelar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          LASK &mdash; Sveriges gamla ratingsystem
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Före september 2016 hade Svenska Schackförbundet (SSF) sitt eget nationella
          ratingsystem kallat <strong>LASK</strong>. Det var i stort sett likt Elo men hade
          sin egen formel och skala. I september 2016 gick SSF helt över till FIDE:s
          Elo-ratingar för alla officiella ändamål. LASK-ratingar syns fortfarande i
          historiska data men uppdateras inte längre.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
          När uppdateras ratingen?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          FIDE publicerar uppdaterade ratinglistor den 1:a varje månad. Turneringsarrangörer
          skickar in resultat till sitt nationella förbund, som vidarebefordrar dem till FIDE.
          Det kan ta några veckor mellan att en turnering avslutas och att resultaten syns
          i månadslistan.
        </p>
      </section>
    </div>
  );
}

export default function EloBasicsPage() {
  const { language } = useLanguage();

  return (
    <>
      <PageTitle
        title={language === 'en' ? 'Elo Basics' : 'Elo-grunder'}
        subtitle={language === 'en' ? 'Understanding chess ratings' : 'Förstå schackratingar'}
      />
      {language === 'en' ? <BasicsEnglish /> : <BasicsSwedish />}
    </>
  );
}
