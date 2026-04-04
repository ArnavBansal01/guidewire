import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_BASES = [API_URL, "http://localhost:5000"].filter(Boolean);
const CLAIMS_BASE_PATHS = ["/api/admin/claims", "/api/claims"];

type ClaimRecord = {
  id: string;
  workerName?: string;
  platform?: string;
  location?: string;
  city?: string;
  triggerSource?: string;
  amount?: number;
  fraudRisk?: string;
  status?: string;
  confidenceScore?: number;
  createdAt?: string;
};

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const user = await new Promise<any>((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const timeout = setTimeout(() => resolve(null), 5000);
    const unsubscribe = auth.onAuthStateChanged((u) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(u);
    });
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!user) {
    return headers;
  }

  const token = await user.getIdToken(true);
  headers.Authorization = `Bearer ${token}`;
  return headers;
};

const callClaimsApi = async (
  method: "GET" | "PATCH",
  suffix: string,
  headers: Record<string, string>,
) => {
  let lastError: unknown = null;

  for (const base of API_BASES) {
    for (const claimsPath of CLAIMS_BASE_PATHS) {
      try {
        const response = await fetch(`${base}${claimsPath}${suffix}`, {
          method,
          headers,
        });
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json?.error || `Request failed: ${response.status}`);
        }

        return json;
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError || new Error("All claims API endpoints failed");
};

export const getClaims = async (): Promise<ClaimRecord[]> => {
  const headers = await getAuthHeader();
  const json = await callClaimsApi("GET", "", headers);

  return Array.isArray(json.data) ? json.data : [];
};

export const approveClaim = async (id: string): Promise<ClaimRecord> => {
  const headers = await getAuthHeader();
  const json = await callClaimsApi("PATCH", `/${id}/approve`, headers);

  return json.data as ClaimRecord;
};

export const rejectClaim = async (id: string): Promise<ClaimRecord> => {
  const headers = await getAuthHeader();
  const json = await callClaimsApi("PATCH", `/${id}/reject`, headers);

  return json.data as ClaimRecord;
};

export const createSimulatedClaim = async ({
  selectedCity,
  selectedDisruption,
  amount,
}: {
  selectedCity: string;
  selectedDisruption: string;
  amount: number;
}): Promise<void> => {
  await addDoc(collection(db, "claims"), {
    workerName: "Simulated Deployment",
    amount: amount,
    status: "PAID",
    triggerType: selectedDisruption,
    location: selectedCity,
    timeToPay: "58s",
    timestamp: serverTimestamp(),
  });
};
