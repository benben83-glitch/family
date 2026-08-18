import { DIET_OPTIONS, dietOption } from "@/lib/animals/types";
import type { QuizData, QuizQuestion } from "./types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestion(id: string, prompt: string, correct: string, distractorPool: string[]): QuizQuestion | null {
  const distractors = shuffle([...new Set(distractorPool.filter((value) => value !== correct))]).slice(0, 3);
  if (distractors.length === 0) return null;

  const choices = shuffle([correct, ...distractors]);
  return { id, prompt, choices, correctIndex: choices.indexOf(correct) };
}

export function generateQuizQuestions(data: QuizData, count: number): QuizQuestion[] {
  const pool: QuizQuestion[] = [];

  // Quel animal avons-nous découvert pendant ce voyage ?
  for (const trip of data.trips) {
    const animalIds = data.tripAnimalIds[trip.id] ?? [];
    if (animalIds.length === 0) continue;
    const tripAnimals = data.animals.filter((a) => animalIds.includes(a.id));
    if (tripAnimals.length === 0) continue;
    const correctAnimal = tripAnimals[Math.floor(Math.random() * tripAnimals.length)];
    const otherNames = data.animals.filter((a) => !animalIds.includes(a.id)).map((a) => a.name);
    const question = buildQuestion(
      `trip-animal-${trip.id}`,
      `Quel animal avons-nous découvert pendant le voyage « ${trip.title} » ?`,
      correctAnimal.name,
      otherNames
    );
    if (question) pool.push(question);
  }

  // Quel est le régime alimentaire de cet animal ?
  for (const animal of data.animals) {
    const correctLabel = dietOption(animal.diet).label;
    const otherLabels = DIET_OPTIONS.filter((option) => option.value !== animal.diet).map((option) => option.label);
    const question = buildQuestion(`diet-${animal.id}`, `Quel est le régime alimentaire de « ${animal.name} » ?`, correctLabel, otherLabels);
    if (question) pool.push(question);
  }

  // Dans quel pays avons-nous vu cet animal ?
  for (const animal of data.animals) {
    const tripsWithAnimal = data.trips.filter((trip) => (data.tripAnimalIds[trip.id] ?? []).includes(animal.id));
    if (tripsWithAnimal.length === 0) continue;
    const correctTrip = tripsWithAnimal[Math.floor(Math.random() * tripsWithAnimal.length)];
    const otherCountries = data.trips.filter((trip) => trip.country !== correctTrip.country).map((trip) => trip.country);
    const question = buildQuestion(`animal-country-${animal.id}`, `Dans quel pays avons-nous vu « ${animal.name} » ?`, correctTrip.country, otherCountries);
    if (question) pool.push(question);
  }

  // Dans quel pays s'est déroulé ce voyage ?
  for (const trip of data.trips) {
    const otherCountries = data.trips.filter((t) => t.id !== trip.id).map((t) => t.country);
    const question = buildQuestion(`trip-country-${trip.id}`, `Dans quel pays s'est déroulé le voyage « ${trip.title} » ?`, trip.country, otherCountries);
    if (question) pool.push(question);
  }

  // Qui suis-je ? (indices habitat/régime/continent)
  for (const animal of data.animals) {
    const clues = [
      dietOption(animal.diet) && `Je suis ${dietOption(animal.diet).label.toLowerCase()}.`,
      animal.habitat && `Mon habitat est ${animal.habitat.toLowerCase()}.`,
      animal.continent && `On me trouve en/au ${animal.continent}.`,
    ].filter(Boolean);
    if (clues.length < 2) continue;
    const otherNames = data.animals.filter((a) => a.id !== animal.id).map((a) => a.name);
    const question = buildQuestion(`who-am-i-${animal.id}`, `Qui suis-je ?\n${clues.join(" ")}`, animal.name, otherNames);
    if (question) pool.push(question);
  }

  return shuffle(pool).slice(0, count);
}
