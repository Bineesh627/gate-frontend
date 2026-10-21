import React, { useState, useEffect } from "react";
import { MessageCircle, Phone, Mail, Send, CheckCircle2, Clock } from "lucide-react";
import SectionTitle from "@/components/site/SectionTitle";
import SEO from "@/components/site/SEO";
import { useMarket } from "@/context/MarketContext";
import { marketApi } from "@/api/marketApi";

export default function Contact() {
  const { stores, settings } = useMarket();
  const [pageData, setPageData] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", branch: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    marketApi.getPage("contact").then((res) => {
      if (res?.success && res.page) {
        setPageData(res.page);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (stores?.length > 0 && !form.branch) {
      setForm((prev) => ({ ...prev, branch: stores[0].slug }));
    }
  }, [stores, form.branch]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await marketApi.submitContact(form);
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const content = pageData?.content || {};
  const kicker = content.kicker || "Contact us";
  const title = content.title || "Talk to your Gate store.";
  const blurb =
    content.blurb ||
    "Send us a general enquiry, call a branch directly, or message us on WhatsApp — we usually reply within a few hours.";
  const whatsappTitle = content.whatsapp_title || "Chat on WhatsApp";
  const whatsappSubtitle = content.whatsapp_subtitle || "Fastest way to reach customer service";
  const workTiming = content.work_timing || "";
  const directBranchTitle = content.branch_contacts_title || "Direct branch contacts";

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
            kicker={kicker}
            title={title}
            blurb={blurb}
          />
          {workTiming && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#007BB5]/10 px-4 py-2 text-sm font-semibold text-[#007BB5]">
              <Clock className="h-4 w-4" />
              {workTiming}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-16 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div className="rounded-[32px] border border-black/10 p-8 shadow-[0_25px_70px_-50px_rgba(0,0,0,0.4)] sm:p-10">
          {sent ? (
            <div className="py-14 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#007BB5]" />
              <h3 className="mt-6 font-heading text-2xl font-extrabold">Thank you, {form.name || "friend"}!</h3>
              <p className="mt-3 text-black/60 leading-[1.6]">
                Your enquiry has reached our customer service team and is saved in our system. We'll be in touch shortly.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", branch: stores[0]?.slug || "", message: "" });
                }}
                className="mt-8 rounded-full border border-black/15 px-6 py-3 font-semibold hover:bg-black/5 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <h3 className="font-heading text-2xl font-extrabold tracking-tight">
                {content.form_title || "General enquiry"}
              </h3>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">Your name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={set("name")}
                  className="w-full rounded-2xl border border-black/15 px-5 py-4 text-lg outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  className="w-full rounded-2xl border border-black/15 px-5 py-4 text-lg outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label htmlFor="contact-branch" className="mb-2 block text-sm font-semibold">Which store?</label>
                <select
                  id="contact-branch"
                  name="branch"
                  value={form.branch}
                  onChange={set("branch")}
                  className="w-full rounded-2xl border border-black/15 px-5 py-4 text-lg outline-none transition-colors focus:border-[#007BB5]"
                >
                  {stores?.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={set("message")}
                  className="w-full rounded-2xl border border-black/15 px-5 py-4 text-lg outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#E65100] px-8 py-4 font-heading text-lg font-bold text-white shadow-lg shadow-[#E65100]/25 transition-transform hover:-translate-y-1 disabled:opacity-50"
              >
                <Send className="h-5 w-5" /> {submitting ? "Sending..." : "Send enquiry"}
              </button>
            </form>
          )}
        </div>

        <div>
          {settings?.contact_whatsapp && (
            <a
              href={`https://wa.me/${String(settings.contact_whatsapp).replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-3xl bg-[#1FA855] p-7 text-white transition-transform hover:-translate-y-1"
            >
              <MessageCircle className="h-10 w-10 shrink-0" />
              <span>
                <span className="block font-heading text-xl font-bold">{whatsappTitle}</span>
                <span className="text-white/85">{whatsappSubtitle}</span>
              </span>
            </a>
          )}

          <div className="mt-8 space-y-4">
            <h3 className="font-heading text-xl font-extrabold tracking-tight">{directBranchTitle}</h3>
            {stores?.map((s) => (
              <div key={s.slug} className="rounded-2xl border border-black/10 p-6">
                <span className="font-heading text-lg font-bold">{s.name}</span>
                <p className="mt-1 text-sm text-black/55 leading-[1.6]">{s.address}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`tel:${String(s.phone || "").replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#007BB5] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Phone className="h-4 w-4" /> {s.phone}
                  </a>
                  <span className="inline-flex items-center rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold">
                    {s.hours}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {settings?.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="mt-8 inline-flex items-center gap-2 font-semibold text-[#007BB5]"
            >
              <Mail className="h-5 w-5" /> {settings.contact_email}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}