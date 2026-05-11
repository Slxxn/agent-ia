import { Suspense } from "react";
import PortalClient from "./PortalClient";

export function generateStaticParams() {
  return [{ token: "_" }];
}

export default function PortalPage() {
  return (
    <Suspense>
      <PortalClient />
    </Suspense>
  );
}
