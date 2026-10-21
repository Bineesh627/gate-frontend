import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { marketApi } from '@/api/marketApi';
import { stores as defaultStores, BRAND, campaigns as defaultCampaigns } from '@/lib/gateData';

const MarketContext = createContext(null);

export const defaultSettings = {
  social_links: {
    instagram: '',
    facebook: '',
    youtube: '',
    twitter: '',
    tiktok: '',
  },
  copyright_text: '',
  footer_about: '',
  contact_email: '',
  contact_phone: '',
  contact_whatsapp: '',
  seo_global: {
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
  },
};

export function MarketProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [stores, setStores] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      // Fetch settings
      const settingsRes = await marketApi.getSettings().catch(() => null);
      if (settingsRes?.success && settingsRes.settings) {
        const rawSettings = settingsRes.settings;
        setSettings((prev) => ({
          ...prev,
          ...rawSettings,
          contact_phone: rawSettings.contact_phone != null ? String(rawSettings.contact_phone) : '',
          contact_whatsapp: rawSettings.contact_whatsapp != null ? String(rawSettings.contact_whatsapp) : '',
          footer_about: rawSettings.footer_about != null ? String(rawSettings.footer_about) : '',
          social_links: {
            ...prev.social_links,
            ...(rawSettings.social_links || {}),
          },
          seo_global: {
            ...prev.seo_global,
            ...(rawSettings.seo_global || {}),
          },
        }));
      }

      // Fetch stores
      const storesRes = await marketApi.getStores().catch(() => null);
      if (storesRes?.success && storesRes.stores) {
        setStores(storesRes.stores);
      }

      // Fetch campaigns
      const campaignsRes = await marketApi.getCampaigns().catch(() => null);
      if (campaignsRes?.success) {
        setCampaigns(campaignsRes.campaigns || []);
      }
    } catch (err) {
      console.warn('MarketProvider fetch error, using fallbacks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <MarketContext.Provider
      value={{
        settings,
        stores,
        campaigns,
        loading,
        refreshSettings: fetchAll,
        refreshStores: fetchAll,
        refreshCampaigns: fetchAll,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return ctx;
}
