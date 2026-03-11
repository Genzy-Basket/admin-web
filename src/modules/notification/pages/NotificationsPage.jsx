import { useState } from "react";
import { Send, Megaphone, User } from "lucide-react";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { useApiCall } from "../../../api/useApiCall";
import { notificationApi } from "../../../api/endpoints/notification.api";
import Card from "../../../components/shared/Card";
import Button from "../../../components/shared/Button";
import FormInput from "../../../components/shared/FormInput";
import FormTextarea from "../../../components/shared/FormTextarea";

const NotificationsPage = () => {
  usePageMeta({ title: "Push Notifications" });

  const [mode, setMode] = useState("broadcast"); // "broadcast" | "user"
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userId, setUserId] = useState("");

  const { execute: sendBroadcast, loading: broadcastLoading } = useApiCall(
    notificationApi.broadcast,
    {
      successMessage: "Broadcast sent successfully!",
      onSuccess: () => { setTitle(""); setBody(""); },
    }
  );

  const { execute: sendToUser, loading: userLoading } = useApiCall(
    notificationApi.sendToUser,
    {
      successMessage: "Notification sent to user!",
      onSuccess: () => { setTitle(""); setBody(""); setUserId(""); },
    }
  );

  const loading = broadcastLoading || userLoading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (mode === "broadcast") {
      sendBroadcast(title.trim(), body.trim());
    } else {
      if (!userId.trim()) return;
      sendToUser(userId.trim(), title.trim(), body.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode("broadcast")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
            mode === "broadcast"
              ? "bg-[#099E0E] text-white shadow-lg shadow-[#099E0E]/20"
              : "bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-[#099E0E]"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Broadcast to All
        </button>
        <button
          onClick={() => setMode("user")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
            mode === "user"
              ? "bg-[#099E0E] text-white shadow-lg shadow-[#099E0E]/20"
              : "bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-[#099E0E]"
          }`}
        >
          <User className="w-4 h-4" />
          Send to User
        </button>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            {mode === "broadcast" ? (
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-amber-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {mode === "broadcast" ? "Broadcast Notification" : "Send to Specific User"}
              </h2>
              <p className="text-sm text-slate-400">
                {mode === "broadcast"
                  ? "This will be sent to all users with the app installed."
                  : "Send a notification to a specific user by their ID."}
              </p>
            </div>
          </div>

          {mode === "user" && (
            <FormInput
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
            />
          )}

          <FormInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fresh Arrivals!"
            required
          />

          <FormTextarea
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. New vegetables just arrived. Order now and get free delivery!"
            rows={4}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !title.trim() || !body.trim() || (mode === "user" && !userId.trim())}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {mode === "broadcast" ? "Send Broadcast" : "Send Notification"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NotificationsPage;
