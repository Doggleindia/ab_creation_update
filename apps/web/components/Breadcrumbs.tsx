"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  customSegments?: BreadcrumbSegment[];
  className?: string;
  transparent?: boolean;
  isDashboard?: boolean;
}

// Map path segments to friendly readable names
const segmentMap: Record<string, string> = {
  "product-collection": "Products",
  "product": "Product Details",
  "bulk-products": "Bulk Products",
  "dashboard": "Dashboard",
  "profile": "My Profile",
  "orders": "Order History",
  "wallet": "Wallet",
  "tickets": "Tickets",
  "wishlist": "Wishlist",
  "add-to-cart": "Cart",
  "default": "Default",
  "service": "Services",
  "contact-us": "Contact Us",
  "look-book": "Lookbook",
};

export default function Breadcrumbs({ customSegments, className, transparent, isDashboard }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If customSegments are provided, use them. Otherwise, generate automatically.
  let segments: BreadcrumbSegment[] = [];

  if (customSegments) {
    segments = customSegments;
  } else {
    // Generate breadcrumbs from pathname
    let pathParts = pathname.split("/").filter((part) => part);
    
    if (isDashboard && pathParts[0]?.toLowerCase() === "dashboard") {
      // Remove dashboard segment for header display
      pathParts = pathParts.slice(1);
      if (pathParts.length === 0) {
        pathParts = ["default"];
      }
    }
    
    // Build path recursively
    let currentPath = isDashboard ? "/dashboard" : "";
    segments = pathParts.map((part, index) => {
      if (part !== "default") {
        currentPath += `/${part}`;
      }
      
      // Look up pretty label, fallback to capitalized segment name
      let label = segmentMap[part.toLowerCase()] || part;
      
      // Clean up hex/id patterns
      if (/^[0-9a-fA-F]{24}$/.test(part)) {
        label = "Details";
      } else if (label.includes("-") || label.includes("_")) {
        label = label
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
      } else if (label !== segmentMap[part.toLowerCase()]) {
        // Capitalize default fallback
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }

      // If it's the last segment, it shouldn't link
      const isLast = index === pathParts.length - 1;

      return {
        label,
        href: isLast ? undefined : currentPath,
      };
    });
  }

  // Prepend the root segment
  const breadcrumbList: BreadcrumbSegment[] = isDashboard
    ? [
        { label: "Dashboards", href: "/dashboard" },
        ...segments,
      ]
    : [
        { label: "Home", href: "/" },
        ...segments,
      ];

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={className || `w-full py-4 px-4 sm:px-6 ${transparent ? 'bg-transparent border-0 py-0 px-0' : 'bg-[#F5F1EA]/40 border-b border-[#E8E6E3] backdrop-blur-sm'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-1.5 text-xs sm:text-sm font-medium text-neutral-500">
        {breadcrumbList.map((item, index) => {
          const isLast = index === breadcrumbList.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 shrink-0 select-none" />
              )}
              <div className="flex items-center">
                {index === 0 && !isDashboard && (
                  <Home className="h-3.5 w-3.5 mr-1 text-neutral-400 shrink-0" />
                )}
                {isLast || !item.href ? (
                  <span className="text-[#B87D4C] font-semibold truncate max-w-[150px] sm:max-w-[250px]">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-[#B87D4C] hover:underline transition-all duration-200 truncate max-w-[150px] sm:max-w-[200px]"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
