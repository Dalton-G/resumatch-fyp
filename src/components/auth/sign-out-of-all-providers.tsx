import { signOutOfAllProviders } from "@/actions/auth";
import { Button } from "../ui/button";
import { CgLogOut } from "react-icons/cg";
import { toast } from "sonner";

export default function SignOutOfAllProvidersButton() {
  return (
    <form action={signOutOfAllProviders}>
      <Button
        type="submit"
        onClick={() => {
          toast.success("Signed out successfully");
        }}
        className="bg-[var(--r-gray)] font-dm-serif hover:bg-red-400 hover:text-white text-[var(--r-black)] shrink-0 cursor-pointer"
      >
        <CgLogOut />
      </Button>
    </form>
  );
}
