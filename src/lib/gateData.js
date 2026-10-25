export const BRAND = {
  logo: "/images/logo.png",
  fullLogo: "/images/logo-full.png",
};

export const stores = [];

export const getStore = (slug) => stores.find((s) => s.slug === slug);

export const mapEmbed = (store) =>
  store?.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&z=15&output=embed`
    : "";

export const directionsUrl = (store) =>
  store?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`
    : "#";

export const campaigns = [];

export const posts = [];

export const getPost = (slug) => posts.find((p) => p.slug === slug);