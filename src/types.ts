/**
 * TypeScript definitions for Smarty
 */

export interface Subject {
  id: string;
  name: string;
  color: string;
  progress: number; // 0 to 100
  syllabus: string[];
  completedTopics: string[];
}

export type TimetableCategory = "study" | "school" | "homework" | "special";

export interface TimetableItem {
  id: string;
  title: string;
  day: string; // "Monday", "Tuesday", etc.
  startTime: string; // "14:00"
  endTime: string; // "15:30"
  category: TimetableCategory;
  subjectId?: string;
  isCompleted?: boolean;
}

export interface CharacterUpgrade {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  styleClass: string;
  description: string;
  accessoryEmoji: string;
  bgColor: string;
  skinColor: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
}

export interface StudyGoal {
  id: string;
  title: string;
  targetPoints: number;
  currentPoints: number;
  createdAt: string;
  targetDate: string;
}

export interface SessionHistory {
  id: string;
  subjectName: string;
  durationMinutes: number;
  pointsAwarded: number;
  date: string;
  endedQuickly: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}
