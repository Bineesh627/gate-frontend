import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Users, ShieldCheck, Store } from "lucide-react";
import { Image } from "@/components/ui/image";
import SectionTitle from "@/components/site/SectionTitle";
import SEO from "@/components/site/SEO";
import { marketApi } from "@/api/marketApi";

const iconMap = {
  Leaf,
  Users,
  ShieldCheck,
  Store,
};

const defaultValues = [
  { icon: Leaf, title: "Freshness first", text: "Daily deliveries and a strict morning sort across every produce hall." },
  { icon: ShieldCheck, title: "Quality commitment", text: "Sourcing standards and cold-chain checks documented at every store." },
  { icon: Users, title: "Community values", text: "Local hiring, neighbourhood pricing and support for community events." },
  { icon: Store, title: "Growing carefully", text: "Four stores today, each opened only when we could staff it properly." },
];

const defaultStory = [
  "What began in Al Quoz has grown into four GATE stores across Dubai and Ajman, and this is only the beginning of our journey. With a strong foundation built on customer trust, product variety and our commitment to everyday value, we continue to move forward with a bigger vision for the future.",
  "As GATE grows, our ambition goes beyond the stores we operate today. We are working towards expanding our presence, reaching new communities and bringing the GATE shopping experience to more people across the UAE. Every step forward is an opportunity to grow stronger, serve more customers and build on the foundation we have established.",
  "Our growth reflects our belief that there is still much more to achieve. We continue to develop our retail operations, strengthen our existing stores and look ahead to new opportunities that will help us reach more customers. With every milestone, we move closer to our ambition of building a wider retail network while staying true to the principles that define GATE.",
  "The future holds new possibilities, new locations and new opportunities to connect with communities across the country. As we continue to grow, our focus remains on building a stronger GATE, creating better shopping experiences and making our presence felt in more neighbourhoods.",
];

export default function About() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    marketApi.getPage("about").then((res) => {
      if (res?.success && res.page) {
        setPageData(res.page);
      }
    }).catch(() => { });
  }, []);

  const content = pageData?.content || {};
  const kicker = content.kicker || "Our story";
  const title = content.title || "FROM AL QUOZ TO WHAT’S NEXT";
  const heroImage = content.hero_image || "/images/about-hero.jpg";
  const heroImageAlt = content.hero_image_alt || "Gate hypermarket entrance looking out to a sunny UAE street";
  const storyParagraphs = Array.isArray(content.story_paragraphs) ? content.story_paragraphs : defaultStory;

  const values = Array.isArray(content.values)
    ? content.values.map((v) => ({
      ...v,
      IconComponent: iconMap[v.icon] || Store,
    }))
    : defaultValues.map((v) => ({ ...v, IconComponent: v.icon }));

  return (
    <div className="pb-28">
      <SEO
        title={pageData?.meta_title || "About Gate Hypermarket | Our Story & Values"}
        description={pageData?.meta_description || "Learn about Gate Hypermarket from its beginnings in Deira to four hypermarkets in Dubai & Ajman."}
        keywords={pageData?.meta_keywords || "about gate hypermarket, deira sabkha store, uae retail chain"}
      />

      <section className="relative h-[60vh] min-h-[420px] overflow-hidden bg-[#0B1A22]">
        <Image
          src={heroImage}
          alt={heroImageAlt}
          className="absolute inset-0 h-full w-full"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 lg:px-8">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-[#4CC9F0]">{kicker}</span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
        {storyParagraphs.map((p, idx) => (
          <p key={idx} className={`${idx === 0 ? "text-xl text-black/75" : "mt-7 text-lg text-black/70"} leading-[1.6]`}>
            {p}
          </p>
        ))}
      </section>

      <section className="bg-[#F5FAFD] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            kicker={content.values_kicker || "What we stand for"}
            title={content.values_title || "Our Values"}
            blurb={content.values_blurb || ""}
            align="center"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.IconComponent || Store;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.4)]"
                >
                  <Icon className="h-9 w-9 text-[#E65100]" />
                  <h3 className="mt-5 font-heading text-xl font-bold">{v.title}</h3>
                  <p className="mt-3 text-black/60 leading-[1.6]">{v.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 text-center lg:px-8">
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Come see the difference in person.
        </h2>
        <Link
          to="/stores"
          className="mt-8 inline-flex rounded-full bg-[#E65100] px-9 py-5 font-heading text-lg font-bold text-white transition-transform hover:-translate-y-1"
        >
          Find a Gate Store
        </Link>
      </section>
    </div>
  );
}