import React from "react";
import { motion } from "framer-motion";
import { Leaf, Sparkles, HeartHandshake } from "lucide-react";
import { Image } from "@/components/ui/image";

const defaultPoints = [
  { icon: Leaf, title: "Something for Everyone", text: "Explore a wide selection of home essentials, fashion, toys, household products and lifestyle finds." },
  { icon: Sparkles, title: "Offers Worth Exploring", text: "Discover seasonal promotions, special deals and limited-time offers across our departments." },
  { icon: HeartHandshake, title: "Discover Something New", text: "Find fresh inspiration for your home, family and everyday life with every visit." },
];

export default function FreshBand({ content }) {
  const title = content?.freshband_title || "More to Explore. More to Save.";

  return (
    <section className="relative overflow-hidden bg-[#0B1A22] py-28 lg:py-40">
      <Image
        src="/images/fresh-produce.jpg"
        alt="Dew-covered fresh vegetables in a Gate produce bin"
        className="absolute inset-0 h-full w-full opacity-30"
        fittingType="fill"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1A22] via-[#0B1A22]/85 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl"
        >
          {title.includes(",") ? (
            <>
              {title.split(",")[0]}, <span className="text-[#4CC9F0]">{title.split(",").slice(1).join(",")}</span>
            </>
          ) : (
            title
          )}
        </motion.h2>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {defaultPoints.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
            >
              <p.icon className="h-9 w-9 text-[#E65100]" />
              <h3 className="mt-5 font-heading text-xl font-bold text-white">{p.title}</h3>
              <p className="mt-3 text-white/65 leading-[1.6]">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}