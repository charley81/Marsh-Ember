import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { MenuItem as MenuItemData } from "@/lib/site-data";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text" | "light";
  external?: boolean;
};

export function ButtonLink({ href, children, variant = "primary", external }: ButtonLinkProps) {
  const className = `button button--${variant}`;
  if (external) {
    return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true">↗</span></a>;
  }
  return <Link className={className} href={href}>{children}</Link>;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow${light ? " eyebrow--light" : ""}`}><span>{children}</span><i aria-hidden="true" /></p>;
}

export function SectionHeading({ eyebrow, title, intro, centered = false, light = false }: {
  eyebrow?: string;
  title: string;
  intro?: string;
  centered?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`section-heading${centered ? " section-heading--centered" : ""}${light ? " section-heading--light" : ""}`}>
      {eyebrow ? <Eyebrow light={light}>{eyebrow}</Eyebrow> : null}
      <h2>{title}</h2>
      {intro ? <p className="lede">{intro}</p> : null}
    </div>
  );
}

export function MediaFrame({ src, mobileSrc, alt, className = "", priority = false }: {
  src: string | StaticImageData;
  mobileSrc?: string | StaticImageData;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const desktopSizes = mobileSrc
    ? "(max-width: 767px) 1px, (max-width: 1200px) 50vw, 620px"
    : "(max-width: 767px) calc(100vw - 40px), (max-width: 1200px) 50vw, 620px";

  return <div className={`media-frame ${className}`}>
    <Image className={mobileSrc ? "media-image media-image--desktop" : "media-image"} src={src} alt={alt} fill sizes={desktopSizes} fetchPriority={priority ? "high" : undefined} />
    {mobileSrc ? <Image className="media-image media-image--mobile" src={mobileSrc} alt={alt} fill sizes="(max-width: 767px) calc(100vw - 40px), 1px" fetchPriority={priority ? "high" : undefined} /> : null}
  </div>;
}

export function Tags({ tags }: { tags?: readonly string[] }) {
  if (!tags?.length) return null;
  return <div className="tags" aria-label="Dietary and preparation notes">{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>;
}

export function MenuItem({ item, compact = false }: { item: MenuItemData; compact?: boolean }) {
  return (
    <article className={`menu-item${compact ? " menu-item--compact" : ""}`}>
      <div className="menu-item__title"><h3>{item.name}</h3>{item.price ? <strong>{item.price}</strong> : null}</div>
      <p>{item.description}</p>
      <Tags tags={item.tags} />
    </article>
  );
}

export function Actions({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return <div className={`actions${centered ? " actions--centered" : ""}`}>{children}</div>;
}

export function FactGrid({ facts }: { facts: readonly { label: string; value: string }[] }) {
  return <dl className={`fact-grid fact-grid--${facts.length}`}>{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>;
}
