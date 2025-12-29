// src/components/InviteModal.jsx
import axios from "axios";
import { useState } from "react";

export default function InviteModal({ test, onClose }) {
  const [emails, setEmails] = useState("");

  const sendInvites = async () => {
    await axios.post(
      `http://localhost:8000/coding/tests/${test.id}/invite`,
      { emails: emails.split(",").map(e => e.trim()) }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 w-[520px] rounded">
        <h2 className="text-xl font-bold mb-3">Invite Candidates</h2>

        <textarea
          className="border w-full p-2"
          rows={4}
          placeholder="Enter emails separated by commas"
          value={emails}
          onChange={e => setEmails(e.target.value)}
        />

        <button
          onClick={sendInvites}
          className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
        >
          Send Invite
        </button>
      </div>
    </div>
  );
}
