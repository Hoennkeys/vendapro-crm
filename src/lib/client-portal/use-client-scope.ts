import { useAuth } from "@/lib/auth/auth-store";
import { useTenant } from "@/lib/tenant/tenant-store";

export function useClientScope() {
  const { session } = useAuth();
  const { whiteLabel } = useTenant();

  const clientId = session?.user.clientId;
  const tenantId = session?.user.tenantId ?? whiteLabel.tenantId;

  if (!clientId) {
    throw new Error("useClientScope requer sessão de cliente com clientId.");
  }

  return { clientId, tenantId };
}
