import { hasEnvVars } from "@/lib/utils";
import { ClientHome } from "@/components/client-home";

export default function Home() {
  return (
    <div className="min-h-screen">
      <ClientHome hasEnvVars={!!hasEnvVars} />
    </div>
  );
}
