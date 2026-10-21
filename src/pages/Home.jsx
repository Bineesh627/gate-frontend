import React, { useState, useEffect } from "react";
import Hero from "@/components/home/Hero";
import StoreSelector from "@/components/home/StoreSelector";
import CampaignHighlights from "@/components/home/CampaignHighlights";
import FreshBand from "@/components/home/FreshBand";
import FaqSection from "@/components/home/FaqSection";
import SEO from "@/components/site/SEO";
import { marketApi } from "@/api/marketApi";
import { useMarket } from "@/context/MarketContext";

export default function Home() {
  const { stores } = useMarket();
  const [selected, setSelected] = useState(stores?.[0]?.slug || "al-barsha");
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    marketApi.getPage("home").then((res) => {
      if (res?.success && res.page) {
        setPageData(res.page);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (stores?.length > 0 && !stores.some(s => s.slug === selected)) {
      setSelected(stores[0].slug);
    }
  }, [stores, selected]);

  const content = pageData?.content || {};

  return (
    <>
      <SEO
        title={pageData?.meta_title || ""}
        description={pageData?.meta_description || ""}
        keywords={pageData?.meta_keywords || ""}
      />
      <Hero content={content} />
      <StoreSelector selected={selected} onSelect={setSelected} />
      <CampaignHighlights />
      <FreshBand content={content} />
      <FaqSection content={content} />
    </>
  );
}