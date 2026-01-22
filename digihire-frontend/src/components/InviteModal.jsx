import axios from "axios";
import { useState } from "react";
import { X } from "lucide-react";

export default function InviteModal({
  test,
  onClose,
  mode = "invite",
  presetEmail,
}) {
  const [emails, setEmails] = useState(presetEmail || "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const sendInvites = async () => {
    try {
      await axios.post(
        `http://localhost:8000/coding/tests/${test.id}/${mode}`,
        {
          emails: emails.split(",").map((e) => e.trim()),
          access_start: startTime || null,
          access_end: endTime || null,
        }
      );
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 w-[520px] rounded relative space-y-4">
        {/* ❌ Close Button */}
        <button
          onClick={() => onClose()}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold">
          {mode === "reinvite" ? "Reinvite Candidate" : "Invite Candidates"}
        </h2>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <textarea
          className="border w-full p-2"
          rows={3}
          placeholder="Emails separated by commas"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium">Access Start</label>
          <input
            type="datetime-local"
            className="border p-2 w-full"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Access End</label>
          <input
            type="datetime-local"
            className="border p-2 w-full"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <button
          onClick={sendInvites}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          {mode === "reinvite" ? "Reinvite" : "Send Invite"}
        </button>
      </div>
    </div>
  );
}
