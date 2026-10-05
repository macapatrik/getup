import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";

/** Odkaz uvnitř webu get-up.fun. Stránky webu jsou ve složce /web a na doménu je mapuje proxy, proto typovaná cesta nesedí. */
export function WebLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  return <Link href={href as Route} {...props} />;
}
