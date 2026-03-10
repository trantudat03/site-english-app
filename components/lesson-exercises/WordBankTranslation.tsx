"use client";
import { useState } from "react";
type Props = {
    exercise: {
        type: string;
        mascot: string;
        hint: string;
        words: string[];
    };
};

export default function WordBankTranslation({ exercise }: Props) {
    const [selectedWords, setSelectedWords] = useState<string[]>([]);

    const handleAddWord = (word: string, index: number) => {
        setSelectedWords((prev) => [...prev, word]);
    };
    const handleRemoveWord = (index: number) => {
        setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    };
    const availableWords = exercise.words.filter(
        (word) => !selectedWords.includes(word)
    );
    return (
        <div className="w-full max-w-3xl space-y-6">
            {/* Title */}
            <div className="text-2xl md:text-3xl font-bold tracking-wide">
                {exercise.type}
            </div>
            {/* Mascot + bubble */}
            <div className="flex items-start gap-4 md:gap-6">
                <img
                    src={exercise.mascot}
                    className="h-24 md:h-32 object-contain shrink-0"
                />

                <div className="relative flex-1 px-4 py-3 md:px-6 md:py-4 border-2 border-slate-500 rounded-xl bg-slate-900
                    text-base md:text-xl leading-relaxed">

                    {exercise.hint}

                    {/* bubble tail */}
                    <div className="absolute -left-3 top-6 w-4 h-4 bg-slate-900 border-l-2 border-b-2 border-slate-500 rotate-45" />
                </div>
            </div>

            {/* Answer area */}
            <div className="min-h-[80px] p-4 border-2 border-slate-600 rounded-2xl bg-slate-900 flex flex-wrap gap-2">
       
                {selectedWords.map((word, index) => (
                    <button
                        key={index}
                        onClick={() => handleRemoveWord(index)}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 transition"
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* ================== Word Bank ================== */}
            <div className="flex flex-wrap justify-center gap-2">
                {availableWords.map((word, index) => (
                <button
                    key={index}
                    onClick={() => handleAddWord(word, index)}
                    className="px-4 py-2 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 active:scale-95 transition whitespace-nowrap"
                >
                    {word}
                </button>
                ))}
            </div>
        </div>
    );
}