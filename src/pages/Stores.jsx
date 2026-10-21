import React, { useState, useEffect } from "react";
import StoresMap from "@/components/stores/StoresMap";
import StoreCard from "@/components/stores/StoreCard";
import SectionTitle from "@/components/site/SectionTitle";
import SEO from "@/components/site/SEO";
import { useMarket } from "@/context/MarketContext";
import { marketApi } from "@/api/marketApi";

export default function Stores() {
  const { stores } = useMarket();
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    marketApi.getPage("stores").then((res) => {
      if (res?.success && res.page) {
        setPageData(res.page);
      }
    }).catch(() => {});
  }, []);

  const content = pageData?.content || {};

  return (
    <div className="pb-28">
      <SEO
        title={pageData?.meta_title || ""}
        description={pageData?.meta_description || ""}
        keywords={pageData?.meta_keywords || ""}
      />

      <section className="border-b border-black/5 bg-[#F5FAFD] px-5 pb-16 pt-20 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            kicker={content.kicker || "OUR STORES"}
            title={content.title || (stores?.length ? `${stores.length} ${stores.length === 1 ? 'Store. Right Where You Need Us.' : 'Stores. Right Where You Need Us.'}` : "Our Stores")}
            blurb={content.blurb || "Pick the branch closest to you for exact branch timings, contact details and directions before your visit."}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
        <StoresMap stores={stores} />
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {stores?.map((s, i) => (
            <StoreCard key={s.slug} store={s} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}