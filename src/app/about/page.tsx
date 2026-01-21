'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/Card';
import { Link } from '@/components/Link';
import { useLanguage } from '@/context/LanguageContext';

function AboutEnglish() {
  return (
    <>
      <h1 className="text-3xl font-light mb-6 text-gray-900 dark:text-gray-200">
        About msvens chess
      </h1>

      <div className="space-y-4 text-gray-600 dark:text-gray-400">
        <p>
          msvens chess started as a side project by an avid chess parent who frequently
          visits result.schack.se to follow tournaments, track chess statistics, and explore
          all the great data that schack.se provides.
        </p>

        <p>
          The goal from the start was to offer the same functionality as result.schack.se
          while focusing on a few key improvements:
        </p>

        <ul className="list-disc list-outside space-y-3 ml-6">
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Mobile experience.</span>{' '}
            result.schack.se wasn&apos;t built for the mobile era, yet during tournaments a phone is
            often all you have. msvens chess takes a mobile-first approach.
          </li>
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Multi-lingual support.</span>{' '}
            Many chess players and parents in Sweden aren&apos;t native Swedish speakers. Making
            the site bilingual was a clear priority.
          </li>
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Better filtering and search.</span>{' '}
            With hundreds of tournaments running simultaneously across Sweden, finding the right
            one can be challenging. The same applies within tournaments — some have multiple classes
            and many groups, making navigation difficult.
          </li>
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Data compatibility.</span>{' '}
            ELO performances, scores, and other statistics should match what result.schack.se shows.
          </li>
        </ul>

        <p>
          The long-term hope is that this project might evolve into a more official results
          portal for schack.se. It would also be exciting to integrate functionality from
          the various chess districts and federations.
        </p>

        <p>
          This project wouldn&apos;t have been possible without the great people at schack.se.
          They&apos;ve provided excellent APIs, are incredibly helpful with questions, and are
          always willing to accommodate requests.
        </p>

        <div className="pt-6">
          <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-gray-200">
            Links & Acknowledgments
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <Link href="https://schack.se/" external>schack.se</Link>
              {' — '}the official Swedish Chess Federation website
            </li>
            <li>
              <Link href="https://resultat.schack.se/" external>resultat.schack.se</Link>
              {' — '}the official results portal
            </li>
            <li>
              <Link href="https://www.stockholmsschack.se/" external>stockholmsschack.se</Link>
              {' — '}the Stockholm Chess Federation
            </li>
            <li>
              <Link href="https://claude.ai/code" external>Claude Code</Link>
              {' — '}made building this a bit easier :)
            </li>
          </ul>
        </div>

        <p className="pt-4">
          And finally, thanks to everyone who has tested the site and provided feedback!
        </p>
      </div>
    </>
  );
}

function AboutSwedish() {
  return (
    <>
      <h1 className="text-3xl font-light mb-6 text-gray-900 dark:text-gray-200">
        Om msvens schack
      </h1>

      <div className="space-y-4 text-gray-600 dark:text-gray-400">
        <p>
          msvens schack började som ett sidoprojekt av en engagerad schackförälder som ofta
          besöker result.schack.se för att följa turneringar, hålla koll på schackstatistik
          och utforska all data som schack.se erbjuder.
        </p>

        <p>
          Målet från början var att erbjuda samma funktionalitet som result.schack.se
          men fokusera på några viktiga förbättringar:
        </p>

        <ul className="list-disc list-outside space-y-3 ml-6">
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Mobilupplevelse.</span>{' '}
            result.schack.se byggdes inte för mobilens tidsålder, men under turneringar är
            telefonen ofta det enda man har. msvens schack tar ett mobil-först-perspektiv.
          </li>
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Flerspråkigt stöd.</span>{' '}
            Många schackspelare och föräldrar i Sverige har inte svenska som modersmål. Att
            göra sidan tvåspråkig var en tydlig prioritet.
          </li>
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Bättre filtrering och sökning.</span>{' '}
            Med hundratals turneringar som pågår samtidigt runt om i Sverige kan det vara svårt
            att hitta rätt. Samma sak gäller inom turneringar — vissa har flera klasser och
            många grupper, vilket gör navigering besvärlig.
          </li>
          <li>
            <span className="font-medium text-gray-700 dark:text-gray-300">Datakompatibilitet.</span>{' '}
            ELO-prestationer, poäng och annan statistik ska matcha det som result.schack.se visar.
          </li>
        </ul>

        <p>
          Den långsiktiga förhoppningen är att detta projekt kan utvecklas till en mer
          officiell resultatportal för schack.se. Det skulle också vara spännande att
          integrera funktionalitet från de olika schackdistrikten och förbunden.
        </p>

        <p>
          Detta projekt hade inte varit möjligt utan de fantastiska människorna på schack.se.
          De har tillhandahållit utmärkta API:er, är otroligt hjälpsamma med frågor och är
          alltid villiga att tillmötesgå önskemål.
        </p>

        <div className="pt-6">
          <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-gray-200">
            Länkar & Tack
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <Link href="https://schack.se/" external>schack.se</Link>
              {' — '}Svenska Schackförbundets officiella webbplats
            </li>
            <li>
              <Link href="https://resultat.schack.se/" external>resultat.schack.se</Link>
              {' — '}den officiella resultatportalen
            </li>
            <li>
              <Link href="https://www.stockholmsschack.se/" external>stockholmsschack.se</Link>
              {' — '}Stockholms Schackförbund
            </li>
            <li>
              <Link href="https://claude.ai/code" external>Claude Code</Link>
              {' — '}gjorde byggandet av detta lite enklare :)
            </li>
          </ul>
        </div>

        <p className="pt-4">
          Och slutligen, tack till alla som har testat sidan och gett feedback!
        </p>
      </div>
    </>
  );
}

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <PageLayout maxWidth="4xl">
      <Card padding="lg" border={false} className="pt-0">
        {language === 'en' ? <AboutEnglish /> : <AboutSwedish />}
      </Card>
    </PageLayout>
  );
}