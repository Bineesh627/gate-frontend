import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Twitter, Phone, Mail, Clock } from "lucide-react";
import Logo from "./Logo";
import { useMarket } from "@/context/MarketContext";

function TikTokIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2.92-1.42 4.87 4.87 0 0 1-1.12-3.1h3z" />
    </svg>
  );
}

export default function Footer() {
  const { settings, stores } = useMarket();

  const socialLinks = settings?.social_links || {};
  const currentYear = new Date().getFullYear();
  const copyright = String(settings?.copyright_text || "© {year} Gate Hypermarket. All rights reserved.")
    .replace(/Â©/g, "©")
    .replace("{year}", currentYear);

  return (
    <footer className="bg-[#0B1A22] text-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo light />
            {settings?.footer_about ? (
              <p className="mt-5 max-w-xs text-white/60 leading-relaxed">
                {settings.footer_about}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="rounded-full bg-white/10 p-3 transition-colors hover:bg-[#E65100]"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="rounded-full bg-white/10 p-3 transition-colors hover:bg-[#E65100]"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="rounded-full bg-white/10 p-3 transition-colors hover:bg-[#E65100]"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="rounded-full bg-white/10 p-3 transition-colors hover:bg-[#E65100]"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / X"
                  className="rounded-full bg-white/10 p-3 transition-colors hover:bg-[#E65100]"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[#4CC9F0]">
              Customer Service
            </h4>
            <ul className="mt-6 space-y-3 text-white/70">
              <li><Link to="/contact" className="transition-colors hover:text-white">Contact Us</Link></li>
              <li><Link to="/careers" className="transition-colors hover:text-white font-medium text-[#4CC9F0]">Careers & Jobs</Link></li>
              <li><Link to="/promotions" className="transition-colors hover:text-white">Current Flyers</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-white">About Gate</Link></li>
              <li><Link to="/blog" className="transition-colors hover:text-white">Blog & Guides</Link></li>
              {settings?.contact_phone && (
                <li>
                  <a
                    href={`tel:${String(settings.contact_phone).replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4" /> {String(settings.contact_phone)}
                  </a>
                </li>
              )}
              {settings?.contact_email && (
                <li>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4" /> {settings.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[#4CC9F0]">
              Operating Hours
            </h4>
            <ul className="mt-6 space-y-4">
              {stores?.map((s) => (
                <li key={s.slug} className="group">
                  <Link
                    to={`/stores/${s.slug}`}
                    className="block font-semibold text-white transition-colors group-hover:text-[#4CC9F0] hover:underline"
                  >
                    {s.name}
                  </Link>
                  <span className="inline-flex items-center gap-2 text-sm text-white/70 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-white/50" /> {s.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}