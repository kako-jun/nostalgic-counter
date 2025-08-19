import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      color: 'black', 
      fontFamily: 'MS Sans Serif, sans-serif', 
      fontSize: '12px',
      padding: '16px',
      lineHeight: '1.4'
    }}>
      <h1 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>HTTP 404 - File not found</h1>
      
      <p>Internet Explorer cannot find the Web page you requested.</p>
      
      <p>The Web page you have requested could not be found on this server. Please check for any typing errors in the URL, or click the Refresh button to try again.</p>
      
      <p>If you reached this page by clicking a link, contact the Web site administrator to inform them that the link is incorrectly formatted.</p>
      
      <p>Click the <Link href="/" style={{ textDecoration: 'underline', color: 'blue' }}>Back</Link> button to try another link.</p>
      
      <hr style={{ margin: '16px 0', border: '1px solid #c0c0c0', borderBottom: 'none' }} />
      
      <p style={{ fontSize: '11px', color: '#606060' }}>
        HTTP 404 - File not found<br />
        Internet Information Services (IIS)
      </p>
    </div>
  );
}