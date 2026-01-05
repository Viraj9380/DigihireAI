import axios from "axios";
import { useState } from "react";

export default function InviteModal({ test, onClose }) {
  const [emails, setEmails] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const sendInvites = async () => {
    await axios.post(
      `http://localhost:8000/coding/tests/${test.id}/invite`,
      {
        emails: emails.split(",").map(e => e.trim()),
        access_start: startTime || null,
        access_end: endTime || null,
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 w-[520px] rounded space-y-4">
        <h2 className="text-xl font-bold">Invite Candidates</h2>

        <textarea
          className="border w-full p-2"
          rows={3}
          placeholder="Emails separated by commas"
          value={emails}
          onChange={e => setEmails(e.target.value)}
        />

        {/* 🔹 ACCESS WINDOW */}
        <div>
          <label className="text-sm font-medium">Access Start</label>
          <input
            type="datetime-local"
            className="border p-2 w-full"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Access End</label>
          <input
            type="datetime-local"
            className="border p-2 w-full"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>

        <button
          onClick={sendInvites}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Send Invite
        </button>
      </div>
    </div>
  );
}
