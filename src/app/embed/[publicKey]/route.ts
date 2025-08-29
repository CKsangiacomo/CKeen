import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ publicKey: string }> }
) {
  const { publicKey } = await ctx.params;
  const APP = process.env.NEXT_PUBLIC_APP_URL!;
  
  const code = `
  (function(){
    const KEY = "${publicKey}";
    const APP = "${APP}";
    
    var css = \`
      :host { all: initial; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; color: #0b0f15; }
      .card { box-sizing:border-box; width:100%; max-width: 520px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
      .title { font-size:20px; font-weight:600; letter-spacing:-0.01em; margin:4px 0 12px; }
      .row { display:flex; flex-direction:column; gap:6px; margin:10px 0; }
      label { font-size:12px; color:#6b7280; }
      input, textarea { width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; outline:none; font-size:14px; }
      input:focus, textarea:focus { border-color:#4f46e5; box-shadow:0 0 0 3px rgba(79,70,229,0.15); }
      button { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; background:#111827; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; }
      button:hover { filter:brightness(0.95); }
      button:active { transform:translateY(1px); }
      button:disabled { opacity:0.6; cursor:not-allowed; }
      .success { margin-top:12px; color:#16a34a; font-weight:500; opacity:0; transition:opacity .2s ease; }
      .success.show { opacity:1; }
    \`;
    
    function mount() {
      var host = document.getElementById("xw-" + KEY);
      if (!host) return setTimeout(mount, 50);
      
      var root = host.shadowRoot || host.attachShadow({ mode: "open" });
      
      // Track impression on first mount
      try {
        fetch(APP + "/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: KEY, type: "impression" })
        }).catch(err => console.error("Impression tracking failed:", err));
      } catch (err) {
        console.error("Impression tracking error:", err);
      }

      try {
        fetch(APP + "/api/public/widget/" + KEY)
          .then(r => r.json())
          .then(CFG => {
            if(!CFG || CFG.error) throw new Error("Widget not found");

            if (CFG.type === "contact_form") {
              var html = \`
                <div class="card">
                  <div class="title">\${CFG?.config?.title || "Contact us"}</div>
                  <form id="xw-form">
                    <div class="row"><label for="xw-name">Your name</label><input id="xw-name" name="name" placeholder="Jane Doe" autocomplete="name" /></div>
                    <div class="row"><label for="xw-email">Email</label><input id="xw-email" name="email" type="email" placeholder="you@domain.com" autocomplete="email" /></div>
                    <div class="row"><label for="xw-message">Message</label><textarea id="xw-message" name="message" rows="4" placeholder="How can we help?"></textarea></div>
                    <button type="submit" id="xw-submit">\${CFG?.config?.buttonText || "Send"}</button>
                    <div class="success" id="xw-success">Message sent successfully!</div>
                  </form>
                </div>\`;
              
              // Create and inject styles
              var style = document.createElement('style');
              style.textContent = css;
              root.appendChild(style);
              
              // Create and inject HTML
              var container = document.createElement('div');
              container.innerHTML = html;
              root.appendChild(container);

              // Handle form submission
              var form = root.getElementById('xw-form');
              var submitBtn = root.getElementById('xw-submit');
              var successEl = root.getElementById('xw-success');
              
              form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Disable button while sending
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                const formData = new FormData(e.target);
                const payload = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  message: formData.get('message')
                };

                // Track click event
                try {
                  fetch(APP + "/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publicKey: KEY, type: "click", meta: { action: "submit" } })
                  }).catch(err => console.error("Click tracking failed:", err));
                } catch (err) {
                  console.error("Click tracking error:", err);
                }

                // Submit the form data
                try {
                  fetch(APP + "/api/submissions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publicKey: KEY, payload })
                  })
                  .then(r => r.json())
                  .then(result => {
                    if (result.ok) {
                      // Show success message with animation
                      successEl.classList.add('show');
                      
                      // Reset form
                      e.target.reset();
                      
                      // Hide success message after 3 seconds
                      setTimeout(() => {
                        successEl.classList.remove('show');
                      }, 3000);
                    } else {
                      console.error("Submission failed:", result.error);
                    }
                  })
                  .catch(err => console.error("Submission error:", err))
                  .finally(() => {
                    // Re-enable button
                    submitBtn.disabled = false;
                    submitBtn.textContent = CFG?.config?.buttonText || "Send";
                  });
                } catch (err) {
                  console.error("Submission request error:", err);
                  submitBtn.disabled = false;
                  submitBtn.textContent = CFG?.config?.buttonText || "Send";
                }
              });
            }
          })
          .catch(err => console.error("Widget error:", err));
      } catch (err) {
        console.error("Widget fetch error:", err);
      }
    }
    
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }
  })();`;

  return new NextResponse(code, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60"
    }
  });
}
