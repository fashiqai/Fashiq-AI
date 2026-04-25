import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-column brand-col">
            <Link href="/" className="nav-brand">
              Fashiq <span className="brand-italic">AI</span>
            </Link>
            <p className="footer-text">
              Transforming your boutique with the world's most advanced 
              AI fashion photography studio. Professional on-model 
              shots in seconds.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">Instagram</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
            </div>
          </div>

          {/* Studio Links */}
          <div className="footer-column">
            <h4>Studio</h4>
            <ul className="footer-links">
              <li><Link href="/studio/clothing">Clothing Engine</Link></li>
              <li><Link href="/login">Jewelry Studio</Link></li>
              <li><Link href="/">Model Library</Link></li>
              <li><Link href="/">Brand Assets</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="footer-column">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link href="/#pricing">Pricing</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link href="/">Contact Us</Link></li>
              <li><Link href="/">Help Center</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright">© 2026 FashiqAI Studio. All rights reserved.</p>
          <p className="footer-note">Built for the new era of high-end fashion.</p>
        </div>
      </div>
    </footer>
  );
}
