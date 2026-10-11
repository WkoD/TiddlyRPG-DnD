# TiddlyRPG-DnD

D&D content for [`tiddlyrpg-core`](https://github.com/WkoD/TiddlyRPG-Plugins), the format layer
of the TiddlyRPG repo family for campaign wikis in TiddlyWiki5. The plugins contain data and
wikitext only, no code.

Not affiliated with or endorsed by Wizards of the Coast.

## Contents (`plugins/`)

| Plugin | Purpose |
|---|---|
| `$:/plugins/tiddlyrpg-ruleset-dnd5e2014` | Ruleset (plugin type `ruleset`) D&D 5e, rules of 2014: domains for lengths (sizes and distances) and weights (factors of the SRD 5.1), dice, the 13 damage types, abilities and terms, with the terms of the SRD 5.1 in en-GB and de-DE; shown by the macros `<<unit>>`, `<<dice>>`, `<<damage>>`, `<<term>>` of `tiddlyrpg-core` and by its shortcuts (below); prices in gold pieces |
| `$:/plugins/tiddlyrpg-setting-forgottenrealms` | Campaign setting (plugin type `setting`) Forgotten Realms: the Calendar of Harptos as calendar data, activated through `$:/config/tiddlyrpg/calendar`, and the coins of the Forgotten Realms (cp, sp, ep, gp, pp with the rates and names of the SRD 5.1), activated through `$:/config/tiddlyrpg/currency`, with shortcuts; language keys en-GB and de-DE (month names and DR only in en-GB, they are proper names) |

## Using it in a wiki

A wiki of the TiddlyRPG family already has `tiddlyrpg-plugins` in its `package.json`. Add this
package next to it, add `tiddlyrpg-dnd` to the packages of its launcher `scripts/tw.js` (it
builds `TIDDLYWIKI_PLUGIN_PATH` from `node_modules/<package>/plugins`) and the plugin to
`tiddlywiki.info`:

```json
"plugins": [
    "tiddlyrpg-core",
    "tiddlyrpg-ruleset-dnd5e2014",
    "tiddlyrpg-setting-forgottenrealms",
    ...
]
```

Each plugin works on its own: the ruleset without the setting, the setting without the ruleset.
With one installed, it is active; ControlPanel -> Settings -> TiddlyRPG chooses among several
or switches one off.

**Rules language.** A German wiki shows the terms in German by default ("WEI", "1W8
Hiebschaden", "9 m", "50 GM"). To keep the English terms of an English rulebook, set the
language under ControlPanel -> Settings -> TiddlyRPG -> "Ruleset options" to English, for all
domains or per domain. The names of months and coins have their own setting under
"Campaign setting options" - e.g. coins in English ("50 gp"), the calendar in German.

**Shortcuts** for the text, next to the macros of `tiddlyrpg-core`:

| Shortcut | Stands for | Shown (en / de) |
|---|---|---|
| `<<str>>` `<<dex>>` `<<con>>` `<<int>>` `<<wis>>` `<<cha>>` | `<<term wis>>`; variants `save`, `name` | WIS / WEI, `<<wis save>>`: WIS save / WEI-Rettungswurf |
| `<<ac>>` `<<hp>>` `<<dc>>` `<<cr>>` `<<xp>>` `<<pb>>` | `<<term ac>>`; variant `name` | AC / RK, `<<pb name>>`: proficiency bonus / Übungsbonus |
| `<<ft 30>>` `<<mi 2>>` `<<lb 10>>` | `<<unit "30 ft">>`; for ft and mi an optional kind `range` or `travel`: `<<ft 60 range>>` | 30 ft / 9 m |
| `<<cp 3>>` `<<sp 5>>` `<<ep 1>>` `<<gp 50>>` `<<pp 2>>` | `<<unit "50 gp">>` | 50 gp / 50 GM |

The shortcuts belong to their plugin: without it they show nothing, and a hint below the title
names them. The hubs "Ruleset" and "Currency" list them.

**Source of the terms.** The terms of the ruleset and the names and rates of the coins come from
the System Reference Document 5.1 in English and German, entered by hand with the page of each
term; the tab "license" of each plugin holds the attribution.

## Development

See `CLAUDE.md`: `npm install`, `npm link tiddlyrpg-plugins`, `npm run smoke`, `npm test`.
