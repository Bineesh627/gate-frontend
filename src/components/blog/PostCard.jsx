import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Layers } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function PostCard({ post, index = 0, featured = false }) {
  if (!post) return null;

  const stackItems = post.stack
    ? post.stack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={featured ? "md:col-span-2" : ""}
    >
      <Link to={`/blog/${post.slug}`} className="group block">
        <div className="overflow-hidden rounded-[28px]">
          <Image
            src={post.image}
            alt={post.image_alt || post.title}
            className={`w-full transition-transform duration-700 group-hover:scale-105 ${featured ? "h-80 md:h-[440px]" : "h-60"}`}
            fittingType="fill"
          />
        </div>
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-[#007BB5]">
            <span>{post.category}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-[#E65100]" />
            <span className="text-black/40">{post.read || post.read_time}</span>
          </div>

          {stackItems.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#E65100]" />
              {stackItems.map((item, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-[#007BB5]/10 px-2.5 py-0.5 text-xs font-semibold text-[#007BB5]"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <h3 className={`mt-3 font-heading font-extrabold leading-tight tracking-tight transition-colors group-hover:text-[#007BB5] ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
            {post.title}
          </h3>
          <p className="mt-3 max-w-2xl text-black/60 leading-[1.6]">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-[#E65100]">
            Read article <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
