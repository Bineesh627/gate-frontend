import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import PostCard from "@/components/blog/PostCard";
import SectionTitle from "@/components/site/SectionTitle";
import SEO from "@/components/site/SEO";
import { marketApi } from "@/api/marketApi";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    setLoading(true);
    marketApi.getBlogs()
      .then((res) => {
        if (res?.success) {
          setBlogs(res.blogs || []);
        }
      })
      .catch(() => {
        setBlogs([]);
      })
      .finally(() => {
        setLoading(false);
      });

    marketApi.getPage("blog")
      .then((res) => {
        if (res?.success && res.page) {
          setPageData(res.page);
        }
      })
      .catch(() => {});
  }, []);

  const [featured, ...rest] = blogs;
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
            kicker={content.kicker || "LOCAL STORIES & SHOPPING GUIDES"}
            title={content.title || "The GATE Journal."}
            blurb={content.blurb || "Discover shopping tips, seasonal favourites, food inspiration and the latest updates from GATE stores across Dubai and Ajman."}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 lg:px-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#007BB5] border-r-transparent"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading journal articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center max-w-xl mx-auto shadow-xs">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-slate-800">No published articles yet</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Fresh stories, recipes, and shopping guides will appear here once published from the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid gap-14 md:grid-cols-2">
            {featured && <PostCard post={featured} featured />}
            {rest.map((p, i) => (
              <PostCard key={p.slug || i} post={p} index={i + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}