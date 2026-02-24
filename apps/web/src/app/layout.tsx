import { GoogleTagManagerNoscript } from '@/components/tracking/gtm';
import { gtmId } from '@/lib/config/pixels';

export const metadata = {
  title: 'Marketing Pipeline',
  description: 'Lead capture & pipeline management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleTagManagerNoscript id={gtmId} />
        {children}
      </body>
    </html>
  );
}
