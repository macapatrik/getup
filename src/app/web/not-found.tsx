import { Icon } from "@/components/icons";
import { WebLink } from "./link";
import { btnGhost, btnWhite } from "./ui";

export default function WebNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 pt-20 text-center">
      <p className="font-party text-[96px] leading-none text-white/20">404</p>
      <p className="font-party mt-2 text-[36px] leading-none text-white uppercase">Tahle stránka tu není</p>
      <p className="mt-3 text-[15px] text-white/60">Odkaz je starý, nebo v něm chybí písmeno. Akce najdeš v programu.</p>
      <div className="mt-6 flex gap-3">
        <WebLink href="/" className={btnWhite}>
          Domů
        </WebLink>
        <WebLink href="/akce" className={btnGhost}>
          Akce <Icon name="chevron" className="size-4" />
        </WebLink>
      </div>
    </div>
  );
}
