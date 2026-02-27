import { TenantProvider } from '@/lib/tenant-context';
import { AuthProvider } from '@/lib/auth-context';

export default async function VenueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <AuthProvider>
      <TenantProvider slug={slug}>
        {children}
      </TenantProvider>
    </AuthProvider>
  );
}
