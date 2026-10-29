import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function TawkManager() {
  const location = useLocation();
  const isAdmin =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login");

  useEffect(() => {
    // 1. Toggle body class for immediate CSS hiding
    if (isAdmin) {
      document.body.classList.add("hide-tawk-widget");
    } else {
      document.body.classList.remove("hide-tawk-widget");
    }

    // 2. Control Tawk.to via official JavaScript API
    const applyTawkVisibility = () => {
      if (typeof window === "undefined" || !window.Tawk_API) return;

      if (
        typeof window.Tawk_API.hideWidget === "function" &&
        typeof window.Tawk_API.showWidget === "function"
      ) {
        if (isAdmin) {
          window.Tawk_API.hideWidget();
        } else {
          window.Tawk_API.showWidget();
        }
      }
    };

    applyTawkVisibility();

    // If script is still loading in background, register onLoad hook
    if (typeof window !== "undefined" && window.Tawk_API) {
      const existingOnLoad = window.Tawk_API.onLoad;
      window.Tawk_API.onLoad = function () {
        if (typeof existingOnLoad === "function") {
          try {
            existingOnLoad();
          } catch (_) {}
        }
        applyTawkVisibility();
      };
    }
  }, [location.pathname, isAdmin]);

  return null;
}

