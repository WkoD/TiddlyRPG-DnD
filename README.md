# TiddlyRPG-DnD

D&D content for [`tiddlyrpg-core`](https://github.com/WkoD/TiddlyRPG-Plugins), the format layer
of the TiddlyRPG repo family for campaign wikis in TiddlyWiki5. The plugins contain data and
wikitext only, no code.

Not affiliated with or endorsed by Wizards of the Coast.

## Contents (`plugins/`)

| Plugin | Purpose |
|---|---|
| `$:/plugins/tiddlyrpg-ruleset-dnd5e2014` | Ruleset (plugin type `ruleset`) D&D 5e, rules of 2014: domains for sizes, distances, weights (factors of the SRD 5.1), dice, the 13 damage types, abilities and terms, with the terms of the SRD 5.1 in en-GB and de-DE; shown by the macros `<<unit>>`, `<<dice>>`, `<<damage>>`, `<<term>>` of `tiddlyrpg-core` |
| `$:/plugins/tiddlyrpg-setting-forgottenrealms` | Campaign setting (plugin type `setting`) Forgotten Realms: the Calendar of Harptos as calendar data, activated through `$:/config/tiddlyrpg/calendar`, and the coins of Faerûn (cp, sp, ep, gp, pp with the rates and names of the SRD 5.1), activated through `$:/config/tiddlyrpg/currency`; language keys en-GB and de-DE (month names and DR only in en-GB, they are proper names) |

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

## Development

See `CLAUDE.md`: `npm install`, `npm link tiddlyrpg-plugins`, `npm run smoke`, `npm test`.
