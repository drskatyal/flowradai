import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks";
import { useStore } from "@/stores/use-store";
import { MenuIcon, Share2, ShoppingBag, NotepadTextDashed, History } from "lucide-react";
import { useRouter } from "next/navigation";
import Instructions from "../home/instructions";
import { useSidebar } from "@/providers/sidebar-provider";

const Navigation = () => {
  const user = useStore((state) => state.user);
  const { toast } = useToast();
  const referralCode = user?.referralCode || "";

  const { isSidebar } = useSidebar();

  const router = useRouter();

  const handleCopy = async (text: string) => {
    if (!referralCode || referralCode.trim() === "") {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied Successfully!",
        description:
          "Referral link has been copied to clipboard. Share it with your friends!",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm hover:bg-surface-primary gap-2"
        >
          <MenuIcon className="h-4 w-4" />
          {isSidebar && <span>Menu</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        forceMount
        side="top"
        className="xl:min-w-[16rem]"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Instructions variant="sidebar" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleCopy(referralCode)}
          >
            <Share2 className="h-4 w-4" />
            <span>Refer and earn: {referralCode}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              router.push("/pricing");
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Purchase report credits</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              router.push("/template");
            }}
          >
            <NotepadTextDashed className="h-4 w-4" />
            <span>Templates</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Navigation;
