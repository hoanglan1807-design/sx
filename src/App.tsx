import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipForward, RotateCcw, Info, BarChart3, Code2, 
  ChevronRight, ArrowLeft, Layers, Zap, 
  ArrowDownUp, ListOrdered, MoveRight, LayoutGrid, Activity
} from 'lucide-react';

// --- Types & Constants ---

type AlgorithmType = 'selection' | 'insertion' | 'interchange' | 'bubble' | 'quick' | 'merge';

type VisualElement = {
  id: number;
  value: number;
  isSorted: boolean;
};

type Step = {
  array: (VisualElement | null)[];
  // For Merge Sort specifically
  sourceRow?: (VisualElement | null)[];
  row1?: (VisualElement | null)[];
  row2?: (VisualElement | null)[];
  resultRow?: (VisualElement | null)[];
  k?: number;
  phase?: string;
  // Common
  description: string;
  stepNumber: number;
  line: number;
  comparisons: number;
  swaps?: number;
  merges?: number;
  isSwap?: boolean;
  pivotIdx?: number;
  minIdx?: number;
  keyIdx?: number;
  activeIndices: { row: 'main' | 'source' | 'row1' | 'row2' | 'result', idx: number }[];
};

const INITIAL_ARRAY = [12, 2, 8, 5, 1, 6, 4, 15];

const ALGORITHMS = [
  {
    id: 'selection' as AlgorithmType,
    name: 'Sắp xếp Chọn',
    englishName: 'Selection Sort',
    description: 'Tìm phần tử nhỏ nhất trong dãy chưa sắp xếp và đưa về đầu dãy.',
    complexity: 'O(n²)',
    space: 'O(1)',
    icon: <ListOrdered className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'insertion' as AlgorithmType,
    name: 'Sắp xếp Chèn',
    englishName: 'Insertion Sort',
    description: 'Xây dựng dãy đã sắp xếp bằng cách chèn từng phần tử vào đúng vị trí.',
    complexity: 'O(n²)',
    space: 'O(1)',
    icon: <Layers className="w-6 h-6" />,
    color: 'bg-indigo-500'
  },
  {
    id: 'interchange' as AlgorithmType,
    name: 'Đổi chỗ trực tiếp',
    englishName: 'Interchange Sort',
    description: 'So sánh phần tử đang xét với tất cả phần tử phía sau, đổi chỗ nếu sai thứ tự.',
    complexity: 'O(n²)',
    space: 'O(1)',
    icon: <ArrowDownUp className="w-6 h-6" />,
    color: 'bg-cyan-500'
  },
  {
    id: 'bubble' as AlgorithmType,
    name: 'Sắp xếp Nổi bọt',
    englishName: 'Bubble Sort',
    description: 'Đưa phần tử nhỏ nhất "nổi" dần từ cuối dãy về phía đầu dãy bằng cách so sánh các cặp kề nhau.',
    complexity: 'O(n²)',
    space: 'O(1)',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-amber-500'
  },
  {
    id: 'quick' as AlgorithmType,
    name: 'Sắp xếp Nhanh',
    englishName: 'Quick Sort',
    description: 'Chọn một phần tử chốt (pivot) và phân hoạch mảng thành hai phần.',
    complexity: 'O(n log n)',
    space: 'O(log n)',
    icon: <MoveRight className="w-6 h-6" />,
    color: 'bg-rose-500'
  },
  {
    id: 'merge' as AlgorithmType,
    name: 'Sắp xếp Trộn',
    englishName: 'Merge Sort',
    description: 'Chia mảng thành các phần nhỏ, sắp xếp rồi trộn lại với nhau.',
    complexity: 'O(n log n)',
    space: 'O(n)',
    icon: <LayoutGrid className="w-6 h-6" />,
    color: 'bg-emerald-500'
  }
];

