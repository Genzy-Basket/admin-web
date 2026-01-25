// import { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import axios from "axios";
// import { getCloudinarySignature } from "../../api/axiosClient";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   Loader2,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
//   RotateCcw,
//   Database,
//   Trash2,
//   LayoutGrid,
//   FileJson,
//   Image,
//   X,
// } from "lucide-react";
// import { categories, units } from "../../constants";
// import MediaPicker from "../components/shared/MediaPicker";

// const IngredientForm = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     unit: "gram",
//     pricePerUnit: "",
//     category: "vegetables",
//     isVeg: true,
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [rawJson, setRawJson] = useState("");
//   const [queue, setQueue] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({});

//   const abortControllerRef = useRef(null);
//   // const fileInputRef = useRef(null);

//   const MAX_QUEUE_SIZE = 50;
//   const API_URL = import.meta.env.VITE_API_URL;

//   useEffect(() => {
//     return () => {
//       if (imagePreview) {
//         URL.revokeObjectURL(imagePreview);
//       }
//     };
//   }, [imagePreview]);

//   useEffect(() => {
//     const processQueue = async () => {
//       if (isProcessing) return;
//       const task = queue.find((item) => item.status === "pending");
//       if (!task) return;

//       setIsProcessing(true);
//       abortControllerRef.current = new AbortController();

//       updateTask(task.id, {
//         status: "processing",
//         message: "Step 1/2: Uploading Image...",
//       });

//       try {
//         const { timestamp, signature, apiKey, cloudName, folder } =
//           await getCloudinarySignature("food");

//         const data = new FormData();
//         data.append("file", task.file);
//         data.append("api_key", apiKey);
//         data.append("timestamp", timestamp);
//         data.append("signature", signature);
//         data.append("folder", folder);

//         const imgRes = await axios.post(
//           `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
//           data,
//           {
//             signal: abortControllerRef.current.signal,
//             onUploadProgress: (progressEvent) => {
//               const percentCompleted = Math.round(
//                 (progressEvent.loaded * 100) / progressEvent.total,
//               );
//               setUploadProgress((prev) => ({
//                 ...prev,
//                 [task.id]: percentCompleted,
//               }));
//               updateTask(task.id, {
//                 message: `Step 1/2: Uploading Image... ${percentCompleted}%`,
//               });
//             },
//           },
//         );
//         const imageUrl = imgRes.data.secure_url;

//         setUploadProgress((prev) => {
//           const newProgress = { ...prev };
//           delete newProgress[task.id];
//           return newProgress;
//         });

//         updateTask(task.id, { message: "Step 2/2: Saving to Database..." });

//         const finalData = {
//           ...task.payload,
//           imageUrl,
//           pricePerUnit: Number(task.payload.pricePerUnit),
//         };

//         await axios.post(`${API_URL}/ingredient`, finalData, {
//           signal: abortControllerRef.current.signal,
//         });

//         updateTask(task.id, {
//           status: "completed",
//           message: "Successfully Synchronized",
//         });

//         toast.success(`Success: ${task.payload.name} added.`);

//         updateTask(task.id, { file: null });
//       } catch (err) {
//         if (err.name === "AbortError") {
//           updateTask(task.id, {
//             status: "error",
//             message: "Upload cancelled",
//           });
//         } else {
//           const serverErrorMessage =
//             err.response?.data?.message ||
//             err.response?.data?.error ||
//             err.message ||
//             "Connection failed";

//           updateTask(task.id, {
//             status: "error",
//             message: `Error: ${serverErrorMessage}`,
//           });
//           toast.error(`Failed: ${task.payload.name}`);
//         }

//         // Clear progress on error
//         setUploadProgress((prev) => {
//           const newProgress = { ...prev };
//           delete newProgress[task.id];
//           return newProgress;
//         });
//       } finally {
//         setIsProcessing(false);
//         abortControllerRef.current = null;
//       }
//     };

//     processQueue();
//   }, [queue, isProcessing, API_URL]);

//   const updateTask = useCallback((id, updates) => {
//     setQueue((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
//     );
//   }, []);

