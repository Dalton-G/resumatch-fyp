import { redirectToHomePage } from "@/lib/utils/check-role";

export default async function RedirectPage() {
  await redirectToHomePage();
}
