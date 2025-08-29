"use client";
import { useEffect, useState } from "react";

type Widget = { id:string; name:string; type:string; public_key:string; status:string; config:Record<string, string> };

export default function WidgetDetail({ params }: { params: Promise<{ id: string }> }) {
  const [w, setW] = useState<Widget | null>(null);
  const [title, setTitle] = useState("");
  const [buttonText, setButtonText] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/widgets/${id}`)
        .then(r => r.json())
        .then((data: Widget) => {
          setW(data);
          setTitle(data.config?.title || "");
          setButtonText(data.config?.buttonText || "");
        });
    });
  }, [params]);

  const save = async () => {
    if (!w) return;
    const res = await fetch(`/api/widgets/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: { ...w.config, title, buttonText }
      })
    });
    const updated = await res.json();
    if (res.ok) setW(updated);
    else alert(updated.error || "Error");
  };

  if (!w) return <div className="p-6">Loading…</div>;

  const embed = `<div id="xw-${w.public_key}"></div>\n<script async src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${w.public_key}"></script>`;

  return (
    <div className="max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{w.name}</h1>

      <div className="space-y-3 rounded border p-4">
        <div className="font-medium">Config</div>
        <label className="block text-sm">Title</label>
        <input
          className="border px-3 py-2 rounded w-full"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <label className="block text-sm mt-2">Button text</label>
        <input
          className="border px-3 py-2 rounded w-full"
          value={buttonText}
          onChange={e => setButtonText(e.target.value)}
        />
        <button
          onClick={save}
          className="mt-3 px-4 py-2 rounded bg-black text-white"
        >
          Save
        </button>
      </div>

      <div className="space-y-2 rounded border p-4">
        <div className="font-medium">Embed code</div>
        <textarea
          readOnly
          value={embed}
          className="w-full h-24 border rounded p-2 font-mono text-sm"
        />
      </div>
    </div>
  );
}
