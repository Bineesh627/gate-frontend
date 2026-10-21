import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, MapPin } from "lucide-react";
import FlyerViewer from "@/components/promotions/FlyerViewer";
import SectionTitle from "@/components/site/SectionTitle";
import SEO from "@/components/site/SEO";
import { useMarket } from "@/context/MarketContext";
import { marketApi } from "@/api/marketApi";

export default function Promotions() {
  const { stores, campaigns } = useMarket();
  const [branch, setBranch] = useState(stores?.[0]?.slug || "al-barsha");
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    marketApi.getPage("promotions").then((res) => {
      if (res?.success && res.page) {
        setPageData(res.page);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (stores?.length > 0 && !stores.some(s => s.slug === branch)) {
      setBranch(stores[0].slug);
    }
  }, [stores, branch]);

  const available = useMemo(() => {
    if (!campaigns?.length) return [];
    return campaigns.filter((c) => {
      const branches = Array.isArray(c.branches) ? c.branches : [];
      return branches.includes(branch);
    });
  }, [campaigns, branch]);

  const [campaignId, setCampaignId] = useState(campaigns?.[0]?.id);

  useEffect(() => {
    if (available.length > 0 && !available.some(c => c.id === campaignId)) {
      setCampaignId(available[0].id);
    }
  }, [available, campaignId]);

  const campaign = available.find((c) => c.id === campaignId) || available[0];

  const pickBranch = (slug) => {
    setBranch(slug);
    const next = campaigns?.filter((c) => {
      const branches = Array.isArray(c.branches) ? c.branches : [];
      return branches.includes(slug);
    }) || [];
    if (next.length > 0 && !next.some((c) => c.id === campaignId)) {
      setCampaignId(next[0].id);
    }
  };

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
            kicker={content.kicker || "THIS WEEK AT GATE"}
            title={content.title || "The latest offers."}
            blurb={content.blurb || "Browse our latest promotional flyers, explore offers by branch and discover the deals available during each campaign."}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.24em] text-black/45">
            <MapPin className="h-4 w-4 text-[#E65100]" /> Branch
          </span>
          {stores?.map((s) => (
            <button
              key={s.slug}
              onClick={() => pickBranch(s.slug)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                branch === s.slug
                  ? "bg-[#007BB5] text-white shadow-lg shadow-[#007BB5]/25"
                  : "border border-black/10 text-[#1A1A1A] hover:border-[#007BB5]/50"
              }`}
            >
              {s.name.replace("Gate — ", "")}
            </button>
          ))}
        </div>

        {available.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-2 inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.24em] text-black/45">
              <Tag className="h-4 w-4 text-[#E65100]" /> Campaign
            </span>
            {available.map((c) => (
              <button
                key={c.id}
                onClick={() => setCampaignId(c.id)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                  campaign?.id === c.id
                    ? "bg-[#E65100] text-white shadow-lg shadow-[#E65100]/25"
                    : "border border-black/10 text-[#1A1A1A] hover:border-[#E65100]/50"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        {campaign && (
          <>
            <div className="mt-12 max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{campaign.title}</h2>
              <p className="mt-2 font-semibold text-[#007BB5]">{campaign.season}</p>
              <p className="mt-3 text-lg leading-[1.6] text-black/60">{campaign.blurb}</p>
            </div>

            <div className="mt-14">
              <FlyerViewer campaign={campaign} />
            </div>
          </>
        )}

        {available.length === 0 && (
          <div className="mt-14 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-xl mx-auto shadow-xs">
            <Tag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-slate-800">No active circulars for this branch</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              New promotional flyers are being prepared. Select another branch or visit in-store!
            </p>
          </div>
        )}

        <div className="mt-24 rounded-[32px] bg-[#0B1A22] p-10 text-center sm:p-16">
          <h3 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Seen something you like? It's waiting in the aisle.
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-[1.6] text-white/65">
            All Gate promotions run in our physical stores across Dubai and Ajman.
          </p>
          <Link
            to="/stores"
            className="mt-8 inline-flex rounded-full bg-[#E65100] px-8 py-4 font-heading text-lg font-bold text-white transition-transform hover:-translate-y-1"
          >
            Find a Gate Store
          </Link>
        </div>
      </section>
    </div>
  );
}