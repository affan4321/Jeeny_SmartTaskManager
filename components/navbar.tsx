import Link from "next/link";
import Image from "next/image";
import Jeeny from "@/app/jeeny.png";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";


export default function Navbar({ hasEnvVars }: { hasEnvVars: string | undefined }) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 md:h-16 relative z-10">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm gap-2">
            <div className="">
                <Link 
                href={"/"} 
                className="flex flex-col md:flex-row gap-1 items-center font-semibold justify-center"
                >
                    <Image src={Jeeny} alt="Logo" className="mx-auto md:w-20 w-32" />
                    <div className="flex items-center gap-1">
                        <span className="text-xs md:text-base">Smart</span> <span className="text-Jeeny md:text-base text-xs font-extrabold">Task</span> <span className="text-xs md:text-base">Manager</span>
                    </div>
                </Link>
            </div>
        {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </div>
    </nav>
  );
}