import ExerciseLayout from "@/components/lesson-exercises/ExerciseLayout";
import MatchPairs from "@/components/lesson-exercises/MatchPairs";
import { dataMatchPairs } from "@/components/lesson-exercises/mock/dataMatchPairs";


export default function Page() {
  const total = 100;
  const index = 10;
  const progress = (index / total) * 100;

  return (
    <ExerciseLayout progress={progress} hearts={1}>
      <MatchPairs 
        title={dataMatchPairs.title}
        items={dataMatchPairs.items}
      />
    </ExerciseLayout>
  );
}