//   // Sorting with priority
//   const priorityMap = { error: 0, processing: 1, pending: 2, completed: 3 };
//   const sortedQueue = useMemo(() => {
//     return [...queue].sort(
//       (a, b) => priorityMap[a.status] - priorityMap[b.status],
//     );
//   }, [queue]);

//   const handleJsonPaste = useCallback((e) => {
//     const value = e.target.value;
//     setRawJson(value);

//     try {
//       let cleaned = value.trim();
//       if (cleaned.endsWith(",")) cleaned = cleaned.slice(0, -1);

//       // Safe JSON parsing - replaced new Function()
//       const parsed = JSON.parse(cleaned);

//       if (parsed && typeof parsed === "object") {
//         setFormData({
//           name: parsed.name || "",
//           unit: units.includes(parsed.unit?.toLowerCase())
//             ? parsed.unit.toLowerCase()
//             : "gram",
//           pricePerUnit: parsed.pricePerUnit || parsed.pricePerQty || "",
//           category: categories.includes(parsed.category?.toLowerCase())
//             ? parsed.category.toLowerCase()
//             : "vegetables",
//           isVeg: parsed.isVeg !== undefined ? parsed.isVeg : true,
//         });
//       }
//     } catch (err) {
//       // Silent fail for invalid JSON during typing
//       if (value.trim() && value.includes("{")) {
//         console.warn("Invalid JSON format:", err);
//       }
//     }
//   }, []);

//   const handleImageChange = useCallback(
//     (file) => {
//       if (imagePreview) {
//         URL.revokeObjectURL(imagePreview);
//       }
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     },
//     [imagePreview],
//   );
//   const removeImage = useCallback(() => {
//     if (imagePreview) {
//       URL.revokeObjectURL(imagePreview);
//     }
//     setImageFile(null);
//     setImagePreview(null);
//   }, [imagePreview]);

//   // Add to queue
//   const addToQueue = useCallback(
//     (e) => {
//       e.preventDefault();

//       if (!imageFile) {
//         toast.error("Please select an image!");
//         return;
//       }

//       if (queue.length >= MAX_QUEUE_SIZE) {
//         toast.error(`Queue is full (max ${MAX_QUEUE_SIZE} items)`);
//         return;
//       }

//       setQueue((prev) => [
//         ...prev,
//         {
//           id: Date.now(),
//           status: "pending",
//           message: "Queued",
//           file: imageFile,
//           payload: { ...formData },
//         },
//       ]);

//       // Reset form
//       setFormData({
//         name: "",
//         unit: "gram",
//         pricePerUnit: "",
//         category: "vegetables",
//         isVeg: true,
//       });

//       removeImage();
//       setRawJson("");
//     },
//     [imageFile, queue.length, formData, removeImage],
//   );

//   // Retry failed upload
//   const handleRetry = useCallback((task) => {
//     setFormData(task.payload);
//     if (task.file) {
//       setImageFile(task.file);
//       setImagePreview(URL.createObjectURL(task.file));
//     }
//     setQueue((prev) => prev.filter((item) => item.id !== task.id));
//     toast("Moved back to form", { icon: "✏️" });
//   }, []);

//   // Clear completed tasks
//   const clearCompleted = useCallback(() => {
//     const completedCount = queue.filter((t) => t.status === "completed").length;
//     if (completedCount === 0) return;

//     if (window.confirm(`Clear ${completedCount} completed task(s)?`)) {
//       setQueue((q) => q.filter((t) => t.status !== "completed"));
//       toast.success(`Cleared ${completedCount} completed tasks`);
//     }
//   }, [queue]);

//   return (
//     <div className="max-h-screen bg-slate-50 p-4 md:p-10 text-slate-900">
//       <Toaster position="top-right" />

//       <div className="max-w-[1400px] flex-col space-y-5 scroll-auto">
//         {/* INPUT SECTION */}
//         <div className="lg:col-span-7 space-y-6">
//           <div className="flex items-center gap-3 mb-2">
//             <LayoutGrid className="text-indigo-600" size={28} />
//             <h1 className="text-2xl font-black tracking-tight">
//               INGREDIENT PIPELINE
//             </h1>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* JSON IMPORT */}
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
//               <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">
//                 <FileJson size={14} /> JSON Import
//               </label>
//               <textarea
//                 placeholder='{"name": "Tomato", "unit": "kg", "pricePerUnit": 60, "category": "vegetables", "isVeg": true}'
//                 className="w-full h-[360px] bg-slate-50 rounded-2xl p-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none border border-slate-200"
//                 value={rawJson}
//                 onChange={handleJsonPaste}
//               />
//             </div>

