import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const UploadProgressOverlay = ({ uploadStatus }) => {
  // Block browser navigation / tab close while uploading
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  if (!uploadStatus) return null;

  const { step, progress, current, total } = uploadStatus;
  const overallPct = total > 0 ? Math.round(((current - 1) / total) * 100 + (progress / total)) : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-5">
          <Loader2 className="w-6 h-6 text-[#099E0E] animate-spin" />
          <h3 className="text-lg font-black text-slate-900">Uploading</h3>
        </div>

        {/* Current step */}
        <p className="text-sm font-medium text-slate-600 mb-1">{step}</p>
        <p className="text-xs text-slate-400 mb-3">
          Step {current} of {total}
        </p>

        {/* Per-file progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#099E0E] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Overall progress */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Overall progress</span>
          <span className="font-bold text-slate-600">{overallPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-slate-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallPct}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 mt-4 text-center">
          Do not close or navigate away
        </p>
      </div>
    </div>
  );
};

export default UploadProgressOverlay;
