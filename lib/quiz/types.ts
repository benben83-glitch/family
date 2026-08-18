import type { Diet } from "@/lib/animals/types";

export type QuizTrip = { id: string; title: string; country: string };
export type QuizAnimal = { id: string; name: string; diet: Diet; habitat: string | null; continent: string | null };

export type QuizData = {
  trips: QuizTrip[];
  animals: QuizAnimal[];
  /** trip_id -> ids des cartes animaux découvertes pendant ce voyage */
  tripAnimalIds: Record<string, string[]>;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
};