//             {/* ENTRY FORM */}
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
//               <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">
//                 <Database size={14} /> Entry Form
//               </label>

//               <div className="space-y-4 flex-1">
//                 <input
//                   required
//                   placeholder="Name (e.g., Tomato)"
//                   className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                 />

//                 <div className="grid grid-cols-2 gap-3">
//                   <input
//                     required
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     placeholder="Price"
//                     className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                     value={formData.pricePerUnit}
//                     onChange={(e) =>
//                       setFormData({ ...formData, pricePerUnit: e.target.value })
//                     }
//                   />
//                   <select
//                     className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl capitalize focus:ring-2 focus:ring-indigo-500 outline-none"
//                     value={formData.unit}
//                     onChange={(e) =>
//                       setFormData({ ...formData, unit: e.target.value })
//                     }
//                   >
//                     {units.map((u) => (
//                       <option key={u} value={u}>
//                         {u}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <select
//                   className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl capitalize focus:ring-2 focus:ring-indigo-500 outline-none"
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                 >
//                   {categories.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>

//                 {/* IMAGE UPLOAD WIDGET */}
//                 <MediaPicker
//                   imageFile={imageFile}
//                   imagePreview={imagePreview}
//                   onFileSelect={handleImageChange}
//                   onRemove={removeImage}
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={addToQueue}
//                 disabled={
//                   queue.length >= MAX_QUEUE_SIZE || !imageFile || !formData.name
//                 }
//                 className="w-full mt-6 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {queue.length >= MAX_QUEUE_SIZE ? "Queue Full" : "Add to Queue"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* QUEUE SECTION */}
//         <div className="lg:col-span-5 flex flex-col h-200">
//           <div className="bg-white rounded-t-[32px] border border-slate-200 p-6 flex justify-between items-center shadow-sm">
//             <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
//               <Clock size={16} className="text-slate-400" />
//               Processing Queue ({queue.length}/{MAX_QUEUE_SIZE})
//             </h3>
//             <button
//               onClick={clearCompleted}
//               disabled={!queue.some((t) => t.status === "completed")}
//               className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
//             >
//               <Trash2 size={12} />
//               CLEAR COMPLETED
//             </button>
//           </div>

//           <div className="bg-white border-x border-b border-slate-200 rounded-b-[32px] flex-1 overflow-y-auto p-4 space-y-3 shadow-sm">
//             {sortedQueue.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-slate-400">
//                 <Database size={48} className="mb-3 opacity-30" />
//                 <p className="text-sm font-semibold">Queue is empty</p>
//                 <p className="text-xs">Add items to start processing</p>
//               </div>
//             ) : (
//               sortedQueue.map((task) => (
//                 <div
//                   key={task.id}
//                   className={`p-4 rounded-2xl border transition-all ${
//                     task.status === "error"
//                       ? "bg-rose-50 border-rose-200"
//                       : task.status === "processing"
//                         ? "bg-indigo-50 border-indigo-200"
//                         : task.status === "completed"
//                           ? "bg-emerald-50 border-emerald-200"
//                           : "bg-white border-slate-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div
//                         className={`w-10 h-10 rounded-xl flex items-center justify-center ${
//                           task.status === "completed"
//                             ? "bg-emerald-500 text-white"
//                             : task.status === "error"
//                               ? "bg-rose-500 text-white"
//                               : task.status === "processing"
//                                 ? "bg-indigo-500 text-white"
//                                 : "bg-slate-100 text-slate-400"
//                         }`}
//                       >
//                         {task.status === "processing" ? (
//                           <Loader2 size={18} className="animate-spin" />
//                         ) : task.status === "completed" ? (
//                           <CheckCircle2 size={18} />
//                         ) : task.status === "error" ? (
//                           <AlertCircle size={18} />
//                         ) : (
//                           <Clock size={18} />
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-black text-slate-800 text-sm tracking-tight truncate">
//                           {task.payload.name}
//                         </p>
//                         <p className="text-[11px] text-slate-500 truncate">
//                           ₹{task.payload.pricePerUnit}/{task.payload.unit} •{" "}
//                           {task.payload.category}
//                         </p>

