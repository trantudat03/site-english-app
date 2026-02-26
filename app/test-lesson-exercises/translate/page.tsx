import ExerciseLayout from "@/components/lesson-exercises/ExerciseLayout";
import { dataWordBank } from "@/components/lesson-exercises/mock/dataWordBank";
import WordBankTranslation from "@/components/lesson-exercises/WordBankTranslation";

export default function Page() {
  const total = 100;
  const index = 10;
  const progress = (index / total) * 100;

  const exercise = dataWordBank;
  return (
    <ExerciseLayout progress={progress} hearts={1}>
        <WordBankTranslation exercise={exercise}/>
    </ExerciseLayout>
  );
}