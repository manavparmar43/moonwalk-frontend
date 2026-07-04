import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'MoonWalk',
  description: 'Order countdown timers for space-themed restaurants',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
