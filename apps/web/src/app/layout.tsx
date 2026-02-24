export const metadata = {
  title: 'Marketing Pipeline',
  description: 'Lead capture & pipeline management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
