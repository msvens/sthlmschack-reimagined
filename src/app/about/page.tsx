'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/Card';

export default function AboutPage() {
  return (
    <PageLayout maxWidth="4xl">
      <Card padding="lg" border={false} className="pt-0">
        <h1 className="text-3xl font-light mb-6 text-gray-900 dark:text-white">
          Om Stockholmschack
        </h1>

        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            Välkommen till Stockholmschacks portal, din centrala källa för schackturneringar,
            spelarinformation och resultat från Stockholms schackvärld.
          </p>

          <p>
            Denna plattform tillhandahåller omfattande turneringsresultat, spelarstatistik och
            kommande schackevenemang i Stockholmsregionen. Oavsett om du är en tävlingsspelare
            som följer dina resultat eller en schackentusiast som följer lokala turneringar,
            hittar du all information du behöver här.
          </p>

          <p>
            Vår databas innehåller detaljerad turneringshistorik, spelarratings och
            rondresultat från klubbar i hela Stockholm. Vi är dedikerade till att göra
            schackinformation tillgänglig och lätt att navigera för alla i gemenskapen.
          </p>

          <div className="pt-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Relaterade länkar
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a
                  href="https://schack.se/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Svenska Schackförbundet
                </a>
              </li>
              <li>
                <a
                  href="https://www.stockholmsschack.se/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Stockholms Schackförbund
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
}