import { hasEnvVars } from "@/lib/utils";
import { ClientHome } from "@/components/client-home";
import Navbar from "@/components/navbar";


export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar hasEnvVars={hasEnvVars} />
      <ClientHome hasEnvVars={!!hasEnvVars} />
    </div>
  );
}
