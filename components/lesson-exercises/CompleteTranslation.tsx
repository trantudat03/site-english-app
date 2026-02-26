"use client";
type Props = {
    exercise: {
        type: string;
        mascot: string;
        hint: string;
        sentenceParts: string[];
        answer: string;
    };
}

export default function CompleteTranslation({ exercise }: Props) {
    const answerLength = exercise.answer?.length ?? 4;
    return (
        <div className="space-y-4 w-full max-w-3xl">
            <div className="text-2xl md:text-3xl font-bold tracking-wide">
                {exercise.type}
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                <img
                    src={exercise.mascot}
                    className="h-24 md:h-32 object-contain shrink-0"
                />
                <div className="relative flex-1 px-4 py-3 md:px-6 md:py-4
                    border-2 border-slate-500 rounded-xl bg-slate-900
                    text-base md:text-xl leading-relaxed">
                    {exercise.hint}
                    {/* bubble tail */}
                    <div className="absolute -left-3 top-6 w-4 h-4 bg-slate-900 border-l-2 border-b-2 border-slate-500 rotate-45" />
            </div>
                
            </div>
            {/* Sentence box */}
            <div className="p-6 border-2 border-slate-600 rounded-2xl
                bg-slate-900 text-lg md:text-xl
                flex flex-wrap items-center gap-3"
            >
                {exercise.sentenceParts.map((part, index) =>
                    part === "" ? (
                        <input
                            key={index}
                            style={{ width: `${answerLength + 1}ch` }}
                            className="px-2 py-2 text-center
                                bg-transparent outline-none
                                border-b-4 border-slate-500
                                focus:border-purple-400"
                        />
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </div>
        </div>
    )
}