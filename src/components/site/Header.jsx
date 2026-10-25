import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/promotions", label: "Promotions" },
  { to: "/stores", label: "Stores" },
  { to: "/blog", label: "Blog" },
  { to: "/careers", label: "Careers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-[72px] flex items-center justify-between gap-6">
        <Logo variant="header" />

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group relative py-2 text-[15px] font-medium text-[#1A1A1A] transition-colors hover:text-[#007BB5]"
            >
              {l.label}
              <span
                className={`absolute left-1/2 -bottom-0.5 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#E65100] transition-all duration-300 ${
                  active(l.to)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                }`}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/stores"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#E65100] px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[#E65100]/25 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <MapPin className="h-4 w-4" />
            Find a Gate Store
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden rounded-full p-2.5 text-[#1A1A1A]"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-black/5 bg-white px-5 pb-6 pt-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center justify-between border-b border-black/5 py-4 font-heading text-lg font-semibold ${
                active(l.to) ? "text-[#007BB5]" : "text-[#1A1A1A]"
              }`}
            >
              {l.label}
              {active(l.to) && <span className="h-2 w-2 rotate-45 bg-[#E65100]" />}
            </Link>
          ))}
          <Link
            to="/stores"
            className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#E65100] px-6 py-4 font-semibold text-white"
          >
            <MapPin className="h-5 w-5" /> Find a Gate Store
          </Link>
        </div>
      )}
    </header>
  );
}