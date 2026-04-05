import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

export type ClaimRecord = {
  id: string;
  workerName?: string;
  platform?: string;
  location?: string;
  city?: string;
  triggerSource?: string;
  triggerType?: string;
  amount?: number;
  fraudRisk?: string;
  status?: string;
  confidenceScore?: number;
  timestamp?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const CLAIMS_COLLECTION = "claims";

const mapClaimDoc = (docSnap: { id: string; data: () => DocumentData }) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    workerName: data.workerName || data.worker || "Unknown",
    platform: data.platform || "",
    location: data.location || data.city || "",
    city: data.city || data.location || "",
    triggerSource: data.triggerSource || data.triggerType || "Manual",
    triggerType: data.triggerType,
    amount: Number(data.amount) || 0,
    fraudRisk: (data.fraudRisk || "low").toString(),
    status: (data.status || "PENDING").toString(),
    confidenceScore: Number(data.confidenceScore) || 75,
    timestamp: data.timestamp,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as ClaimRecord;
};

const sortClaimsByTimeDesc = (claims: ClaimRecord[]) => {
  const toMillis = (value: unknown) => {
    if (!value) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    if (
      typeof value === "object" &&
      value !== null &&
      "toMillis" in value &&
      typeof (value as { toMillis: unknown }).toMillis === "function"
    ) {
      return (value as { toMillis: () => number }).toMillis();
    }
    if (
      typeof value === "object" &&
      value !== null &&
      "seconds" in value &&
      typeof (value as { seconds: unknown }).seconds === "number"
    ) {
      return (value as { seconds: number }).seconds * 1000;
    }
    return 0;
  };

  return [...claims].sort((a, b) => {
    const aTime = Math.max(toMillis(a.timestamp), toMillis(a.createdAt));
    const bTime = Math.max(toMillis(b.timestamp), toMillis(b.createdAt));
    return bTime - aTime;
  });
};

export const getClaims = async (): Promise<ClaimRecord[]> => {
  const snapshot = await getDocs(collection(db, CLAIMS_COLLECTION));
  return sortClaimsByTimeDesc(snapshot.docs.map(mapClaimDoc));
};

export const subscribeClaimsRealtime = (
  onData: (claims: ClaimRecord[]) => void,
  onError?: (error: unknown) => void,
) => {
  return onSnapshot(
    collection(db, CLAIMS_COLLECTION),
    (snapshot: QuerySnapshot<DocumentData>) => {
      onData(sortClaimsByTimeDesc(snapshot.docs.map(mapClaimDoc)));
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
};

export const approveClaim = async (id: string): Promise<ClaimRecord> => {
  const claimRef = doc(db, CLAIMS_COLLECTION, id);
  await updateDoc(claimRef, {
    status: "APPROVED",
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    status: "APPROVED",
  };
};

export const rejectClaim = async (id: string): Promise<ClaimRecord> => {
  const claimRef = doc(db, CLAIMS_COLLECTION, id);
  await updateDoc(claimRef, {
    status: "REJECTED",
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    status: "REJECTED",
  };
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
  await addDoc(collection(db, CLAIMS_COLLECTION), {
    workerName: "Simulated Deployment",
    amount,
    status: "PENDING",
    confidenceScore: 80,
    fraudRisk: "medium",
    triggerType: selectedDisruption,
    triggerSource: selectedDisruption,
    location: selectedCity,
    timeToPay: "58s",
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
