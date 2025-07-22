import Heading from "@/components/custom/heading";
import { ensureRole } from "@/lib/utils/check-role";
import { UserRole } from "@prisma/client";
import { RankApplicantsPageContent } from "@/components/rank-applicants/rank-applicants-page-content";

export default async function RankApplicantsPage() {
  await ensureRole(UserRole.COMPANY);

  return (
    <>
      <Heading title="AI Candidate Ranking" />
      <RankApplicantsPageContent />
    </>
  );
}
