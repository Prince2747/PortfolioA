import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  date?: string;
  url?: string;
  image?: string;
};

export type CertificationCreateInput = Omit<Certification, "id">;

const COLLECTION = "certifications";

function normalizeCertification(data: DocumentData, id: string): Certification {
  return {
    id,
    title: String(data.title ?? ""),
    issuer: String(data.issuer ?? ""),
    date: data.date ? String(data.date) : undefined,
    url: data.url ? String(data.url) : undefined,
    image: data.image ? String(data.image) : undefined,
  };
}

export async function fetchCertifications(): Promise<Certification[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeCertification(d.data(), d.id));
}

export async function createCertification(
  input: CertificationCreateInput
): Promise<string> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase not configured");

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCertification(
  id: string,
  input: CertificationCreateInput
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase not configured");

  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function removeCertification(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase not configured");
  await deleteDoc(doc(db, COLLECTION, id));
}
