import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ publicKey: string }> }
) {
  const { publicKey } = await ctx.params;
  const APP = process.env.NEXT_PUBLIC_APP_URL || "";
  
  const code = `
  (function(){
    const KEY = "${publicKey}";
    const APP = "${APP}";
    const mountId = "xw-" + KEY;

    var mount = document.getElementById(mountId);
    if(!mount){
      mount = document.createElement('div');
      mount.id = mountId;
      document.currentScript.insertAdjacentElement('afterend', mount);
    }

    // Track impression on load
    fetch(APP + "/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey: KEY, type: "impression" })
    }).catch(err => console.error("Impression tracking failed:", err));

    fetch(APP + "/api/public/widget/" + KEY)
      .then(r => r.json())
      .then(cfg => {
        if(!cfg || cfg.error) throw new Error("Widget not found");

        if (cfg.type === "contact_form") {
          mount.innerHTML = '<div style="font-family:system-ui;border:1px solid #ddd;padding:12px;border-radius:10px;max-width:420px;">'
            + '<h3>' + (cfg.config.title || 'Contact us') + '</h3>'
            + '<form id="xw-form">'
            + '<input name="name" placeholder="Your name" style="width:100%;padding:8px;margin:6px 0;">'
            + '<input name="email" placeholder="Email" style="width:100%;padding:8px;margin:6px 0;">'
            + '<textarea name="message" placeholder="Message" style="width:100%;padding:8px;margin:6px 0;"></textarea>'
            + '<button type="submit" style="padding:8px 12px;">' + (cfg.config.buttonText || 'Send') + '</button>'
            + '</form>'
            + '<div id="xw-success" style="display:none;color:green;margin-top:10px;">Message sent successfully!</div>'
            + '</div>';

          // Handle form submission
          document.getElementById('xw-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const payload = {
              name: formData.get('name'),
              email: formData.get('email'),
              message: formData.get('message')
            };

            // Track click event
            fetch(APP + "/api/events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicKey: KEY, type: "click", meta: { action: "submit" } })
            }).catch(err => console.error("Click tracking failed:", err));

            // Submit the form data
            fetch(APP + "/api/submissions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicKey: KEY, payload })
            })
            .then(r => r.json())
            .then(result => {
              if (result.ok) {
                document.getElementById('xw-success').style.display = 'block';
                e.target.reset();
              } else {
                console.error("Submission failed:", result.error);
              }
            })
            .catch(err => console.error("Submission error:", err));
          });
        }
      })
      .catch(err => console.error("Widget error:", err));
  })();`;

  return new NextResponse(code, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60"
    }
  });
}
