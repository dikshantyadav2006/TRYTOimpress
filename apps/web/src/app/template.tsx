import { PageTransition } from "@repo/ui";

export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PageTransition>{children}</PageTransition>;
}
