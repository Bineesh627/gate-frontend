import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Layers } from "lucide-react";
import { Image } from "@/components/ui/image";
import PostCard from "@/components/blog/PostCard";
import SEO from "@/components/site/SEO";
import { marketApi } from "@/api/marketApi";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    marketApi.getBlog(slug)
      .then((res) => {
        if (isMounted && res?.success && res.blog) {
          setPost(res.blog);
        } else if (isMounted) {
          setPost(null);
        }
      })
      .catch(() => {
        if (isMounted) setPost(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    marketApi.getBlogs()
      .then((res) => {
        if (isMounted && res?.success) {
          setAllPosts(res.blogs || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (!post && !loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <h1 className="font-heading text-4xl font-extrabold">Article not found</h1>
        <Link to="/blog" className="mt-6 inline-flex rounded-full bg-[#007BB5] px-6 py-3 font-semibold text-white">
          Back to the blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#007BB5] border-r-transparent"></div>
        <p className="mt-4 text-black/50">Loading article...</p>
      </div>
    );
  }

  const stackItems = post.stack
    ? post.stack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const bodyParagraphs = Array.isArray(post.body)
    ? post.body
    : typeof post.body === "string"
    ? post.body.split("\n\n").filter(Boolean)
    : [];

  const others = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="pb-28">
      <SEO
        title={post.meta_title || `${post.title} | Gate Hypermarket`}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords || post.stack || post.category}
        ogImage={post.image}
        ogTitle={post.meta_title || post.title}
        ogDescription={post.meta_description || post.excerpt}
      />

      <div className="mx-auto max-w-3xl px-5 pt-16 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-[#007BB5]">
          <ArrowLeft className="h-4 w-4" /> The Gate Journal
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-[#007BB5]">
          <span>{post.category}</span>
          <span className="h-1.5 w-1.5 rotate-45 bg-[#E65100]" />
          <span className="text-black/40">{post.read || post.read_time}</span>
        </div>

        {stackItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-black/45">
              <Layers className="h-3.5 w-3.5 text-[#E65100]" /> Stack:
            </span>
            {stackItems.map((s, idx) => (
              <span
                key={idx}
                className="rounded-full bg-[#007BB5]/10 px-3 py-1 text-xs font-semibold text-[#007BB5]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <h1 className="mt-5 font-heading text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-xl leading-[1.6] text-black/60">{post.excerpt}</p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl px-5 lg:px-8">
        <Image
          src={post.image}
          alt={post.image_alt || post.title}
          className="h-80 w-full rounded-[32px] sm:h-[520px]"
          fittingType="fill"
        />
        {post.image_alt && (
          <p className="mt-2 text-center text-xs text-black/40 italic">
            {post.image_alt}
          </p>
        )}
      </div>

      <div className="mx-auto mt-14 max-w-3xl px-5 lg:px-8">
        <div
          className="article-rich-content text-lg leading-[1.8] text-black/80 space-y-4"
          dangerouslySetInnerHTML={{
            __html:
              typeof post.body === "string"
                ? post.body
                : Array.isArray(post.body)
                ? post.body
                    .map((p) => {
                      if (!p) return "";
                      const str = String(p).trim();
                      if (
                        str.startsWith("<p") ||
                        str.startsWith("<h") ||
                        str.startsWith("<div") ||
                        str.startsWith("<ul") ||
                        str.startsWith("<ol") ||
                        str.startsWith("<blockquote")
                      ) {
                        return str;
                      }
                      return `<p>${str}</p>`;
                    })
                    .join("")
                : "",
          }}
        />

        <div className="mt-14 rounded-3xl bg-[#F5FAFD] p-8">
          <h3 className="font-heading text-2xl font-extrabold tracking-tight">Shop it at your nearest Gate</h3>
          <p className="mt-2 text-black/60 leading-[1.6]">
            Everything mentioned here is stocked across our four stores in Dubai and Ajman.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/stores" className="rounded-full bg-[#E65100] px-6 py-3 font-semibold text-white hover:bg-[#d44700] transition-colors">
              Find a Gate Store
            </Link>
            <Link to="/promotions" className="rounded-full border border-black/15 px-6 py-3 font-semibold hover:bg-black/5 transition-colors">
              View this week's flyer
            </Link>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <div className="mx-auto mt-24 max-w-7xl px-5 lg:px-8">
          <h3 className="font-heading text-2xl font-extrabold tracking-tight">Keep reading</h3>
          <div className="mt-8 grid gap-12 md:grid-cols-2">
            {others.map((p, i) => (
              <PostCard key={p.slug || i} post={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}