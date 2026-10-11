# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

D&D content for `tiddlyrpg-core`, the format layer of the TiddlyRPG repo family (repo
`TiddlyRPG-Plugins`, npm `tiddlyrpg-plugins`). Contents and how wikis use it: see `README.md`.

- **Data and wikitext only, no JS modules.** Everything here uses what `tiddlyrpg-core` offers as
  its contract (calendar data, language keys, config tiddlers). A change that needs code belongs in
  `tiddlyrpg-core`, not here.
- Each plugin is of the plugin type `ruleset` or `setting` (`plugin-type` in `plugin.info`); of
  each type the wiki has one active (`$:/config/tiddlyrpg/ruleset`, `.../setting`, default: the
  only or first installed one). Each declares `"dependents": ["$:/plugins/tiddlyrpg-core"]` and
  the core version it needs as `"tiddlyrpg-core-version": ">=x.y.z"`.
- The terms a plugin brings belong to rules domains: JSON data tiddlers in `rules/domains/`
  tagged `$:/tags/tiddlyrpg/RulesDomain` (`domain`, `type`, `keys` and what the type needs, in
  the JSON; the field `type` is `application/json`), e.g. `Calendar` of the
  setting. Their language follows the rules language of the wiki ("Rules language" in
  `CLAUDE.md` of `TiddlyRPG-Plugins`).
- The rules of how the data is read live in `TiddlyRPG-Plugins` (`CLAUDE.md` and `README.md`
  there: "Calendar engine", "Language system").

## Documentation - who covers what

- **CLAUDE.md** (here): development support - rules, conventions, editing and release workflow.
- **README.md**: what the plugins contain and how a wiki uses them.

## Editing the plugins

The plugins are **folder plugins** under `plugins/` (no build step - the folder *is* the plugin).

```bash
npm install
npm link tiddlyrpg-plugins   # once `npm link` ran in a checkout of TiddlyRPG-Plugins
npm run smoke                # boot/load check with tiddlyrpg-core, these plugins and de-DE
npm test                     # all tests in test/
npm run test-lang            # only test/lang/: language packs
```

- `tiddlyrpg-core` comes from `node_modules/tiddlyrpg-plugins`. During development that is an
  `npm link` to a checkout of `TiddlyRPG-Plugins`, so a change in core is tested here at once.
  `npm install` removes the link; set it again right after every `npm install`.
- `scripts/plugin-path.js` builds `TIDDLYWIKI_PLUGIN_PATH` for `scripts/tw.js` and the tests:
  `./plugins`, then `node_modules/tiddlyrpg-plugins/plugins`, then the pinned
  `node_modules/tw5-*/plugins`.
- `npm run smoke` boots `editions/smoke` and aborts on module/load errors. A plugin that is not
  found is only a warning (`Cannot find plugin`) and the boot exits 0 - read the output; the CI
  step fails on it.
- `npm test` runs `test/**/*.test.js` with `node:test`; `test/helpers.js` boots the smoke edition.
  One file per topic, a test that changes the wiki restores it:
  - `plugins` - every plugin: its type (`ruleset`/`setting`), dependency on the core only, no JS
    modules, the version of `package.json`, `tiddlyrpg-core-version` met by the linked core; the
    version of this repo equals the one of the core; the Forgotten Realms are the active setting
  - `calendar` - the Calendar of Harptos with the real data: months, festivals, era, Shieldmeet,
    length of a year, de-DE and en-GB, the rules domain `Calendar` and its display language
  - `srd` - the SRD terms by hand: the seven domains, the 13 damage types, 6 abilities and 6
    terms; every entry, unit and token has its keys in every language; every key of
    `srd.multids` stands below a comment with a page reference; the license tab
  - `currency` - the coins of the Forgotten Realms: labels EN/DE, the rates of the SRD 5.1, the reference
    coin gp matching the ruleset, the hub
  - `units`, `damage`, `terms` - the macros with the real data: the factors of the SRD 5.1, the
    cases of the campaigns (Vandalia), GM/SL and XP/EP; `terms` also the hubs `Ruleset` and `CampaignSetting`
  - `lang/packs` - every language of every plugin complete against en-GB (keys only in
    `en-GB/names.multids` are proper names and may be missing; keys ending in `/Parse` are the
    words read in one language only)

**SRD terms by hand:** `tiddlyrpg-ruleset-dnd5e2014/language/<code>/srd.multids` holds the terms
of the System Reference Document 5.1 (EN, DE). Every block of keys stands below `#` comments
with the page in the PDF (`.multids` skips lines starting with `#`); a new term gets its page
too (`test/srd.test.js` checks it). The PDFs are only read, never checked in. Units, dice and
the damage grammar are in `rules.multids`, with the pages of the factors.
- Tests here check the real data; the engines themselves are tested in `TiddlyRPG-Plugins`
  against fixture plugins. A test of the same topic has the same file name in both repos.

**Timestamps (`created`/`modified`):** every tiddler (`.tid`, `.multids` header) carries these
fields in TiddlyWiki format (UTC, `YYYYMMDDHHMMSSmmm`). New file: `created` = `modified` = now;
content change: only `modified`; mechanical mass renames/migrations excepted.

**Naming:** internal names are English, files `kebab-case`; titles and keys follow the
namespaces of `tiddlyrpg-core` (`$:/tiddlyrpg/...`, `$:/config/tiddlyrpg/...`,
`$:/tiddlyrpg/language/<code>/...`).

**Language:** everything in this repo is English - code, comments, docs, commit messages, tags
and release notes. Other languages appear only as data: the language packs and the expected output
in `test/`.

**License:** none yet; it is set before the first publication of this repo.

## Publishing a new version

For now this repo keeps the version of `TiddlyRPG-Plugins` (`tiddlyrpg-core`), to show which
versions fit together; the two may part later. A release here follows the one of the core.

1. Raise `version` in `package.json` and in the `plugin.info` of every plugin to the version of
   the core.
2. `npm install`, then `npm link tiddlyrpg-plugins` again.
3. `npm run smoke`, `npm test`.
4. Commit and push; once the CI run is green, **tag == version** and create the release.
