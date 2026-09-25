# Changelog

## [Unreleased]

- Fixed
    - The deeper stream check retired region-locked channels: RTVE (La 1, Clan, Teledeporte) serve their playlist with CORS but answer 403 to the video segments from GitHub's US runner. A segment 403 behind a CORS-approved playlist is now reported as a probable region lock and the channel is kept. A segment 404 is retried once, since live playlists rotate their segment window.

- Added
    - A test that every channel in the default grid is still in `tv-channels.json`, so a maintenance PR that retires one fails CI instead of leaving new visitors with an empty tile.

## [v0.25]

- Fixed
    - Twitch signals never played outside the original project's domain: the embed's required `parent` was hardcoded to `alplox.github.io`. It now uses the current host.
    - A failed m3u8 only fell back to YouTube; channels without a YouTube id but with an embed page or Twitch channel showed an error instead of using them.
    - The "server refused the stream" message only blamed CORS; a browser cannot tell that apart from a region lock, so the message now names both.
    - The page always had a vertical scrollbar: the grid was sized to `100vh` underneath the top bar, and in 16:9 mode extra rows grew the page further. The page is now exactly the viewport (`100dvh`, following the mobile address bar) and a new fit step sizes tiles so every row is on screen: full-height mode splits the height between rows; 16:9 mode keeps the ratio and narrows/centres the grid.
    - Channels were marked "unavailable" when `play()` was merely interrupted (the off-screen pause from the visibility observer) or autoplay was blocked. Those rejections no longer dispose the player; real stream failures still arrive through the player's `error` event.
    - The single-view "Filter by country" button shared an id with the side panel's filter group, so it toggled the wrong panel.
    - "Filter by country" and "Sort" were never translated.
    - Every channel overlay repeated the same five element ids; they are classes now.

- Changed
    - `tools/check_cors_channels.js` now follows the stream like the player does — playlist → first variant → first segment, with the site's `Origin` and redirects — so channels whose playlist answers but whose segments are dead or lack CORS are caught (`--shallow` restores the old playlist-only check). Covered by tests against a local HLS server.
    - Dependabot opens weekly PRs for GitHub Actions updates and monthly ones for dev dependencies.
    - The top bar is hidden by default; the bottom bar and settings cover everything it did. The language switch moved into Settings, and the top bar can still be turned on there ("Top bar").
    - video.js (was unpinned "latest") and SortableJS (was `@latest`) are pinned to 8.24.1 and 1.15.7, so a new major release cannot silently break playback.

- Removed
    - `json-tv/tv-channels.m3u` (53 KB, unused since the IPTV mode was removed) and its constant.

## [v0.24]

Also covers the v0.23 changes, which were tagged without their own section.

- Fixed
    - Repository, issue and site links pointed at the old `interneto` repo; they now point to https://github.com/MediaHub-Org/tv-multiview and https://mediahub-org.github.io/tv-multiview/. The CORS check sends the new site's `Origin`.
    - The service worker ran Workbox 5.1.2 (2020); it now loads 7.3.0, and the script route passes the request explicitly as Workbox 6+ requires.
    - Channel names were rendered with `innerHTML` unescaped and the channel `website` went straight into the overlay link's `href`. The catalogue is partly merged from external lists, so a crafted name or a `javascript:` URL could run script. Names are now escaped, and only absolute http(s) websites are linked (anything else falls back to a search, whose query is now URL-encoded).
    - A healthy player kept its concurrency slot for as long as it played, so with more working channels than slots the last ones never started (the 9-channel default grid left one tile black). The slot is now released once the stream is up: the cap throttles loading, not playback.
    - Channels whose only signal is a platform id (`yt_id`, `twitch_id`…) were treated as having no usable signal and their buttons were hidden, because the check demanded an `http` URL.
    - Disposing an already-disposed player threw "Invalid target for null#trigger" inside video.js when a stream failed through two paths at once (load timeout and `error`).
    - Both social preview meta tags pointed at `shots_tv-multiview_*.webp` while the files were still named `shots_teles_*.webp`, so link previews had no image. Files renamed, URLs made absolute.
    - The "Reiniciar almacenamiento local" button on the channel-load error screen had no handler and did nothing.
    - Accessibility: the overlay "official page" link lost its accessible name whenever overlay text was hidden, the channel-selector button's `aria-label` did not include its visible text, and the language buttons were below the AA contrast ratio in both themes. Lighthouse accessibility 87 → 95.
    - The video.js control bar was clipped and misaligned: a blanket `font-size` boost on the buttons broke the em scale video.js uses (icon box 4.2em inside a 3em bar, buttons 40px → 56px), cutting off the subtitles button at the bottom and pushing the right-hand controls out of narrow cells. The bar now sets a single 12px base that everything scales from, with slimmer buttons, hover/focus states and a matching subtitle-track offset.
    - Overlay row: buttons without `align-items-center` sat at different heights, the fixed `1.5em` flag width stretched square and vertical flags, and the hardcoded `padding-bottom: 3px` nudge left them off the baseline. Buttons are now centred with a common 24px minimum target and flags keep their own aspect ratio.

