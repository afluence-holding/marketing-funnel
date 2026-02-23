export const metadata = {
  title: 'Marketing Funnel',
  description: 'Lead capture & funnel management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
