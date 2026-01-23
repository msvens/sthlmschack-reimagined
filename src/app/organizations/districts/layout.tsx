import { PageLayout } from '@/components/layout/PageLayout';

export default function DistrictsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageLayout maxWidth="4xl">
      {children}
    </PageLayout>
  );
}
