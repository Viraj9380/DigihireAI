import React from "react";

export default function VendorTable({ vendors = [] }) {
  return (
    <div className="mt-4 bg-white rounded shadow-sm p-4">
      <h4 className="font-semibold mb-3">Assigned vendors</h4>
      {vendors.length === 0 ? (
        <div className="text-gray-500">No vendors assigned yet.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="pb-2">Vendor</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Max candidates</th>
                <th className="pb-2">Assigned at</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id || v.assignment_id || `${v.vendor_id}-${v.assessment_id}`} className="border-t">
                  <td className="py-2">{v.vendor_name || v.name || v.company_name}</td>
                  <td className="py-2 text-sm text-gray-600">{v.email || v.vendor_email || "-"}</td>
                  <td className="py-2">{v.max_candidates ?? v.max ?? "-"}</td>
                  <td className="py-2 text-sm text-gray-500">{v.assigned_at ? new Date(v.assigned_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
