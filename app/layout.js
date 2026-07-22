import './globals.css';

export const metadata = {
  title: 'SportAnytime | NUS Athletic Pooling',
  description: 'Find your game. Fill your team.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="mobile-wrapper">{children}</div>
      </body>
    </html>
  );
}