//                         {/* Progress bar for processing tasks */}
//                         {task.status === "processing" &&
//                           uploadProgress[task.id] !== undefined && (
//                             <div className="mt-2 mb-1">
//                               <div className="w-full bg-indigo-100 rounded-full h-1.5">
//                                 <div
//                                   className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
//                                   style={{
//                                     width: `${uploadProgress[task.id]}%`,
//                                   }}
//                                 />
//                               </div>
//                             </div>
//                           )}

//                         <p
//                           className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${
//                             task.status === "error"
//                               ? "text-rose-600"
//                               : task.status === "processing"
//                                 ? "text-indigo-600"
//                                 : task.status === "completed"
//                                   ? "text-emerald-600"
//                                   : "text-slate-400"
//                           }`}
//                         >
//                           {task.message}
//                         </p>
//                       </div>
//                     </div>
//                     {task.status === "error" && (
//                       <button
//                         onClick={() => handleRetry(task)}
//                         className="bg-white text-rose-600 border border-rose-300 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 hover:bg-rose-50 transition-colors flex-shrink-0"
//                       >
//                         <RotateCcw size={12} /> RETRY
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IngredientForm;

// const QueueItem = ({ task, progress, onRetry }) => {
//   const isError = task.status === "error";
//   const isProcessing = task.status === "processing";
//   const isCompleted = task.status === "completed";

//   const statusStyles = {
//     error: "bg-rose-50 border-rose-200 text-rose-500",
//     processing: "bg-indigo-50 border-indigo-200 text-indigo-500",
//     completed: "bg-emerald-50 border-emerald-200 text-emerald-500",
//     pending: "bg-white border-slate-200 text-slate-400",
//   };

//   return (
//     <div
//       className={`p-4 rounded-2xl border transition-all ${statusStyles[task.status]}`}
//     >
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div
//             className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current/10`}
//           >
//             {isProcessing ? (
//               <Loader2 size={18} className="animate-spin" />
//             ) : isCompleted ? (
//               <CheckCircle2 size={18} />
//             ) : isError ? (
//               <AlertCircle size={18} />
//             ) : (
//               <Clock size={18} />
//             )}
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="font-black text-slate-800 text-sm truncate">
//               {task.payload.name}
//             </p>
//             <p className="text-[11px] text-slate-500 truncate">
//               ₹{task.payload.pricePerUnit}/{task.payload.unit} •{" "}
//               {task.payload.category}
//             </p>

//             {isProcessing && progress !== undefined && (
//               <div className="mt-2 w-full bg-indigo-100 rounded-full h-1.5">
//                 <div
//                   className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             )}
//             <p className={`text-[10px] font-bold uppercase mt-1`}>
//               {task.message}
//             </p>
//           </div>
//         </div>

//         {isError && (
//           <button onClick={() => onRetry(task)} className="...">
//             <RotateCcw size={12} /> RETRY
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { getCloudinarySignature } from "../../api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { LayoutGrid, FileJson, Database } from "lucide-react";
import { categories, units } from "../../constants";

// Shared Components
import {
  Card,
  Button,
  FormInput,
  FormSelect,
  SectionHeader,
  EmptyState,
  StatusIndicator,
  ProgressBar,
  MediaPicker,
} from "../components/shared";

const IngredientForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    unit: "gram",
    pricePerUnit: "",
    category: "vegetables",
    isVeg: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rawJson, setRawJson] = useState("");
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const abortControllerRef = useRef(null);
  const MAX_QUEUE_SIZE = 50;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing) return;
      const task = queue.find((item) => item.status === "pending");
      if (!task) return;

      setIsProcessing(true);
      abortControllerRef.current = new AbortController();

      updateTask(task.id, {
        status: "processing",
        message: "Step 1/2: Uploading Image...",
      });

      try {
        const { timestamp, signature, apiKey, cloudName, folder } =
          await getCloudinarySignature("food");

        const data = new FormData();
        data.append("file", task.file);
        data.append("api_key", apiKey);
        data.append("timestamp", timestamp);
        data.append("signature", signature);
        data.append("folder", folder);

        const imgRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          data,
          {
            signal: abortControllerRef.current.signal,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress((prev) => ({
                ...prev,
                [task.id]: percentCompleted,
              }));
              updateTask(task.id, {
                message: `Step 1/2: Uploading Image... ${percentCompleted}%`,
              });
            },
          },
        );
        const imageUrl = imgRes.data.secure_url;

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[task.id];
          return newProgress;
        });

        updateTask(task.id, { message: "Step 2/2: Saving to Database..." });

        const finalData = {
          ...task.payload,
          imageUrl,
          pricePerUnit: Number(task.payload.pricePerUnit),
        };

        await axios.post(`${API_URL}/ingredient`, finalData, {
          signal: abortControllerRef.current.signal,
        });

        updateTask(task.id, {
          status: "completed",
          message: "Successfully Synchronized",
        });

        toast.success(`Success: ${task.payload.name} added.`);
        updateTask(task.id, { file: null });
      } catch (err) {
        if (err.name === "AbortError") {
          updateTask(task.id, {
            status: "error",
            message: "Upload cancelled",
          });
        } else {
          const serverErrorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Connection failed";

          updateTask(task.id, {
            status: "error",
            message: `Error: ${serverErrorMessage}`,
          });
          toast.error(`Failed: ${task.payload.name}`);
        }

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[task.id];
          return newProgress;
        });
      } finally {
        setIsProcessing(false);
        abortControllerRef.current = null;
      }
    };

    processQueue();
  }, [queue, isProcessing, API_URL]);

  const updateTask = useCallback((id, updates) => {
    setQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }, []);

  const priorityMap = { error: 0, processing: 1, pending: 2, completed: 3 };
  const sortedQueue = useMemo(() => {
    return [...queue].sort(
      (a, b) => priorityMap[a.status] - priorityMap[b.status],
    );
  }, [queue]);

  const handleJsonPaste = useCallback((e) => {
    const value = e.target.value;
    setRawJson(value);

    try {
      let cleaned = value.trim();
      if (cleaned.endsWith(",")) cleaned = cleaned.slice(0, -1);

      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed === "object") {
        setFormData({
          name: parsed.name || "",
          unit: units.includes(parsed.unit?.toLowerCase())
            ? parsed.unit.toLowerCase()
            : "gram",
          pricePerUnit: parsed.pricePerUnit || parsed.pricePerQty || "",
          category: categories.includes(parsed.category?.toLowerCase())
            ? parsed.category.toLowerCase()
            : "vegetables",
          isVeg: parsed.isVeg !== undefined ? parsed.isVeg : true,
        });
      }
    } catch (err) {
      if (value.trim() && value.includes("{")) {
        console.warn("Invalid JSON format:", err);
      }
    }
  }, []);

  const handleImageChange = useCallback(
    (file) => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    },
    [imagePreview],
  );

  const removeImage = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }, [imagePreview]);

  const addToQueue = useCallback(
    (e) => {
      e.preventDefault();

      if (!imageFile) {
        toast.error("Please select an image!");
        return;
      }

      if (queue.length >= MAX_QUEUE_SIZE) {
        toast.error(`Queue is full (max ${MAX_QUEUE_SIZE} items)`);
        return;
      }

      setQueue((prev) => [
        ...prev,
        {
          id: Date.now(),
          status: "pending",
          message: "Queued",
          file: imageFile,
          payload: { ...formData },
        },
      ]);

      setFormData({
        name: "",
        unit: "gram",
        pricePerUnit: "",
        category: "vegetables",
        isVeg: true,
      });

      removeImage();
      setRawJson("");
    },
    [imageFile, queue.length, formData, removeImage],
  );

  const handleRetry = useCallback((task) => {
    setFormData(task.payload);
    if (task.file) {
      setImageFile(task.file);
      setImagePreview(URL.createObjectURL(task.file));
    }
    setQueue((prev) => prev.filter((item) => item.id !== task.id));
    toast("Moved back to form", { icon: "✏️" });
  }, []);

  const clearCompleted = useCallback(() => {
    const completedCount = queue.filter((t) => t.status === "completed").length;
    if (completedCount === 0) return;

    if (window.confirm(`Clear ${completedCount} completed task(s)?`)) {
      setQueue((q) => q.filter((t) => t.status !== "completed"));
      toast.success(`Cleared ${completedCount} completed tasks`);
    }
  }, [queue]);

  return (
    <div className="max-h-screen bg-slate-50 p-4 md:p-10 text-slate-900">
      <Toaster position="top-right" />

      <div className="max-w-[1400px] flex-col space-y-5">
        <SectionHeader
          icon={LayoutGrid}
          title="INGREDIENT PIPELINE"
          size="2xl"
          uppercase
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* JSON Import */}
          <Card padding="md" rounded="xl">
            <SectionHeader
              icon={FileJson}
              title="JSON Import"
              size="xs"
              uppercase
            />
            <textarea
              placeholder='{"name": "Tomato", "unit": "kg", "pricePerUnit": 60, "category": "vegetables", "isVeg": true}'
              className="w-full h-[360px] bg-slate-50 rounded-2xl p-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none border border-slate-200 mt-4"
              value={rawJson}
              onChange={handleJsonPaste}
            />
          </Card>

          {/* Entry Form */}
          <Card padding="md" rounded="xl" className="flex flex-col">
            <SectionHeader
              icon={Database}
              title="Entry Form"
              size="xs"
              uppercase
            />

            <div className="space-y-4 flex-1 mt-4">
              <FormInput
                placeholder="Name (e.g., Tomato)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  required
                />
                <FormSelect
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  options={units}
                  capitalize
                />
              </div>

              <FormSelect
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                options={categories}
                capitalize
              />

              <MediaPicker
                imageFile={imageFile}
                imagePreview={imagePreview}
                onFileSelect={handleImageChange}
                onRemove={removeImage}
              />
            </div>

            <Button
              variant="dark"
              fullWidth
              onClick={addToQueue}
              disabled={
                queue.length >= MAX_QUEUE_SIZE || !imageFile || !formData.name
              }
              className="mt-6"
            >
              {queue.length >= MAX_QUEUE_SIZE ? "Queue Full" : "Add to Queue"}
            </Button>
          </Card>
        </div>

        {/* Queue Section */}
        <Card padding="none" rounded="2xl">
          <div className="p-6 border-b border-slate-200">
            <SectionHeader
              title={`Processing Queue (${queue.length}/${MAX_QUEUE_SIZE})`}
              size="sm"
              uppercase
              action={
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={clearCompleted}
                  disabled={!queue.some((t) => t.status === "completed")}
                >
                  CLEAR COMPLETED
                </Button>
              }
            />
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {sortedQueue.length === 0 ? (
              <EmptyState
                icon={Database}
                title="Queue is empty"
                description="Add items to start processing"
              />
            ) : (
              sortedQueue.map((task) => {
                const statusVariants = {
                  error: "error",
                  processing: "processing",
                  completed: "success",
                  pending: "pending",
                };

                return (
                  <Card
                    key={task.id}
                    padding="md"
                    rounded="lg"
                    className={`${
                      task.status === "error"
                        ? "bg-rose-50 border-rose-200"
                        : task.status === "processing"
                          ? "bg-indigo-50 border-indigo-200"
                          : task.status === "completed"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <StatusIndicator
                          status={statusVariants[task.status]}
                          size="md"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">
                            {task.payload.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            ₹{task.payload.pricePerUnit}/{task.payload.unit} •{" "}
                            {task.payload.category}
                          </p>

                          {task.status === "processing" &&
                            uploadProgress[task.id] !== undefined && (
                              <ProgressBar
                                progress={uploadProgress[task.id]}
                                variant="secondary"
                                size="sm"
                                className="mt-2"
                              />
                            )}

                          <p
                            className={`text-[10px] font-bold uppercase mt-1 ${
                              task.status === "error"
                                ? "text-rose-600"
                                : task.status === "processing"
                                  ? "text-indigo-600"
                                  : task.status === "completed"
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                            }`}
                          >
                            {task.message}
                          </p>
                        </div>
                      </div>

                      {task.status === "error" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRetry(task)}
                        >
                          RETRY
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IngredientForm;
