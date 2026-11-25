/* mish.obsidian · the suite site */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ── theme ───────────────────────────────────────────────────────── */

  var root = document.documentElement;
  var toggle = $("#theme-toggle");
  var label = toggle && toggle.querySelector(".toggle-label");
  var stored = null;
  try { stored = localStorage.getItem("mish-theme"); } catch (e) { /* private mode */ }

  function setTheme(name, persist) {
    root.setAttribute("data-theme", name);
    if (label) label.textContent = name;
    if (toggle) toggle.setAttribute("aria-pressed", String(name === "light"));
    if (persist) {
      try { localStorage.setItem("mish-theme", name); } catch (e) { /* ignore */ }
    }
  }

  if (stored === "light" || stored === "dark") setTheme(stored, false);
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) setTheme("light", false);

  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  /* ── clock ───────────────────────────────────────────────────────── */

  var clock = $("#clock");
  function tick() {
    if (!clock) return;
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    clock.textContent = hh + ":" + mm;
  }
  tick();
  window.setInterval(tick, 15000);

  /* ── toast ───────────────────────────────────────────────────────── */

  var toast = $("#toast");
  var toastTimer = 0;
  function say(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 1800);
  }

  /* ── filters and search ──────────────────────────────────────────── */

  var cards = $$(".card");
  var tabs = $$(".tab");
  var search = $("#search");
  var empty = $("#empty-state");
  var currentFilter = "all";

  function apply() {
    var query = (search && search.value || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var kind = card.getAttribute("data-kind");
      var haystack = (card.getAttribute("data-name") + " " + card.textContent).toLowerCase();
      var kindOk = currentFilter === "all" || kind === currentFilter;
      var queryOk = !query || haystack.indexOf(query) !== -1;
      var visible = kindOk && queryOk;
      card.classList.toggle("is-hidden", !visible);
      if (visible) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      currentFilter = tab.getAttribute("data-filter");
      tabs.forEach(function (other) {
        var on = other === tab;
        other.classList.toggle("is-active", on);
        other.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        search.value = "";
        apply();
        search.blur();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    var target = event.target;
    var tag = target && target.tagName ? target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || (target && target.isContentEditable)) return;
    event.preventDefault();
    if (search) search.focus();
  });

  /* ── copy buttons ────────────────────────────────────────────────── */

  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();

    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(area);
      if (ok) done();
      else say("copy failed. the old-fashioned way is still available.");
    }
  }

  $$(".copy").forEach(function (button) {
    button.addEventListener("click", function () {
      copy(button.getAttribute("data-copy"), function () {
        button.classList.add("is-copied");
        var old = button.textContent;
        button.textContent = "copied";
        say("command copied. paste it in your vault.");
        window.setTimeout(function () {
          button.classList.remove("is-copied");
          button.textContent = old;
        }, 1600);
      });
    });
  });

  $$(".swatch-card").forEach(function (button) {
    button.addEventListener("click", function () {
      copy(button.getAttribute("data-hex"), function () {
        say(button.getAttribute("data-hex") + " copied.");
      });
    });
  });

  /* ── the little shell ────────────────────────────────────────────── */

  var shell = $("#shell");
  var form = $("#shell-form");
  var input = $("#shell-input");
  var clear = $("#shell-clear");
  if (!shell || !form || !input) return;

  var history = [];
  var historyAt = 0;
  var plugins = [
    { name: "mish.shell", id: "mish-shell", kind: "theme", repo: "mish.shell" },
    { name: "mish.home", id: "mish-home", kind: "plugin", repo: "mish.home" },
    { name: "mish.eza", id: "mish-eza", kind: "plugin", repo: "mish.eza" },
    { name: "mish.fastfetch", id: "mish-fastfetch", kind: "plugin", repo: "mish.fastfetch" },
    { name: "mish.backlinks", id: "mish-backlinks", kind: "plugin", repo: "mish.backlinks" },
    { name: "mish.outlinks", id: "mish-outlinks", kind: "plugin", repo: "mish.outlinks" },
    { name: "mish.music", id: "mish-music", kind: "plugin", repo: "mish.music" },
    { name: "mish.calendar", id: "mish-calendar", kind: "plugin", repo: "mish.calendar" },
    { name: "mish.localgraph", id: "mish-localgraph", kind: "plugin", repo: "mish.localgraph" }
  ];
  var commands = ["help", "ls", "plugins", "open", "theme", "palette", "fastfetch", "whoami", "date", "cat", "github", "install", "echo", "clear"];

  function escape(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function line(html, cls) {
    var row = document.createElement("div");
    row.className = "shell-line" + (cls ? " " + cls : "");
    row.innerHTML = html;
    shell.appendChild(row);
    shell.scrollTop = shell.scrollHeight;
  }

  function out(text, cls) {
    line('<span class="out">' + escape(text) + "</span>", cls);
  }

  function echoCommand(raw) {
    line('<span class="prompt-chev">❯</span><span class="cmd">' + escape(raw) + "</span>");
  }

  function findPlugin(name) {
    var needle = String(name || "").toLowerCase().replace(/^mish\./, "").replace(/^mish-/, "");
    for (var i = 0; i < plugins.length; i++) {
      var short = plugins[i].name.replace(/^mish\./, "");
      if (short === needle || plugins[i].name === "mish." + needle || plugins[i].id === "mish-" + needle) return plugins[i];
    }
    return null;
  }

  var handlers = {
    help: function () {
      out("available commands:");
      out("  help                 this page");
      out("  ls / plugins         list the suite");
      out("  open <name>          jump to a plugin card");
      out("  install <name>       print an install command");
      out("  theme [light|dark]   change the lights");
      out("  palette              the six pastels");
      out("  fastfetch            a summary of the suite");
      out("  whoami / date        the obvious things");
      out("  cat readme.md        the short version");
      out("  github               open the source");
      out("  echo <text>          say it back");
      out("  clear                tidy the screen");
      out("tab completes, up and down remember.");
    },
    ls: function (args) {
      var target = (args[0] || "").toLowerCase();
      if (target && target !== "plugins" && target !== "~/obsidian") {
        out("ls: " + args[0] + ": no such directory");
        return;
      }
      var names = plugins.map(function (p) {
        return '<span class="' + (p.kind === "theme" ? "ok" : "hl") + '">' + p.name + (p.kind === "theme" ? ".css" : "/") + "</span>";
      });
      line('<span class="out">' + names.join("  ") + "</span>");
    },
    plugins: function () {
      out(plugins.length + " packages: 1 theme, 8 plugins. every one is a separate repo.");
    },
    open: function (args) {
      if (!args[0]) { out("usage: open <name>"); return; }
      var plugin = findPlugin(args[0]);
      if (!plugin) { out("open: " + args[0] + ": not in the suite", "err"); return; }
      var card = document.getElementById(plugin.id);
      if (!card) { out("that card is hiding. try the search box."); return; }
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("is-target");
      window.setTimeout(function () { card.classList.remove("is-target"); }, 1600);
      out("opened " + plugin.name + ".");
    },
    install: function (args) {
      if (!args[0]) { out("usage: install <name>"); return; }
      var plugin = findPlugin(args[0]);
      if (!plugin) { out("install: " + args[0] + ": not in the suite", "err"); return; }
      var folder = plugin.kind === "theme" ? ".obsidian/themes/" + plugin.id : ".obsidian/plugins/" + plugin.id;
      var command = "git clone https://github.com/mishtiiikrishnaa/" + plugin.repo + ".git " + folder;
      line('<span class="hl">' + escape(command) + "</span>");
      copy(command, function () { say("command copied."); });
    },
    theme: function (args) {
      var want = (args[0] || "").toLowerCase();
      if (want !== "light" && want !== "dark") {
        setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
        out("switched to " + root.getAttribute("data-theme") + ".");
      } else {
        setTheme(want, true);
        out("switched to " + want + ".");
      }
    },
    palette: function () {
      line('<span class="rainbow">pink · peach · yellow · green · blue · lilac</span>');
      out("#ffa6c9  #ffd6a6  #fff1a8  #c9ffa6  #a6c9ff  #c9b0ff");
    },
    fastfetch: function () {
      line('<span class="hl">user</span>      mishti@macbook');
      line('<span class="hl">os</span>        macOS · obsidian');
      line('<span class="hl">theme</span>     mish.shell 1.7.45');
      line('<span class="hl">plugins</span>   mish.home · mish.eza · mish.fastfetch · mish.backlinks');
      line('<span class="hl">          </span>mish.outlinks · mish.music · mish.calendar · mish.localgraph');
      line('<span class="rainbow">████ ████ ████ ████ ████ ████</span>');
    },
    whoami: function () { out("mishti. professional note-taker, amateur terminal enthusiast."); },
    date: function () { out(new Date().toString().toLowerCase()); },
    cat: function (args) {
      if (!args[0] || !/readme/i.test(args[0])) { out("cat: " + (args[0] || "") + ": no such file"); return; }
      out("mish: an obsidian theme and eight plugins, built to feel like one terminal.");
      out("same pastel rainbow, same typewriter, same lowercase manners.");
      out("start with mish.shell, then take whichever panels you actually use.");
    },
    github: function () {
      out("opening github…");
      window.open("https://github.com/mishtiiikrishnaa/mish.obsidian", "_blank", "noopener");
    },
    echo: function (args) { out(args.join(" ")); },
    clear: function () { shell.innerHTML = ""; }
  };

  function run(raw) {
    var text = raw.trim();
    if (!text) return;
    history.push(text);
    historyAt = history.length;
    echoCommand(text);

    var parts = text.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (name === "sudo") { out("nice try. this is a website, not a liability.", "err"); return; }
    if (name === "rm") { out("nothing here is yours to delete. emotionally speaking.", "err"); return; }
    if (name === "exit" || name === "quit") { out("there is no exit. only esc."); return; }

    var handler = handlers[name];
    if (!handler) {
      out("zsh: command not found: " + parts[0], "err");
      out("type help, or use the buttons like a civilised person.");
      return;
    }
    handler(args);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
      if (!history.length) return;
      event.preventDefault();
      historyAt = Math.max(0, historyAt - 1);
      input.value = history[historyAt] || "";
      window.setTimeout(function () { input.setSelectionRange(input.value.length, input.value.length); }, 0);
    } else if (event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      historyAt = Math.min(history.length, historyAt + 1);
      input.value = history[historyAt] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      var value = input.value;
      var bits = value.split(/\s+/);
      var last = bits[bits.length - 1] || "";
      if (bits.length <= 1) {
        var matches = commands.filter(function (command) { return command.indexOf(last.toLowerCase()) === 0; });
        if (matches.length === 1) input.value = matches[0] + " ";
        else if (matches.length > 1) out(matches.join("  "));
      } else {
        var options = plugins.map(function (p) { return p.name; });
        var found = options.filter(function (option) { return option.indexOf(last.toLowerCase()) === 0; });
        if (found.length === 1) input.value = bits.slice(0, -1).join(" ") + " " + found[0] + " ";
        else if (found.length > 1) out(found.join("  "));
      }
    }
  });

  if (clear) {
    clear.addEventListener("click", function () {
      shell.innerHTML = "";
      input.focus();
    });
  }

  shell.addEventListener("click", function () { input.focus(); });
  input.addEventListener("focus", function () { shell.classList.add("is-focused"); });
  input.addEventListener("blur", function () { shell.classList.remove("is-focused"); });
})();
