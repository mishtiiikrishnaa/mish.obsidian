# mish.obsidian

the mish suite: a terminal-inspired obsidian theme and eight plugins that share one palette, one typewriter, and one set of lowercase manners.

**website → [mishtiiikrishnaa.github.io/mish.obsidian](https://mishtiiikrishnaa.github.io/mish.obsidian/)**

the site source lives in [`docs/`](docs/). it is plain html, css and javascript. no build step, no framework, no analytics.

---

## the suite

| | what it is |
|---|---|
| **[mish.shell](https://github.com/mishtiiikrishnaa/mish.shell)** | the theme. lowercase interface, powerline prompts, rainbow trim, terminal / powerline / tmux / vim tabs, themed cursors and bundled fonts. |
| **[mish.home](https://github.com/mishtiiikrishnaa/mish.home)** | the page you open obsidian to. clock, weather, todos, countdowns, focus timer, system stats, shortcuts and a real little terminal. no scrolling. |
| **[mish.eza](https://github.com/mishtiiikrishnaa/mish.eza)** | your file explorer as `eza --tree` under a starship prompt, with a small shell for `touch`, `mkdir`, `rename`, `mv`, `cp` and `rm`. |
| **[mish.fastfetch](https://github.com/mishtiiikrishnaa/mish.fastfetch)** | a starship prompt and a fastfetch summary of your vault in the sidebar: notes, links, folders, files, size and uptime. |
| **[mish.backlinks](https://github.com/mishtiiikrishnaa/mish.backlinks)** | a backlinks pane styled like a terminal: prompt, eza-style tree, context lines, tiny command line and an unlinked-mentions tab. |
| **[mish.outlinks](https://github.com/mishtiiikrishnaa/mish.outlinks)** | the forward-links pane, dressed the same way. every note this one points at, read like shell output. |
| **[mish.music](https://github.com/mishtiiikrishnaa/mish.music)** | a starship-style now-playing card. controls Music.app or a Safari tab, with seek, shuffle, repeat and system volume. macOS only. |
| **[mish.calendar](https://github.com/mishtiiikrishnaa/mish.calendar)** | a powerline calendar of notes by their `created` / `date` properties, with daily counts, month totals and a browsable note list. |
| **[mish.localgraph](https://github.com/mishtiiikrishnaa/mish.localgraph)** | obsidian's built-in local graph in the mish look: rainbow ring, powerline prompt and terminal-style controls. |

## install

**the theme.** put `theme.css` and `manifest.json` in `<vault>/.obsidian/themes/mish.shell/`, then choose **mish.shell** in settings → appearance → themes. install the community plugin **style settings** for the font, colour and cursor options.

**the plugins.** download `main.js`, `manifest.json` and `styles.css` from a release, or clone a repo into `<vault>/.obsidian/plugins/<id>/`. reload obsidian, then switch the plugin on under settings → community plugins.

**with brat.** add any repo below as a beta plugin:

```
mishtiiikrishnaa/mish.home
mishtiiikrishnaa/mish.eza
mishtiiikrishnaa/mish.fastfetch
mishtiiikrishnaa/mish.backlinks
mishtiiikrishnaa/mish.outlinks
mishtiiikrishnaa/mish.music
mishtiiikrishnaa/mish.calendar
mishtiiikrishnaa/mish.localgraph
```

leave settings → appearance → fonts empty so the bundled fonts win.

## the palette

```
pink    #ffa6c9
peach   #ffd6a6
yellow  #fff1a8
green   #c9ffa6
blue    #a6c9ff
lilac   #c9b0ff
```

six pastels, mixed in oklab so the rainbow never goes dull in the middle.

## run the site locally

```sh
cd docs
python3 -m http.server 8000
```

then open <http://localhost:8000>. or just open `docs/index.html`.

## licence

mit. each plugin repo carries its own copy.
