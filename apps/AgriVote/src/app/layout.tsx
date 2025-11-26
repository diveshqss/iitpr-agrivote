import './global.css';

export const metadata = {
  title: 'AgriVote - Agricultural Voting Platform',
  description: 'A modern platform for farmers to ask questions, experts to answer, and the community to vote on agricultural solutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
