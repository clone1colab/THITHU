import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { Question, CandidateSubmission, SystemSettings } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId if specified
export const db = getFirestore(app);

// Collection helper references
export const questionsCol = collection(db, 'questions') as CollectionReference<Question>;
export const submissionsCol = collection(db, 'submissions') as CollectionReference<CandidateSubmission>;
export const settingsDoc = doc(db, 'settings', 'global') as DocumentReference<{
  isScoresPublic: boolean;
  systemSettings: SystemSettings;
}>;

/**
 * Persist or update a single question in Firestore
 */
export async function syncSaveQuestion(question: Question) {
  const qDocRef = doc(db, 'questions', question.id);
  await setDoc(qDocRef, question);
}

/**
 * Remove a single question from Firestore
 */
export async function syncDeleteQuestion(id: string) {
  const qDocRef = doc(db, 'questions', id);
  await deleteDoc(qDocRef);
}

/**
 * Save candidate submission to Firestore
 */
export async function syncAddSubmission(submission: CandidateSubmission) {
  const subDocRef = doc(db, 'submissions', submission.id);
  await setDoc(subDocRef, submission);
}

/**
 * Clear all submissions from Firestore
 */
export async function syncClearSubmissions() {
  const snapshot = await getDocs(submissionsCol);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  await batch.commit();
}

/**
 * Clear all questions from Firestore
 */
export async function syncClearQuestions() {
  const snapshot = await getDocs(questionsCol);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  await batch.commit();
}

/**
 * Initialize default questions in Firestore if empty
 */
export async function syncSeedQuestions(questions: Question[]) {
  const batch = writeBatch(db);
  questions.forEach((q) => {
    const qDocRef = doc(db, 'questions', q.id);
    batch.set(qDocRef, q);
  });
  await batch.commit();
}

/**
 * Initialize default submissions in Firestore if empty
 */
export async function syncSeedSubmissions(submissions: CandidateSubmission[]) {
  const batch = writeBatch(db);
  submissions.forEach((sub) => {
    const sDocRef = doc(db, 'submissions', sub.id);
    batch.set(sDocRef, sub);
  });
  await batch.commit();
}

/**
 * Update global system settings and public score release flag in Firestore
 */
export async function syncUpdateSettings(isScoresPublic: boolean, systemSettings: SystemSettings) {
  await setDoc(settingsDoc, {
    isScoresPublic,
    systemSettings
  }, { merge: true });
}