- Added
    - `pnpm run typecheck` (`tsc` over the `checkJs` setup), now also run in CI so the TypeScript migration cannot regress.
    - Weekly `Channel maintenance` workflow: health check → CORS check → YouTube fallbacks → https upgrade → prune, opening a PR with the diff.
    - `tools/check_cors_channels.js`: checks whether a stream is usable _from a browser_. The reachability check runs in Node, which ignores the same-origin policy, so servers that answer 200 without a usable `Access-Control-Allow-Origin` used to pass while never playing a frame.
    - `tools/upgrade_insecure_streams.js`: probes the https twin of every plain-http stream, upgrades it when it answers and retires it when it does not.
    - Keyboard reordering of channels with the arrow keys on the overlay "Move" button; drag-and-drop was pointer-only.
    - A confirmation dialog for "Load defaults", with the option to add only the missing channels instead of replacing the current selection.
    - Explicit service worker registration, no longer dependent on the CDN-loaded `<pwa-update>` component.
    - Tests for the player-slot queue and the player sizing options (19 in total).
    - JSDoc on every helper.

- Changed
    - CI actions moved to their Node 24 releases.
    - The Pages deploy no longer publishes dev tooling (`tools/`, tests, lockfile, lint/format configs).
    - Dropped the stale `package-lock.json`; pnpm is the package manager.
    - The channel catalog backup moved from localStorage to IndexedDB, with automatic migration and a localStorage fallback.
    - PWA screenshots converted to WebP: 1.90 MB → 244 KB.
    - Default grid: `skynews` and `bbearth` (CORS-blocked), `m6` (plain http, no https twin) replaced by `dw`, `cgtndocumentary` and `tvmonaco`.

- Removed
    - Retired 35 channels that cannot play on the published site (dead links, plain-http with no https twin, or CORS-blocked with no fallback); 117 → 96 active. All of them are kept in `inactive.json`.
    - The 2026-08-24 maintenance run retired 3 more dead streams (CGTN Russian, Global TV SD, Las Estrellas); 93 active.

## [v0.22]

- Fixed
    - Player-slot queue could deadlock: a hung stream that never fires `error` held its concurrency slot forever, starving every queued channel behind it. Added a load timeout that frees the slot and shows a proper error instead.
    - Video played correctly but rendered at 0 height: `fluid: true` fought the Bootstrap `.ratio` wrapper's own sizing, so video.js's aspect-ratio calculation never applied. Switched to `fill: true`.
    - Capped concurrent player instantiation and pause/resume off-viewport tiles via IntersectionObserver, fixing spurious "unavailable" errors caused by resource contention when loading many channels at once.
    - Auto-fallback to a channel's YouTube signal when its m3u8 stream errors out, instead of just showing "unavailable".
    - Share links used Spanish param/value names and a comma separator that needed percent-encoding; switched to `channels=a.b.c&layout=grid`. Old-format links now fall back to defaults instead of crashing.
    - Renamed the "3/24" channel key to "3-24" to match the project's channel-key format, with a legacy alias so existing shared links/bookmarks keep working.
    - Fixed the "t13" channel entry using Spanish property names, which made the app treat it as having no signals.
    - Fixed the settings summary panel showing "Layout" as every row's label due to a selector bug, and wired up two values and the navbar's active-signal label that were never translated at all.
    - Fixed the active-channel count only counting grid-view channels, reading 0/stale in single-view mode.
    - `eslint`/`prettier` were re-linting a nested git worktree with the wrong config, producing hundreds of false-positive errors; excluded it and closed the real formatting debt.
    - `validate_json_light.js` was rejecting the schema-valid `category` property on ~60 channels.

