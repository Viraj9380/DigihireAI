import React from "react";
import MyQuestionsPage from "../pages/MyQuestionsPage";

export default function MyQuestionsModal({ testId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[85%] max-w-6xl h-[80%] mt-16 rounded-lg overflow-hidden relative shadow-xl">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-xl"
        >
          ✕
        </button>

        <div className="h-full overflow-y-auto">
          <MyQuestionsPage testId={testId} isModal />
        </div>
      </div>
    </div>
  );
}
