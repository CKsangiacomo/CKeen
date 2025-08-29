"use client";
import { useEffect, useState, useCallback } from "react";

type Widget = { id:string; name:string; type:string; public_key:string; status:string; config:Record<string, unknown> };

const getUserId = () => {
  if (typeof window === "undefined") return ""; // Server-side safety
  
  try {
    let id = localStorage.getItem("demo_user_id");
    if (!id) { 
      // Generate a proper UUID format
      id = crypto.randomUUID?.() || generateUUID(); 
      localStorage.setItem("demo_user_id", id); 
    }
    return id;
  } catch {
    // Fallback if localStorage is not available
    return generateUUID();
  }
};

// Fallback UUID generator if crypto.randomUUID is not available
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function WidgetsPage() {
  const [userId, setUserId] = useState("");
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [name, setName] = useState("Contact form");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadWidgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/widgets?userId=${userId}`);
      const data = await res.json();
      setWidgets(data);
    } catch {
      console.error("Failed to load widgets");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  useEffect(() => {
    if (userId) {
      loadWidgets();
    }
  }, [userId, loadWidgets]);

  const create = async () => {
    setSaving(true);
    const res = await fetch("/api/widgets", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        userId,
        name,
        type: "contact_form",
        config: { title: "Contact us", buttonText: "Send" }
      })
    });
    const w = await res.json();
    setSaving(false);
    if (res.ok) {
      setWidgets([w, ...widgets]);
      setName("Contact form"); // Reset name after creation
    } else {
      alert(w.error || "Error");
    }
  };

  const toggleStatus = async (widget: Widget) => {
    const newStatus = widget.status === "active" ? "inactive" : "active";
    const res = await fetch("/api/widgets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        widgetId: widget.id,
        status: newStatus
      })
    });
    
    if (res.ok) {
      setWidgets(widgets.map(w => 
        w.id === widget.id ? { ...w, status: newStatus } : w
      ));
    } else {
      alert("Failed to update status");
    }
  };

  const deleteWidget = async (widget: Widget) => {
    if (!confirm(`Are you sure you want to delete "${widget.name}"?`)) return;
    
    const res = await fetch("/api/widgets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        widgetId: widget.id
      })
    });
    
    if (res.ok) {
      setWidgets(widgets.filter(w => w.id !== widget.id));
    } else {
      alert("Failed to delete widget");
    }
  };

  return (
    <div className="max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Widgets</h1>
        <button
          onClick={loadWidgets}
          disabled={loading}
          className="px-3 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          className="border px-3 py-2 rounded w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Widget name"
        />
        <button
          onClick={create}
          disabled={saving}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create widget"}
        </button>
      </div>

      <ul className="divide-y rounded border">
        {widgets.map(w => (
          <li key={w.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {w.name} <span className="text-sm text-gray-500">({w.type})</span>
                </div>
                <div className="text-sm text-gray-600">
                  Status: 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    w.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {w.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(w)}
                  className={`px-3 py-1 rounded text-sm ${
                    w.status === "active"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {w.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <a 
                  className="px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm"
                  href={`/widgets/${w.id}`}
                >
                  Edit
                </a>
                <button
                  onClick={() => deleteWidget(w)}
                  className="px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
        {widgets.length === 0 && (
          <li className="p-4 text-gray-500 text-center py-8">
            <div className="text-lg font-medium mb-2">No widgets yet</div>
            <div className="text-sm">Create your first widget to get started</div>
          </li>
        )}
      </ul>
    </div>
  );
}
