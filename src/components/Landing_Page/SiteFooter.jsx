import { Link } from 'react-router-dom'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Footer navigation">
        <Link to="/about">About</Link>
        <Link to="/safety">Safety</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/help">Help</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <p>© 2026 EventMate</p>
    </footer>
  )
}

export default SiteFooter