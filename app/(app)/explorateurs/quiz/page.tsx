import { getQuizData } from "@/lib/quiz/data";
import { QuizPlayer } from "./quiz-player";

export default async function QuizPage() {
  const data = await getQuizData();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl text-primary">Quiz</h1>
        <p className="text-muted text-sm mt-1">Sur nos voyages, les animaux découverts et les pays visités.</p>
      </div>

      <QuizPlayer data={data} />
    </div>
  );
}
