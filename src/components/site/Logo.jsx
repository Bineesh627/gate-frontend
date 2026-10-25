import React from "react";
import { Link } from "react-router-dom";
import { BRAND } from "@/lib/gateData";

export default function Logo({
  light = false,
  variant = "full",
  className = "",
  imgClassName = "",
}) {
  if (variant === "header" || variant === "icon") {
    return (
      <Link to="/" className={`flex items-center gap-2.5 shrink-0 ${className}`} aria-label="Gate home">
        <img
          src={BRAND.logo}
          alt="Gate logo"
          className={imgClassName || "h-9 w-auto object-contain"}
        />
        <span
          className={`font-heading text-2xl font-extrabold tracking-tight ${
            light ? "text-white" : "text-[#1A1A1A]"
          }`}
        >
          Gate
        </span>
      </Link>
    );
  }

  return (
    <Link to="/" className={`inline-flex items-center shrink-0 ${className}`} aria-label="Gate home">
      <img
        src={BRAND.fullLogo}
        alt="Gate Hypermarket"
        className={imgClassName || "h-11 w-auto object-contain"}
      />
    </Link>
  );
}