- Added
    - GitHub Actions CI running lint, format check, and channel-data validation on every push/PR.
    - `.gitattributes` pinning LF line endings to stop Windows checkouts from fighting Prettier's line-ending default.

- Removed
    - Pruned 77 channels with a dead stream and no usable fallback; 8 others gained a YouTube fallback and were kept.
    - Dropped a stale, zero-consumer channel-check report and the dead `active` property left on 21 channel entries.

## [v0.21]

- Fixed
    - Player lifecycle: dispose the video.js player before removing its container on channel/signal replacement, preventing leaked players and orphaned HLS requests.
    - Defer video.js initialization until the element is attached to the DOM, removing the "element supplied is not included in the DOM" warning.
    - Hero title was invisible due to a stale `-webkit-text-fill-color: transparent` left over from the gradient-text style.

- Added
    - Stream error classification (mixed content, CORS-blocked, network unreachable, failed segment, possibly expired token) shown to the user instead of a generic "Stream unavailable".
    - Skip instantiating the player for http:// sources on an https page, since mixed content is always blocked by the browser.
    - Hero/splash card now only appears at startup and when there are no active channels, with an entrance animation.

- Changed
    - Simplified the hero card to just the logo, title, and version badge.

## [v0.20]

- Changed
    - Translate to English
    - Remove extra buttons (time)
    - Simplify interface
    - Reduce redundant channels and add more famous
    - Create new default channels
    - Simplify convert from json to m3u
    - Add tools to check, validate and create reports

## [v0.19]

- Changed
    - Updated README.md and NOTICE.md files to improve readability and link formatting.
    - Functions moved to modules for better organization.
    - Applied functions to check for the existence of elements and methods before operating on them in multiple JS files to avoid runtime errors.

- Added
    - Added checks for the existence of elements and methods before operating on them in multiple JS files to avoid runtime errors.
    - Improved compatibility and robustness in DOM manipulation, events, and local storage.
    - lite-youtube-embed for YouTube loading for yt_embed and yt_playlist cases.

- Fixed
    - Overflow of countries buttons in modals to change active channel.
    - Suspension of m3u8 signals loaded with VideoJS correctly, so that they do not continue in the background after removing the element from the DOM.

## [v0.18]

- Changed
    - Refactored JS code.
    - Combined signals for the same channel into a single button.
    - Preview images

