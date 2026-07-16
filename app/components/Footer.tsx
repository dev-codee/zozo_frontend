import Link from "next/link";

const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-border-subtle py-8 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-on-surface tracking-tight">
            zozo<span className="text-primary-container">.pk</span>
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-text-muted hover:text-primary transition-colors text-xs font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-text-muted text-sm">
          © {new Date().getFullYear()} zozo.pk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
