"use client";
import { useState } from "react";

type Item = {
  id: number;
  text: string;
  pairId: number;
};

type Props = {
  title: string;
  items: Item[];
};

export default function MatchPairs({ title, items }: Props) {
  const [selected, setSelected] = useState<number | null>(null); // lưu item đang được chọn
  const [matched, setMatched] = useState<number[]>([]); // lưu danh sách id đã ghép đúng
  const [wrong, setWrong] = useState<number[]>([]);// Lưu danh sách id đang ghép sai tạm thời

  const handleClick = (item: Item) => {
    if (matched.includes(item.id)) return;

    if (selected === null) {
      setSelected(item.id);
      return;
    }

    const first = items.find(i => i.id === selected);
    if (!first) return;

    // chọn cặp đúng
    if (first.pairId === item.pairId && first.id !== item.id) {
      setMatched(prev => [...prev, first.id, item.id]);
      setSelected(null);
      return;
    }

    // chọn cặp sai
    setWrong([first.id, item.id]);
    setTimeout(() => {
      setWrong([]);
    }, 1000);

    setSelected(null);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-2xl md:text-3xl font-bold tracking-wide">
        {title}
      </div>
      {/* Grid — chia 2 cột*/}
      <div className="grid grid-cols-2 gap-3 max-w-2xl">
        {items.map(item => {
          const isSelected = selected === item.id;
          const isMatched = matched.includes(item.id);
          const isWrong = wrong.includes(item.id);

          return (
            <button
              key={item.id}
              disabled={isMatched}
              onClick={() => handleClick(item)}
              className={`
                py-4 px-4 rounded-2xl border-2 text-base md:text-lg text-center
                transition-all duration-200

                ${isMatched
                  ? "border-green-400 bg-green-900/40 text-green-200 opacity-40"
                  : isWrong
                  ? "border-red-400 bg-red-900/40 text-red-200"
                  : isSelected
                  ? "border-purple-400 bg-purple-900/40"
                  : "border-slate-600 hover:border-purple-400 hover:bg-slate-800"
                }
              `}
            >
              {item.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}