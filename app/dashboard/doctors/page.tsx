import { redirect } from "next/navigation";

export default async function DoctorsRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") params.set(k, v);
  }
  const qs = params.toString();
  redirect(qs ? `/doctors?${qs}` : "/doctors");
}
