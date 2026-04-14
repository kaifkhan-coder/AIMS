import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const SimpleList: React.FC = () => {
  const [items, setItems] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data: Todo[] = await res.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white shadow-2xl rounded-[2rem] p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            My Tasks
          </h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200/50 animate-pulse rounded-2xl border border-white/60" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 text-red-600 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-4 p-4 bg-white hover:bg-slate-50 transition-all duration-300 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${item.completed ? 'bg-emerald-400 shadow-emerald-200' : 'bg-amber-400 shadow-amber-200'}`} />
                <span className="text-slate-700 font-medium line-clamp-1 group-hover:text-slate-900 transition-colors">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SimpleList;