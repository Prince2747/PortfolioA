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

export type Project = {
  id: string;
  title: string;
  badge: string;
  summary: string;
  tags: string[];
  images: string[];
};

type ProjectCreateInput = Omit<Project, "id">;

const COLLECTION = "projects";

function normalizeProject(data: DocumentData, id: string): Project {
  return {
    id,
    title: String(data.title ?? ""),
    badge: String(data.badge ?? ""),
    summary: String(data.summary ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    images: Array.isArray(data.images) ? data.images.map(String) : [],
  };
}

export async function fetchProjects(): Promise<Project[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeProject(d.data(), d.id));
}

export async function createProject(input: ProjectCreateInput): Promise<string> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase not configured");

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProject(
  id: string,
  input: ProjectCreateInput
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase not configured");

  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function removeProject(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase not configured");
  await deleteDoc(doc(db, COLLECTION, id));
}
