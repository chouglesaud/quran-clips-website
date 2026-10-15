// Theme toggle, the contact form, and one anonymous page count. No libraries, no cookies, no tracking of people.
(function () {
  "use strict";

  // ---- one anonymous count per page view ----
  // Adds 1 to a daily total on our own server ("website: home was viewed"). Nothing identifies the visitor: no cookie, no
  // id, and the server does not keep addresses. It is skipped if the browser says Do Not Track or Global Privacy Control.
  (function () {
    var cfg = window.QURAN_CLIPS_SITE || {};
    var dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true;
    if (dnt || !cfg.apiUrl) return;
    var path = location.pathname;
    var name = /contact/.test(path) ? "site_view_contact" : /privacy/.test(path) ? "site_view_privacy" : "site_view_home";
    try {
      fetch(String(cfg.apiUrl).replace(/\/+$/, "") + "/api/event", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: name }), keepalive: true }).catch(function () {});
    } catch (e) { /* counting is optional */ }
  })();

  // ---- light / dark ----
  var themeBtn = document.getElementById("theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode: the choice just is not remembered */ }
    });
  }

  // ---- contact form ----
  var form = document.getElementById("form");
  if (!form) return;
  var cfg = window.QURAN_CLIPS_SITE || {};
  var $ = function (id) { return document.getElementById(id); };
  var message = $("message"), count = $("count"), status = $("status"), send = $("send"), done = $("done"), bugfields = $("bugfields"), help = $("help");

  if (cfg.contactEmail) {
    var direct = $("direct");
    direct.hidden = false;
    direct.textContent = "You can also write to ";
    var a = document.createElement("a");
    a.href = "mailto:" + cfg.contactEmail;
    a.textContent = cfg.contactEmail;
    direct.appendChild(a);
    direct.appendChild(document.createTextNode("."));
  }

  var HELP = {
    bug: "What happened? What did you expect? What did you do just before?",
    feature: "What would you like the app to do, and what problem would it solve for you?",
    other: "What would you like to say?"
  };
  function type() { return (form.querySelector('input[name="type"]:checked') || {}).value || "bug"; }
  function onType() {
    help.textContent = HELP[type()];
    bugfields.hidden = type() !== "bug";
  }
  form.querySelectorAll('input[name="type"]').forEach(function (r) { r.addEventListener("change", onType); });
  onType();

  message.addEventListener("input", function () { count.textContent = message.value.length + " / 4000"; });

  function say(text, isError) {
    status.textContent = text;
    status.className = "status" + (isError ? " err" : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    say("", false);
    var text = message.value.trim();
    if (text.length < 10) { say("Please write a little more, so we can understand it (at least 10 characters).", true); message.focus(); return; }
    var email = form.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { say("That email address does not look right. Leave it empty if you do not want a reply.", true); form.email.focus(); return; }

    send.disabled = true;
    send.textContent = "Sending…";
    var body = { type: type(), message: text, email: email, device: form.device.value.trim(), version: form.version.value.trim(), website: form.website.value };
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);

    fetch(String(cfg.apiUrl || "").replace(/\/+$/, "") + "/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
      })
      .then(function (r) {
        if (r.ok) {
          form.hidden = true;
          done.hidden = false;
          done.focus();
          return;
        }
        say(r.status === 429 ? "You have sent a few already. Please try again in a little while." : (r.data && r.data.error) || "Something went wrong. Please try again.", true);
      })
      .catch(function () { say("Could not reach the server. Please check your connection and try again.", true); })
      .then(function () {
        clearTimeout(timer);
        send.disabled = false;
        send.textContent = "Send";
      });
  });

  $("again").addEventListener("click", function () {
    form.reset();
    count.textContent = "0 / 4000";
    onType();
    say("", false);
    done.hidden = true;
    form.hidden = false;
    message.focus();
  });
})();