- Added
    - Option to modify active channel signal, along with saving the selected option to local storage for future loads.
    - Increased number of checks for channel loading to avoid errors that render the site unusable.
    - Experimental option to load IPTV channels from [https://github.com/iptv-org/iptv](https://github.com/iptv-org/iptv) (due to performance issues, leave it manually enabled in offcanvas customizations).
    - More channels, signals, logos for channels (optional from code).
    - Option to switch between "grid" and "single" view, along with remembering the selected option.
    - Option to switch to 100% screen height in "grid" view.

## [v0.17]

- Changed
    - Rewrote channel filter to take into account if the filter by country is pressed so that the user input is within that active country.
    - F_ordenBotones rewritten to include dynamic modal for changing active signal, saving the original order of buttons before sorting in ascending/descending order.
    - Active channel container div now uses 100vh.
    - Global redesign
    - PWA manifesto images and repository preview (thanks to [https://shots.so/](https://shots.so/), [https://pixlr.com/es/express/,](https://pixlr.com/es/express/) and [https://progressier.com/pwa-screenshots-generator](https://progressier.com/pwa-screenshots-generator))
    - JS structure by modules

- Added
    - PWA install button using [https://github.com/khmyznikov/pwa-install](https://github.com/khmyznikov/pwa-install)
    - Alert when internet connection is lost
    - Hide overlay button text according to general div size to avoid overflow in small sizes
    - Buttons for loading default channels
    - Sound effect for default channel load buttons [CRT turn on notification by Coolshows101sound](https://freesound.org/people/Coolshows101sound/sounds/709461/)
    - Icons for buttons to remove all active channels, navbar items, credits, and disclaimer
    - Ability to move floating buttons
    - Ability to individually hide channel overlay buttons
    - Observer for cases where there are only 2 or 1 active channels, adjust column size accordingly to cover the entire width

- Removed
    - js/json file with channels (created &lt;<https://github.com/Alplox/json-tv>&gt; to fetch, leaving the last file that existed in the repository as a backup)

- Fixed
    - Option to enter full screen (bug <<https://github.com/Alplox/teles/issues/1>&gt; if entered with the enlarge icon from a browser, it remains, but the problem is not unique to the site, so it is left as it is because globally (from what I saw) there is no solution) with the F11 key working as expected.

## [v0.16]

- Changed
    - CSS: &lt;a&gt;:focus and &lt;a&gt;:hover
    - PWA manifest
    - CSS: .barra-overlay because its content was not properly centered
    - .barra-overlay adds tabindex=0 so that it can be focused using the TAB key
    - Text: from "Disable" to "Remove" in the channels modal (to match the remove button on the signals)
    - Separate share buttons from copy link bar (so that modal shows copy link to people with ad blockers)
    - Rewritten "NOTICE.md" file
    - Alert after localStorage deletion
    - SVG social media logos replaced with Bootstrap icons
    - Example images on README.md, index.html, and site.webmanifest according to new version

- Added
    - Icon to external links within active signal &lt;iframe&gt; for better communication that clicking will leave the site &lt;i class="bi bi-box-arrow-up-right"&gt;&lt;/i&gt;
    - Contributors section in "README.md"
    - Ability to reorder channels with plugin from [SortableJS](https://github.com/SortableJS/Sortable) grid
    - Icon for contributions in modal credits and README.md with [contributors-img](https://github.com/lacolaco/contributors-img)
    - Sound effects for link copy alert in share modal: [button-pressed by Pixabay](https://pixabay.com/sound-effects/button-pressed-38129/), [Cancel/miss chime by Raclure](https://freesound.org/people/Raclure/sounds/405548/)
    - Sound effect for buttons to remove all active [TV](https://freesound.org/people/MATRIXXX_/sounds/523553/) channels[, Shutdown.wav by MATRIXXX\_](https://freesound.org/people/MATRIXXX_/sounds/523553/)
    - Background sound effect for alert after deleting localStorage [DefectLineTransformer by blaukreuz](https://freesound.org/people/blaukreuz/sounds/440128/)
    - Sound effect for buttons to remove channel [User Interface Clicks and Buttons 1 by original_sound](https://freesound.org/people/original_sound/sounds/493551/)
    - Stale variation[https://alienxproject.github.io/X/](https://alienxproject.github.io/X/)
    - "Variation" [https://navezjt.github.io/JCN-TV/](https://navezjt.github.io/JCN-TV/)
    - Complementary link Suicide Prevention Hotline
    - Flicker effect for background after deleting localStorage [https://codepen.io/frbarbre/pen/BaObOXL](https://codepen.io/frbarbre/pen/BaObOXL)
    - Flicker effect for text after localStorage deletion [https://codepen.io/patrickhlauke/pen/YaoBop](https://codepen.io/patrickhlauke/pen/YaoBop)
    - Dark/light theme, SVG backgrounds themes generated with [https://wickedbackgrounds.com/app](https://wickedbackgrounds.com/app) transformed to css with [https://yoksel.github.io/url-encoder/](https://yoksel.github.io/url-encoder/)
    - Option to change/replace channel from grid
    - Ability to remember channel number selection per row with localStorage
    - Alert if channel search returns no results
    - Option to reorder channel buttons in ascending or descending order
    - Screenshots for PWA, made with Progressier [https://progressier.com](https://progressier.com)
    - isMobile library [https://github.com/kaimallea/isMobile](https://github.com/kaimallea/isMobile)

- Removed
    - Blocked.txt file
    - emergencia.html file
    - Archivo archivo.html file
    - SVG social media logos
    - Example images site v0.07
    - [CHV 2](https://www.chilevision.cl/senal-online)

## [v0.15]

- Changed
    - Link &lt;<https://ssd.eff.org/es/playlist/%C2%BFactivista-o-manifestante>&gt; replaced with &lt;<https://ssd.eff.org/es/module/asistir-una-protesta>&gt; due to 404 error

- Added
    - Icon to external links to better communicate that clicking will leave the site &lt;i class="bi bi-box-arrow-up-right"&gt;&lt;/i&gt;

- Removed
    - Modal Records of protests in Chile
    - Modal Report human rights violations
    - Related links COVID-19 alongside Modal's "pacomap.live" Complementary links
    - Modal GitHub Projects section Complementary Links
    - Sites: Capucha Informativa (does not load) ChileOkulto (content deleted) En Punto (last updated 2021) Megáfono Popular (does not load) Piensa Prensa (site redirects to advertising) Primera Línea Revolucionaria Chile (last updated 2022) Revista ChileLibre (does not load) Verdad Ahora (last updated 2023) Radio 19 de abril Cobertura colectiva (does not load) Radio Manque (does not load) RadioTV-Liberación (does not load)
    - Useful information on fires (channel and modal)
    - Link Variation by u/sebastianrw [https://whywelove.news/love/country/chile/envivo](https://whywelove.news/love/country/chile/envivo)

## [v0.14]

- Changed
    - JavaScript code reduced with ChatGPT-3.5 partner

## [v0.13]

- Changed
    - Link to Pottersys website; [http://pslabs.cl/tele.html](http://pslabs.cl/tele.html) -&gt; [https://www.viendotele.cl/](https://www.viendotele.cl/)
    - Default signals

- Added

## [v0.12]

- Changed
    - Changed Bootstrap Icons version from 1.9.0 to 1.10.4
    - Slight redesign, focus on using external Bootstrap Icons library icons rather than emojis for better compatibility

- Removed
    - SVG icons folder

## [v0.11]

- Changed
    - Semantic changes in naming conventions for functions and channel listing features (basically camelCase)

- Added
    - Channel filter by country flag within modal.

## [v0.10]

- Changed
    - Migrated repository from "tele" to "teles" due to DMCA ([https://github.com/github/dmca/blob/master/2022/06/2022-06-06-corus.md](https://github.com/github/dmca/blob/master/2022/06/2022-06-06-corus.md) thanks GitHub for ignoring my response despite having followed the steps you requested, it was a good and pleasant experience 10/10)

## [v0.09]

- Added
    - Mention of [https://flagpedia.net/](https://flagpedia.net/) in NOTICE.md file
    - Button to switch to full screen
    - Button to remove signal from grid

- Changed
    - Country flags now come dynamically from [https://flagcdn.com](https://flagcdn.com) (Thanks to digging into the projects of @martinsantibanez/tele-react and @AINMcl/MonitorTV)
    - UCI 2 -&gt; Native

- Removed
    - SVG files folder for country flags
    - License "CSS Range Slider – with Fill"

## Fixed

- Code stopped executing correctly when attempting to load channels from localStorage that were no longer in the active list

## [v0.08]

- Added
    - Added pwabuilder and pwa-update licenses to "NOTICE.md"
    - Added github project [https://github.com/marcosins/convencion-chile](https://github.com/marcosins/convencion-chile) to list of complementary links
    - Created "features.md" file
    - Created file "changelog.md"

- Changed
    - Fixed channel button effect after click (":focus" inherited from Bootstrap became part of "pulsate-2" animation)
    - Less distracting channel button animation ("pulsate-3")
    - Replaced "|" in manifesto with "-" for title compatibility with Windows
    - Customizations are now also accessible via the navbar
    - PWA-update alert position moved above floating button, not behind
    - Changed script syntax from snake_case to camelCase
    - Renamed variables to be more descriptive
    - TVN 3 => TVN 2
    - Channel 13 4 => Channel 13 3

- Removed
    - Removed (temporary) message suggesting css not updating

## [v0.07]

- Added
    - Added Workbox library (site now works as PWA) and fixed loading issue present in first launch. #5
    - Added button to clear all active channels

- Changed
    - Legal notice modal now disabled with localStorage, eliminating the need to create a cookie
    - Using localStorage, active channels now persist after reloading the site
    - Changed colors to improve contrast
    - Redesigned customization panel (side panel)
    - Disclaimer rewritten to better adapt in case of forking the repository
    - SVG files extracted from HTML code, now used as images
    - Link mentioning first favicon now refers to original commit
    - Deprecated
    - Bootstrap and videojs libraries removed from project files, reloaded via CDN

- Removed
    - First favicon
    - All.txt file
    - Voting tips html file

## [v0.06]

- Added

- Changed
    - Reduced channels.js code
    - Reduced styles.css code
    - Rewritten channel creation code (increases readability)
    - Rewritten disclaimer to define project scope
    - Renamed scripts.js -> main.js
    - Renamed images folder -&gt; img
    - Channel button design
    - Added link to the repository that inspired the project ([https://github.com/PotterSys/canales-tele](https://github.com/PotterSys/canales-tele)) to the readme file (along with giving it its well-deserved star, my apologies "PotterSys," I didn't realize you had the page in the same repository)
    - Added stackoverflow links that have been used to make the code easier to understand
    - The "&lt; a &gt;" tag defaults to "rel=noopener," so it was removed ([https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener)).
    - Renamed ChilledCow -> Lofi Girl
    - Renamed Chamber of Deputies YouTube Channel → Chamber of Deputies YT
    - Devised a way to warn about possible CSS loading errors in case the site is updated but the CSS file is not (as happened to me).
    - Channel buttons are now generated with a grid so that they are all the same size
    - Rewrote code for channel buttons

- Removed

## [v0.05]

- Changed
    - Bootstrap V4.6.0 > 5.1.3
    - Created sidebar with site configuration options (I've recently accessed the page from my phone and I think it's better if they are accessible without obstructing the content you're trying to adjust)
    - I converted some scripts to vanilla JS to start phasing out jQuery (there are two left that I didn't know how to translate ¯*(ツ)*/¯).
    - General design changes
    - We have a filter! (gg jQuery)
    - The broadcast on/off button works great now
    - Preview images updated
    - CSS rewritten using nesting and separated (a little better) by sections
    - Deprecated
    - Popper library (built into the Bootstrap library)
    - jQuery library

- Removed
    - Images from previous versions removed

## [v0.04]

- Added
    - Variation by martinsantibanez ([https://github.com/martinsantibanez/tele-react](https://github.com/martinsantibanez/tele-react))

- Changed
    - Changed script syntax for better readability
    - New example images
    - Incorporated versioning "system"
    - Alternative media outlets listed in alphabetical order (to a certain extent)

## [v0.03]

- Added
    - Peru variation added by SanguiNET [https://github.com/SanguiNET/tele](https://github.com/SanguiNET/tele)
    - Spanish language to videojs

- Changed
    - Channel list format change (for my sanity) for easier editing [https://gist.github.com/joyrexus/16041f2426450e73f5df9391f7f7ae5f](https://gist.github.com/joyrexus/16041f2426450e73f5df9391f7f7ae5f)
    - Updated README channel list
    - Updated variation link by AINMcl [https://github.com/AINMcl/MonitorTV](https://github.com/AINMcl/MonitorTV) (changed "monitors" to "MonitorTV")
    - Table of versions created separately from links found unrelated to the project
    - JS channels reduced by a couple of lines
    - Finally took the time to automate the creation of videojs players for m3u8 channels
    - Changed variable syntax (var => let) and renamed some of them as well
    - Reorganized project file structure
    - Separated channels from the rest of the scripts
    - Bootstrap library (CSS only) now inside project files
    - External libraries (main ones, since iframes are not) are now called from within the repository and not externally from other servers
    - Minor change in modal credits
    - Channels have an SVG of their flags according to the country where the transmission originates (not all)
    - Updated href tag (+nofollow noreferrer)
    - Improvement in responsive size with the use of "clamp" (deleting media queries)
    - Search filter fixed. Now allows accents and the letter ñ.
    - Changed "name-bar" position (it bothered me when I wanted to read the news in the smaller bar)
    - Great, great

- Removed
    - Removed Font Awesome for icons, replaced with pure SVG's