// --- Components ---

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | AlgorithmType>('home');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <Home onSelect={(id) => setCurrentView(id)} />
        ) : (
          <Visualizer 
            type={currentView as AlgorithmType} 
            onBack={() => setCurrentView('home')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Home({ onSelect }: { onSelect: (id: AlgorithmType) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto p-6 md:p-12"
    >
      <header className="mb-12 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-6"
        >
          <BarChart3 className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
          Học Thuật Toán Sắp Xếp
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Khám phá và trực quan hóa các thuật toán sắp xếp phổ biến nhất với giao diện hiện đại và sinh động.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALGORITHMS.map((algo, idx) => (
          <motion.button
            key={algo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(algo.id)}
            className="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left transition-all hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${algo.color} opacity-[0.03] -mr-8 -mt-8 rounded-full group-hover:opacity-[0.05] transition-opacity`} />
            
            <div className={`w-12 h-12 ${algo.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20`}>
              {algo.icon}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              {algo.name}
            </h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
              {algo.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex gap-3">
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                  {algo.complexity}
                </span>
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                  {algo.space}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>

      <footer className="mt-20 text-center text-slate-400 text-sm">
        <p>© 2026 Sorting Visualizer • Thiết kế bởi AI Studio</p>
      </footer>
    </motion.div>
  );
}

function Visualizer({ type, onBack }: { type: AlgorithmType, onBack: () => void }) {
  const algo = ALGORITHMS.find(a => a.id === type)!;
  const [array, setArray] = useState<(VisualElement | null)[]>(
    INITIAL_ARRAY.map((val, idx) => ({ id: idx, value: val, isSorted: false }))
  );
  const [customInput, setCustomInput] = useState(INITIAL_ARRAY.join(', '));
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(4200);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateSteps = useCallback((inputArr: (VisualElement | null)[]) => {
    const allSteps: Step[] = [];
    const n = inputArr.length;
    let comparisons = 0;
    let swaps = 0;
    let merges = 0;

    const addStep = (
      currentArr: (VisualElement | null)[],
      description: string,
      line: number,
      activeIndices: { row: 'main' | 'source' | 'row1' | 'row2' | 'result', idx: number }[] = [],
      isSwap: boolean = false,
      extra?: Partial<Step>
    ) => {
      allSteps.push({
        array: [...currentArr.map(e => e ? { ...e } : null)],
        description,
        stepNumber: allSteps.length,
        line,
        comparisons,
        swaps,
        merges,
        activeIndices,
        isSwap,
        ...extra
      });
    };

    const current = [...inputArr.map(e => e ? { ...e } : null)];

    if (type === 'selection') {
      addStep(current, "Bắt đầu sắp xếp chọn.", 0);
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        addStep(current, `Giả sử phần tử nhỏ nhất là tại vị trí ${i} (giá trị ${current[i]?.value}).`, 1, [{ row: 'main', idx: i }], false, { minIdx: i });
        for (let j = i + 1; j < n; j++) {
          comparisons++;
          addStep(current, `So sánh với phần tử tại vị trí ${j} (giá trị ${current[j]?.value}).`, 2, [{ row: 'main', idx: minIdx }, { row: 'main', idx: j }], false, { minIdx });
          if (current[j]!.value < current[minIdx]!.value) {
            minIdx = j;
            addStep(current, `Tìm thấy phần tử nhỏ hơn mới tại vị trí ${minIdx}.`, 3, [{ row: 'main', idx: minIdx }], false, { minIdx });
          }
        }
        if (minIdx !== i) {
          swaps++;
          const temp = current[i];
          current[i] = current[minIdx];
          current[minIdx] = temp;
          addStep(current, `Đổi chỗ ${current[i]?.value} và ${current[minIdx]?.value}.`, 4, [{ row: 'main', idx: i }, { row: 'main', idx: minIdx }], true, { minIdx });
        }
        current[i]!.isSorted = true;
        addStep(current, `Phần tử tại vị trí ${i} đã ở đúng vị trí.`, 5);
      }
      current[n - 1]!.isSorted = true;
      addStep(current, `Sắp xếp hoàn tất! Tổng số so sánh: ${comparisons}, Hoán vị: ${swaps}.`, 0);
    } 
    else if (type === 'insertion') {
      addStep(current, "Bắt đầu sắp xếp chèn.", 0);
      current[0]!.isSorted = true;
      for (let i = 1; i < n; i++) {
        addStep(current, `Chọn phần tử ${current[i]?.value} tại vị trí ${i} làm khóa (Key).`, 1, [{ row: 'main', idx: i }], false, { keyIdx: i });
        let j = i;
        while (j > 0 && current[j-1]!.value > current[j]!.value) {
          comparisons++;
          swaps++;
          const temp = current[j];
          current[j] = current[j-1];
          current[j-1] = temp;
          addStep(current, `Vì ${current[j-1]?.value} < ${current[j]?.value}, đổi chỗ chúng để đưa Key về phía trước.`, 2, [{ row: 'main', idx: j-1 }, { row: 'main', idx: j }], true, { keyIdx: j-1 });
          j--;
        }
        if (j > 0) comparisons++; // Final comparison that fails to entry while
        
        current[j]!.isSorted = true;
        addStep(current, `Khóa ${current[j]?.value} đã được chèn vào đúng vị trí trong dãy con đã sắp xếp.`, 3, [{ row: 'main', idx: j }], false, { keyIdx: j });
        
        // Mark all up to i as sorted visually
        for(let k=0; k<=i; k++) if(current[k]) current[k]!.isSorted = true;
      }
      addStep(current, `Sắp xếp hoàn tất! Tổng số so sánh: ${comparisons}, Thao tác hoán đổi: ${swaps}.`, 0);
    }
    else if (type === 'interchange') {
      addStep(current, "Bắt đầu sắp xếp đổi chỗ trực tiếp.", 0);
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
          comparisons++;
          addStep(current, `So sánh ${current[i]?.value} và ${current[j]?.value}.`, 1, [{ row: 'main', idx: i }, { row: 'main', idx: j }]);
          if (current[i]!.value > current[j]!.value) {
            swaps++;
            const temp = current[i];
            current[i] = current[j];
            current[j] = temp;
            addStep(current, `Vì ${current[j]?.value} < ${current[i]?.value}, đổi chỗ chúng.`, 2, [{ row: 'main', idx: i }, { row: 'main', idx: j }], true);
          }
        }
        current[i]!.isSorted = true;
        addStep(current, `Phần tử tại vị trí ${i} đã ở đúng vị trí.`, 3);
      }
      current[n - 1]!.isSorted = true;
      addStep(current, `Sắp xếp hoàn tất! Tổng số so sánh: ${comparisons}, Hoán vị: ${swaps}.`, 0);
    }
    else if (type === 'bubble') {
      addStep(current, "Bắt đầu sắp xếp nổi bọt (đưa phần tử nhỏ nhất về đầu).", 0);
      for (let i = 0; i < n - 1; i++) {
        for (let j = n - 1; j > i; j--) {
          comparisons++;
          addStep(current, `So sánh cặp kề nhau ${current[j-1]?.value} và ${current[j]?.value}.`, 1, [{ row: 'main', idx: j - 1 }, { row: 'main', idx: j }]);
          if (current[j]!.value < current[j - 1]!.value) {
            swaps++;
            const temp = current[j];
            current[j] = current[j - 1];
            current[j - 1] = temp;
            addStep(current, `Đổi chỗ vì ${current[j]?.value} < ${current[j-1]?.value}.`, 2, [{ row: 'main', idx: j - 1 }, { row: 'main', idx: j }], true);
          }
        }
        current[i]!.isSorted = true;
        addStep(current, `Phần tử nhỏ nhất đã nổi về vị trí ${i}.`, 3);
      }
      current[n - 1]!.isSorted = true;
      addStep(current, `Sắp xếp hoàn tất! Tổng số so sánh: ${comparisons}, Hoán vị: ${swaps}.`, 0);
    }
    else if (type === 'quick') {
      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pivot = current[high]!.value;
          addStep(current, `Chọn chốt (pivot) là ${pivot} tại vị trí ${high}.`, 1, [{ row: 'main', idx: high }], false, { pivotIdx: high });
          
          let i = low - 1;
          for (let j = low; j < high; j++) {
            comparisons++;
            addStep(current, `So sánh ${current[j]?.value} với chốt ${pivot}.`, 2, [{ row: 'main', idx: j }, { row: 'main', idx: high }], false, { pivotIdx: high });
            if (current[j]!.value < pivot) {
              i++;
              swaps++;
              const temp = current[i];
              current[i] = current[j];
              current[j] = temp;
              addStep(current, `Đổi chỗ ${current[i]?.value} và ${current[j]?.value}.`, 3, [{ row: 'main', idx: i }, { row: 'main', idx: j }], true, { pivotIdx: high });
            }
          }
          swaps++;
          const temp = current[i + 1];
          current[i + 1] = current[high];
          current[high] = temp;
          const pi = i + 1;
          current[pi]!.isSorted = true;
          addStep(current, `Đưa chốt về đúng vị trí ${pi}.`, 4, [{ row: 'main', idx: pi }], true, { pivotIdx: pi });
          
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low === high && current[low]) {
          current[low]!.isSorted = true;
        }
      };
      addStep(current, "Bắt đầu sắp xếp nhanh.", 0);
      quickSort(0, n - 1);
      // Ensure all are marked sorted at the end
      current.forEach(item => { if(item) item.isSorted = true; });
      addStep(current, `Sắp xếp hoàn tất! Tổng số so sánh: ${comparisons}, Hoán vị: ${swaps}.`, 0);
    }
    else if (type === 'merge') {
      let currentSource = [...current.map(e => e ? { ...e } : null)];
      let currentRow1 = new Array(n).fill(null);
      let currentRow2 = new Array(n).fill(null);
      let currentResult = new Array(n).fill(null);
      
      const addMergeStep = (desc: string, line: number, k: number, phase: string, active: { row: 'source' | 'row1' | 'row2' | 'result', idx: number }[] = []) => {
        allSteps.push({
          array: [], 
          sourceRow: [...currentSource.map(e => e ? { ...e } : null)],
          row1: [...currentRow1.map(e => e ? { ...e } : null)],
          row2: [...currentRow2.map(e => e ? { ...e } : null)],
          resultRow: [...currentResult.map(e => e ? { ...e } : null)],
          k,
          phase,
          description: desc,
          stepNumber: allSteps.length,
          line,
          comparisons,
          merges,
          activeIndices: active,
        });
      };

      addMergeStep("Bắt đầu sắp xếp trộn.", 0, 0, "Khởi tạo");
      let k = 1;
      while (k < n) {
        addMergeStep(`Phân phối các đoạn độ dài k = ${k}.`, 1, k, "Phân phối");
        for (let i = 0; i < n; i += 2 * k) {
          for (let j = i; j < Math.min(i + k, n); j++) {
            currentRow1[j] = currentSource[j];
            currentSource[j] = null;
            addMergeStep(`Chuyển ${currentRow1[j]?.value} vào dãy phụ 1.`, 2, k, "Phân phối", [{ row: 'row1', idx: j }]);
          }
          for (let j = i + k; j < Math.min(i + 2 * k, n); j++) {
            currentRow2[j] = currentSource[j];
            currentSource[j] = null;
            addMergeStep(`Chuyển ${currentRow2[j]?.value} vào dãy phụ 2.`, 3, k, "Phân phối", [{ row: 'row2', idx: j }]);
          }
        }

        addMergeStep(`Trộn các đoạn độ dài k = ${k}.`, 4, k, "Trộn");
        for (let i = 0; i < n; i += 2 * k) {
          let left = i, leftEnd = Math.min(i + k, n);
          let right = i + k, rightEnd = Math.min(i + 2 * k, n);
          let resIdx = i;

          while (left < leftEnd && right < rightEnd) {
            comparisons++;
            addMergeStep(`So sánh ${currentRow1[left]?.value} và ${currentRow2[right]?.value}.`, 5, k, "Trộn", [{ row: 'row1', idx: left }, { row: 'row2', idx: right }]);
            if (currentRow1[left]!.value <= currentRow2[right]!.value) {
              currentResult[resIdx] = { ...currentRow1[left]!, isSorted: k * 2 >= n };
              currentRow1[left] = null;
              addMergeStep(`Đưa ${currentResult[resIdx]?.value} vào kết quả.`, 6, k, "Trộn", [{ row: 'result', idx: resIdx }]);
              left++;
            } else {
              currentResult[resIdx] = { ...currentRow2[right]!, isSorted: k * 2 >= n };
              currentRow2[right] = null;
              addMergeStep(`Đưa ${currentResult[resIdx]?.value} vào kết quả.`, 6, k, "Trộn", [{ row: 'result', idx: resIdx }]);
              right++;
            }
            resIdx++;
          }
          while (left < leftEnd) {
            currentResult[resIdx] = { ...currentRow1[left]!, isSorted: k * 2 >= n };
            currentRow1[left] = null;
            addMergeStep(`Đưa phần tử còn lại vào kết quả.`, 7, k, "Trộn", [{ row: 'result', idx: resIdx }]);
            left++; resIdx++;
          }
          while (right < rightEnd) {
            currentResult[resIdx] = { ...currentRow2[right]!, isSorted: k * 2 >= n };
            currentRow2[right] = null;
            addMergeStep(`Đưa phần tử còn lại vào kết quả.`, 7, k, "Trộn", [{ row: 'result', idx: resIdx }]);
            right++; resIdx++;
          }
        }
        merges++;
        addMergeStep(`Hoàn tất lượt trộn k = ${k}.`, 8, k, "Xong lượt");
        currentSource = [...currentResult.map(e => e ? { ...e } : null)];
        currentResult = new Array(n).fill(null);
        currentRow1 = new Array(n).fill(null);
        currentRow2 = new Array(n).fill(null);
        k *= 2;
      }
      // Ensure all are marked sorted
      currentSource.forEach(item => { if(item) item.isSorted = true; });
      addMergeStep(`Sắp xếp hoàn tất! Tổng số so sánh: ${comparisons}, Lượt trộn: ${merges}.`, 0, k, "Hoàn tất");
    }

    setSteps(allSteps);
    setCurrentStepIndex(0);
  }, [type]);

  useEffect(() => {
    generateSteps(array);
  }, [generateSteps, array]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleRandomize = () => {
    const newArr = Array.from({ length: 8 }, (_, idx) => ({
      id: Date.now() + idx,
      value: Math.floor(Math.random() * 20) + 1,
      isSorted: false
    }));
    setArray(newArr);
    setCustomInput(newArr.map(e => e.value).join(', '));
    setIsPlaying(false);
  };

  const handleApplyCustom = () => {
    const values = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).slice(0, 12);
    if (values.length > 0) {
      const newArr = values.map((val, idx) => ({ id: Date.now() + idx, value: val, isSorted: false }));
      setArray(newArr);
      setCustomInput(values.join(', '));
      setIsPlaying(false);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => handleNext(), 5200 - speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, handleNext, speed]);

  const currentStep = steps[currentStepIndex] || null;
  const interval = 5200 - speed;

  const getBarColor = (item: VisualElement | null, row: string, idx: number) => {
    if (!item) return 'bg-slate-50 border-dashed border-slate-200 text-transparent shadow-none';
    if (!currentStep) return `${algo.color} text-white border-black/10`;
    
    const isActive = currentStep.activeIndices.some(a => a.row === row && a.idx === idx);
    if (isActive) return 'bg-yellow-400 text-slate-900 border-yellow-500';
    if (item.isSorted) return 'bg-green-500 text-white border-green-600';
    
    // Algorithm specific highlights
    if (type === 'quick' && currentStep.pivotIdx === idx) return 'bg-rose-600 text-white border-rose-700';
    if (type === 'selection' && currentStep.minIdx === idx) return 'bg-cyan-600 text-white border-cyan-700';
    if (type === 'insertion' && currentStep.keyIdx === idx) return 'bg-indigo-600 text-white border-indigo-700';

    return `${algo.color} text-white border-black/10`;
  };

  const pseudocodes: Record<AlgorithmType, string[]> = {
    selection: [
      "for i = 0 to n-2:",
      "  min_idx = i",
      "  for j = i+1 to n-1:",
      "    if arr[j] < arr[min_idx]:",
      "      min_idx = j",
      "  swap(arr[i], arr[min_idx])"
    ],
    insertion: [
      "for i = 1 to n-1:",
      "  key = arr[i]",
      "  j = i",
      "  while j > 0 and arr[j-1] > arr[j]:",
      "    swap(arr[j-1], arr[j])",
      "    j = j - 1"
    ],
    interchange: [
      "for i = 0 to n-2:",
      "  for j = i+1 to n-1:",
      "    if arr[i] > arr[j]:",
      "      swap(arr[i], arr[j])"
    ],
    bubble: [
      "for i = 0 to n-2:",
      "  for j = n-1 down to i+1:",
      "    if arr[j] < arr[j-1]:",
      "      swap(arr[j], arr[j-1])"
    ],
    quick: [
      "quickSort(arr, low, high):",
      "  if low < high:",
      "    pi = partition(arr, low, high)",
      "    quickSort(arr, low, pi - 1)",
      "    quickSort(arr, pi + 1, high)",
      "partition(arr, low, high):",
      "  pivot = arr[high]",
      "  // dời các phần tử nhỏ hơn pivot sang trái"
    ],
    merge: [
      "mergeSort(arr, n):",
      "  for k = 1; k < n; k *= 2:",
      "    // Phân phối các đoạn độ dài k",
      "    // Trộn các đoạn độ dài k",
      "    // Dãy kết quả thành dãy nguồn mới"
    ]
  };

  const getAnimateProps = (row: string, idx: number) => {
    if (!currentStep) return {};
    const activeIndexInList = currentStep.activeIndices.findIndex(a => a.row === row && a.idx === idx);
    const isActive = activeIndexInList !== -1;
    
    if (!isActive) return { scale: 1, y: 0, rotate: 0, zIndex: 0 };

    // If it's a swap step and there are multiple active elements, make them fly up/down in a sequence
    if (currentStep.isSwap && currentStep.activeIndices.length >= 2) {
      const isFirst = activeIndexInList === 0;
      // In Insertion Sort, the Key is always the one moving "up/left", we treat it as isFirst
      const shouldMoveUp = type === 'insertion' ? (idx === currentStep.keyIdx) : isFirst;
      
      return {
        scale: 1.15,
        y: shouldMoveUp ? [0, -120, -120, 0] : [0, 120, 120, 0],
        rotate: shouldMoveUp ? [0, -15, -15, 0] : [0, 15, 15, 0],
        zIndex: 100,
      };
    }

    // Special case for Insertion Sort when NOT swapping but Key is active (initial pick or final step)
    if (type === 'insertion' && currentStep.keyIdx === idx) {
      return {
        scale: 1.15,
        y: -40,
        zIndex: 50
      };
    }

    // Default active state (e.g. comparison)
    return {
      scale: 1.1,
      y: -20,
      rotate: 0,
      zIndex: 10,
    };
  };

  const animDuration = Math.min(1.5, Math.max(0.4, interval / 1000));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-8"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${algo.color}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{algo.englishName}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">{algo.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {type === 'merge' ? (
            <div className="flex flex-col items-end gap-1">
              <div className="bg-blue-800 text-white px-4 py-1 rounded-lg font-bold text-sm">k = {currentStep?.k || 1}</div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold text-[10px] border border-blue-200 uppercase tracking-wider">
                {currentStep?.phase || "Khởi tạo"}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold">So sánh: <span className="text-blue-600">{currentStep?.comparisons || 0}</span></span>
              </div>
              <div className="flex items-center gap-2 px-3">
                <RotateCcw className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold">Thao tác: <span className="text-purple-600">{(currentStep?.swaps || 0) + (currentStep?.merges || 0)}</span></span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Dãy số đầu vào</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                <button
                  onClick={handleApplyCustom}
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
                >
                  Áp dụng
                </button>
              </div>
            </div>
            <div className="h-12 w-px bg-slate-100 hidden md:block" />
            <button
              onClick={handleRandomize}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-bold active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Ngẫu nhiên
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                <h2 className="font-bold text-slate-700 uppercase tracking-wider text-base">Vùng trực quan</h2>
              </div>
              <div className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                BƯỚC {currentStepIndex + 1} / {steps.length}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">
              {type === 'merge' ? (
                <div className="w-full flex flex-col items-center justify-center gap-12">
                  <motion.div layout className="flex items-center justify-center gap-4 w-full">
                    {currentStep?.sourceRow?.map((item, idx) => (
                      <div key={item?.id || `source-${idx}`} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-300">{idx}</span>
                        <motion.div 
                          layout 
                          animate={getAnimateProps('source', idx)}
                          transition={{ 
                            layout: { duration: animDuration, ease: "easeInOut" },
                            y: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                            rotate: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                            scale: { duration: 0.3 }
                          }}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold border-2 shadow-sm ${getBarColor(item, 'source', idx)}`}
                        >
                          {item?.value}
                        </motion.div>
                      </div>
                    ))}
                  </motion.div>
                  <div className="flex flex-col gap-4 w-full">
                    <motion.div layout className="flex items-center justify-center gap-2 md:gap-3">
                      {currentStep?.row1?.map((item, idx) => (
                        <motion.div 
                          key={item?.id || `row1-${idx}`} 
                          layout 
                          animate={getAnimateProps('row1', idx)}
                          transition={{ 
                            layout: { duration: animDuration, ease: "easeInOut" },
                            y: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                            rotate: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                            scale: { duration: 0.3 }
                          }}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold border-2 shadow-sm ${getBarColor(item, 'row1', idx)}`}
                        >
                          {item?.value}
                        </motion.div>
                      ))}
                    </motion.div>
                    <motion.div layout className="flex items-center justify-center gap-2 md:gap-3">
                      {currentStep?.row2?.map((item, idx) => (
                        <motion.div 
                          key={item?.id || `row2-${idx}`} 
                          layout 
                          animate={getAnimateProps('row2', idx)}
                          transition={{ 
                            layout: { duration: animDuration, ease: "easeInOut" },
                            y: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                            rotate: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                            scale: { duration: 0.3 }
                          }}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold border-2 shadow-sm ${getBarColor(item, 'row2', idx)}`}
                        >
                          {item?.value}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                  <motion.div layout className="flex items-center justify-center gap-2 md:gap-3 w-full mt-2">
                    {currentStep?.resultRow?.map((item, idx) => (
                      <motion.div 
                        key={item?.id || `result-${idx}`} 
                        layout 
                        animate={getAnimateProps('result', idx)}
                        transition={{ 
                          layout: { duration: animDuration, ease: "easeInOut" },
                          y: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                          rotate: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                          scale: { duration: 0.3 }
                        }}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold border-2 shadow-sm ${getBarColor(item, 'result', idx)}`}
                      >
                        {item?.value}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <motion.div layout className="flex items-center justify-center gap-2 md:gap-3 w-full px-4 overflow-x-auto no-scrollbar py-20">
                  {currentStep?.array.map((item, idx) => (
                      <motion.div 
                        key={item?.id || `main-${idx}`} 
                        layout
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="h-5 flex items-center justify-center">
                          <AnimatePresence>
                            {currentStep?.pivotIdx === idx && (
                              <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black text-rose-600 uppercase">Pivot</motion.span>
                            )}
                            {currentStep?.minIdx === idx && (
                              <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black text-cyan-600 uppercase">Min</motion.span>
                            )}
                            {currentStep?.keyIdx === idx && (
                              <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black text-indigo-600 uppercase">Key</motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <motion.div
                          layout
                          initial={false}
                        animate={getAnimateProps('main', idx)}
                        transition={{ 
                          layout: { duration: animDuration, ease: "easeInOut" },
                          y: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                          rotate: { duration: animDuration, times: [0, 0.2, 0.8, 1], ease: "easeInOut" },
                          scale: { duration: 0.3 }
                        }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl shadow-lg flex items-center justify-center text-sm sm:text-base md:text-lg font-black border-2 transition-all duration-300 ${getBarColor(item, 'main', idx)}`}
                      >
                        {item?.value}
                      </motion.div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">i={idx}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4">
              <div className="bg-blue-600 p-2 rounded-xl flex-shrink-0 shadow-lg shadow-blue-200">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Giải thích bước đi</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep?.description}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm md:text-base text-slate-700 font-medium leading-relaxed"
                  >
                    {currentStep?.description}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <button onClick={handleReset} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all active:scale-90">
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                className={`p-5 rounded-[1.5rem] shadow-xl transition-all transform active:scale-95 ${
                  isPlaying ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                } text-white`}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <button
                onClick={handleNext}
                disabled={isPlaying || currentStepIndex >= steps.length - 1}
                className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 disabled:opacity-20 transition-all active:scale-90"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
            <div className="h-10 w-px bg-slate-100 hidden sm:block" />
            <div className="flex flex-col gap-2 min-w-[240px]">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Tốc độ</span>
                <span>{interval >= 4000 ? 'Rất chậm' : interval >= 2000 ? 'Chậm' : 'Nhanh'}</span>
              </div>
              <input
                type="range" min="200" max="5000" step="100" value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-slate-500">
              <Code2 className="w-5 h-5" />
              <h2 className="font-black uppercase text-[10px] tracking-widest">Mã giả (Pseudocode)</h2>
            </div>
            <div className="font-mono text-xs md:text-sm space-y-2">
              {pseudocodes[type].map((code, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-1.5 rounded-xl transition-all ${
                    currentStep?.line === idx ? 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500' : 'text-slate-500'
                  }`}
                >
                  <span className="opacity-20 mr-4 select-none text-[10px]">{idx + 1}</span>
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 p-8 space-y-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Info className="w-4 h-4 text-blue-500" />
              Thông số kỹ thuật
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase">Thời gian:</span>
                <span className="font-mono font-black text-blue-600">{algo.complexity}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase">Bộ nhớ:</span>
                <span className="font-mono font-black text-orange-600">{algo.space}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              * {algo.description}
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 p-8">
            <h3 className="font-black text-slate-800 mb-6 text-[10px] uppercase tracking-widest">Chú thích</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-yellow-400 shadow-sm shadow-yellow-100" />
                <span className="text-xs font-bold text-slate-600">Đang thao tác</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm shadow-blue-100" />
                <span className="text-xs font-bold text-slate-600">Chưa sắp xếp</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-green-500 shadow-sm shadow-green-100" />
                <span className="text-xs font-bold text-slate-600">Đã sắp xếp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

