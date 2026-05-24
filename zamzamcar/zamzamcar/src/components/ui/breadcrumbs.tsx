import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

/**
 * Breadcrumb navigation with Schema.org microdata.
 *
 * The last item should NOT have an href (it's the current page).
 * Google reads the BreadcrumbList microdata and may show breadcrumbs in
 * search results instead of the raw URL — much friendlier.
 *
 * Example:
 *   <Breadcrumbs items={[
 *     { label: "Inventory", href: "/inventory" },
 *     { label: "2014 Toyota Avalon" },
 *   ]} />
 */
export function Breadcrumbs({ items }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs text-slate-500"
    >
      <ol
        className="flex items-center gap-1.5 flex-wrap"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          className="flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <meta itemProp="position" content="1" />
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
            itemProp="item"
          >
            <Home className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
            <span itemProp="name">Home</span>
          </Link>
        </li>

        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={`${crumb.label}-${i}`}
              className="flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(i + 2)} />
              <ChevronRight className="w-3 h-3 text-slate-300" strokeWidth={2.5} aria-hidden="true" />
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="hover:text-slate-900 transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : (
                <span
                  className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none"
                  itemProp="name"
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
