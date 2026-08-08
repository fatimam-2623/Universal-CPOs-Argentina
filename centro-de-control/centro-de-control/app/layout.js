import './globals.css';

export const metadata = {
  title: 'Centro de Control',
  description: 'Gestión de CPOs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
