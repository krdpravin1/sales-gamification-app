import React from 'react';
import Link from 'next/link';

const Nav = () => (
  <nav style={{ padding: '10px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
    <Link href="/" style={{ marginRight: '15px' }}>Leaderboard</Link>
    <Link href="/log" style={{ marginRight: '15px' }}>Log Activity (SAM/AM)</Link>
    <Link href="/admin">Admin Settings</Link>
  </nav>
);

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Nav />
      <div style={{ padding: '20px' }}>
        <Component {...pageProps} />
      </div>
    </>
  );
}