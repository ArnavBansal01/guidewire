import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

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
