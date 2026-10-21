import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Clock,
  Tag,
  ShoppingBag,
  Briefcase,
  PhoneCall,
  MessageCircle,
  Store,
} from "lucide-react";
import SectionTitle from "@/components/site/SectionTitle";
import { useMarket } from "@/context/MarketContext";

const DEFAULT_FAQS = [
  {
    id: "hours",
    category: "Store & Hours",
    icon: Clock,
    question: "What are Gate Hypermarket's daily store opening and closing hours?",
    answer:
      "Most Gate Hypermarket branches are open daily from 8:00 AM to 12:00 Midnight, with select flagship branches operating extended hours until 1:00 AM on weekends and public holidays. Check our Stores page for branch-specific opening hours, direct telephone lines, and directions.",
  },
  {
    id: "promotions",
    category: "Deals & Offers",
    icon: Tag,
    question: "Where can I browse your latest weekly promotions and digital flyers?",
    answer:
      "You can browse our interactive digital catalogues and special promotion flyers right here on our Promotions page. Our catalogues are updated weekly with unbeatable discounts across fresh produce, butchery, seafood, dairy, household essentials, and consumer electronics.",
  },
  {
    id: "freshness",
    category: "Quality & Freshness",
    icon: ShoppingBag,
    question: "Do you receive fresh fruits, vegetables, and meats daily?",
    answer:
      "Yes, absolutely. We receive daily air-freighted shipments of fresh organic fruits and vegetables, farm-fresh poultry, premium butchery cuts, and fresh seafood. Our in-house bakeries also bake artisanal breads, cakes, and Arabic sweets fresh multiple times throughout the day.",
  },
  {
    id: "parking",
    category: "Store & Hours",
    icon: Store,
    question: "Is free customer parking available at Gate Hypermarket branches?",
    answer:
      "Yes! All Gate Hypermarket branches offer ample, free customer parking with dedicated accessible spots, elevator connections, and easy cart ramp access directly into the hypermarket entrance.",
  },
  {
    id: "payment",
    category: "Deals & Offers",
    icon: Tag,
    question: "What payment methods are accepted at checkout?",
    answer:
      "We accept all major credit and debit cards (Visa, MasterCard), contactless NFC mobile payments (Apple Pay, Google Pay, Samsung Pay), cash, and Gate Hypermarket Gift Cards at all cashier counters.",
  },
  {
    id: "careers",
    category: "Careers",
    icon: Briefcase,
    question: "How can I apply for job openings at Gate Hypermarket?",
    answer:
      "Explore our online Careers page to view current open positions across Store Operations, Customer Service, Cashiering, Logistics, and Inventory Management. You can submit your CV / resume online directly through our application portal.",
  },
  {
    id: "contact",
    category: "Customer Support",
    icon: PhoneCall,
    question: "How can I contact customer support or share shopping feedback?",
    answer:
      "Our customer care team is always delighted to assist you. You can message us through our Contact Us page, call your nearest branch directly, or reach out to us on WhatsApp during store hours.",
  },
];

const CATEGORIES = ["All", "Store & Hours", "Deals & Offers", "Quality & Freshness", "Careers", "Customer Support"];

export default function FaqSection({ content }) {
  const { settings } = useMarket();
  const [openId, setOpenId] = useState("hours");
  const [activeCategory, setActiveCategory] = useState("All");

  const faqs = content?.faqs && Array.isArray(content.faqs) && content.faqs.length > 0
    ? content.faqs
    : DEFAULT_FAQS;

  const filteredFaqs = activeCategory === "All"
    ? faqs
    : faqs.filter((item) => item.category === activeCategory);

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const title = content?.faq_title || "Frequently Asked Questions";
  const blurb =
    content?.faq_subtitle ||
    "Find fast answers to common questions about store timings, weekly flyers, fresh products, and shopping services at Gate Hypermarket.";
  const kicker = content?.faq_kicker || "Help & FAQs";

  // SEO Schema.org FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32" id="faq">
      {/* Inject FAQ structured schema for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <SectionTitle
        kicker={kicker}
        title={title}
        blurb={blurb}
        align="center"
      />

      {/* Category Filter Pills */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-[#007BB5] text-white shadow-md shadow-[#007BB5]/25"
                  : "bg-black/[0.04] text-black/65 hover:bg-black/[0.08] hover:text-black"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="mx-auto mt-12 max-w-4xl space-y-4">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon || HelpCircle;

          return (
            <motion.div
              key={faq.id || index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-[#007BB5]/50 bg-white shadow-lg shadow-[#007BB5]/5"
                  : "border-black/10 bg-white hover:border-black/20 hover:shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                      isOpen
                        ? "bg-[#007BB5] text-white"
                        : "bg-black/[0.04] text-black/60 group-hover:bg-[#007BB5]/10 group-hover:text-[#007BB5]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3
                    className={`font-heading text-base font-bold tracking-tight sm:text-lg transition-colors ${
                      isOpen ? "text-[#007BB5]" : "text-[#1A1A1A]"
                    }`}
                  >
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-[#007BB5]/10 text-[#007BB5]" : "bg-black/[0.04] text-black/50"
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="border-t border-black/[0.06] px-5 pb-6 pt-4 sm:px-6 sm:pb-6">
                      <p className="text-sm sm:text-base leading-relaxed text-black/70 font-normal">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Assistance & Contact Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto mt-16 max-w-4xl rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 text-white shadow-xl sm:p-10"
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E65100]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E65100]" />
              Need Assistance?
            </div>
            <h4 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl text-white">
              Still have questions?
            </h4>
            <p className="mt-2 text-sm sm:text-base text-white/70 max-w-lg">
              Our customer support team and store managers are happy to help you with branch directions, product availability, or bulk orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#E65100] px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#d84800] hover:shadow-lg hover:shadow-[#E65100]/25"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Us
            </Link>
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10"
            >
              <Store className="h-4 w-4" />
              Find Stores
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
