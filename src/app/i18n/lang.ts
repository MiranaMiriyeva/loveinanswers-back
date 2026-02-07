import { cookies } from "next/headers";
import type { Lang } from "./dictionaries";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const c = store.get("lang")?.value as Lang | undefined;
  return c === "az" || c === "en" || c === "ru" ? c : "az";
}
