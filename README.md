# TiddlyRPG-DnD

D&D content for [`tiddlyrpg-core`](https://github.com/WkoD/TiddlyRPG-Plugins), the format layer
of the TiddlyRPG repo family for campaign wikis in TiddlyWiki5. The plugins contain data and
wikitext only, no code.

## Contents (`plugins/`)

### Ruleset D&D 5e, rules of 2014

<!-- wiki tiddlyrpg-ruleset-dnd5e2014 -->
`$:/plugins/tiddlyrpg-ruleset-dnd5e2014` - the rules system D&D 5e, rules of 2014, compatible
with fifth edition, as plugin type `ruleset` for `tiddlyrpg-core`:

- Rules domains (`$:/tiddlyrpg/rules/domain/...`): `Length` (sizes and distances) and `Weight`
  (units with the factors of the SRD 5.1: 1 in = 2.5 cm, 1 ft = 0.3 m, 1 mi = 1.6 km,
  1 lb = 0.5 kg), `Dice`, `Damage` (the 13 damage types), `Ability` and `Terms`.
- Language keys `Rules/...` in en-GB and de-DE; the terms come from the System Reference Document
  5.1 in English and German (see "Sources and licenses").
- `$:/tiddlyrpg/rules/system`: the name of the system; its prices are in gold pieces
  (`currency-reference: gp`).

Lengths know the kinds `range`, `distance` and `size`: `<<unit "60 ft" range>>` shows whole feet
or metres with one decimal, `distance` miles or kilometres, `size` (bodies and things) feet and
inches or centimetres and metres.
<!-- /wiki -->

### Campaign setting Forgotten Realms

<!-- wiki tiddlyrpg-setting-forgottenrealms -->
`$:/plugins/tiddlyrpg-setting-forgottenrealms` - the campaign setting Forgotten Realms, as plugin
type `setting` for `tiddlyrpg-core`:

- `$:/tiddlyrpg/calendar/Harptos` - the Calendar of Harptos as calendar data (12 months of 30
  days, 5 festival days, Shieldmeet every 4 years); `$:/config/tiddlyrpg/calendar` makes it the
  calendar of the wiki.
- `$:/tiddlyrpg/currency/ForgottenRealms` - the coins of the Forgotten Realms (cp, sp, ep, gp,
  pp, with the rates of the SRD 5.1); `$:/config/tiddlyrpg/currency` makes them the currency of
  the wiki: prices need a coin, the hub "Currency" converts them.
- The rules domains `Calendar` and `Currency`: the names of months, festivals and coins follow
  the rules language of the wiki; the hub "CampaignSetting" shows them under the name
  `Setting/Name` ("Forgotten Realms").
- Language keys `Calendar/Harptos/...` and `Currency/ForgottenRealms/...` (en-GB, de-DE). Month
  names and DR exist only in en-GB and are shown in English in every language; they are proper
  names.

**Own calendar or own coins.** Copy `$:/tiddlyrpg/calendar/Harptos` or
`$:/tiddlyrpg/currency/ForgottenRealms` into the wiki under a new title, change the data and point
`$:/config/tiddlyrpg/calendar` or `.../currency` to it. Display names go into
`$:/tiddlyrpg/language/<code>/Calendar/<id>/...` or `.../Currency/<id>/...`; without them the ids
are shown. This plugin is not needed for that.
<!-- /wiki -->

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

<!-- wiki tiddlyrpg-ruleset-dnd5e2014 tiddlyrpg-setting-forgottenrealms -->
Each plugin works on its own: the ruleset without the setting, the setting without the ruleset.
With one installed, it is active; ControlPanel -> Settings -> TiddlyRPG chooses among several
or switches one off.

**Rules language.** A German wiki shows the terms in German by default ("WEI", "1W8
Hiebschaden", "9 m", "50 GM"). To keep the English terms of an English rulebook, set the
language under ControlPanel -> Settings -> TiddlyRPG -> "Ruleset options" to English, for all
domains or per domain. The names of months and coins have their own setting under
"Campaign setting options" - e.g. coins in English ("50 gp"), the calendar in German.

**In the text** the macros of `tiddlyrpg-core` show these terms:

| Macro | Shown (en / de) |
|---|---|
| `<<term wis>>`, `<<term wis save>>` (abilities str, dex, con, int, wis, cha; variants `save`, `name`) | WIS / WEI, WIS save / WEI-Rettungswurf |
| `<<term ac>>`, `<<term pb name>>` (terms ac, hp, dc, cr, xp, pb; variant `name`) | AC / RK, proficiency bonus / Übungsbonus |
| `<<unit "30 ft">>`, `<<unit "60 ft" range>>` (lengths with the kinds `range`, `distance` and `size`, weights) | 30 ft / 9 m |
| `<<unit "50 gp">>` (coins cp, sp, ep, gp, pp) | 50 gp / 50 GM |

The hubs "Ruleset" and "CampaignSetting" list every term and name in the language it is shown
in, "Currency" converts prices.
<!-- /wiki -->

## Sources and licenses

<!-- wiki tiddlyrpg-ruleset-dnd5e2014/license tiddlyrpg-setting-forgottenrealms/license -->
What is own work in this repo - the plugins, their data and texts, the tests and scripts - is
dedicated to the public domain under CC0 1.0 Universal (`LICENSE`). The plugins also contain
material of others, under the terms below.
<!-- /wiki -->

### Material from the SRD 5.1

<!-- wiki tiddlyrpg-ruleset-dnd5e2014/license -->
`tiddlyrpg-ruleset-dnd5e2014` contains terms (damage types, abilities, abbreviations, units and
their factors) taken from the System Reference Document 5.1 and reformatted.
<!-- /wiki -->

<!-- wiki tiddlyrpg-setting-forgottenrealms/license -->
`tiddlyrpg-setting-forgottenrealms` contains the names, abbreviations and rates of the coins
(copper, silver, electrum, gold and platinum pieces) taken from the System Reference Document 5.1
and reformatted.
<!-- /wiki -->

<!-- wiki tiddlyrpg-ruleset-dnd5e2014/license tiddlyrpg-setting-forgottenrealms/license -->
This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of
the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The
SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at
https://creativecommons.org/licenses/by/4.0/legalcode.

Dieses Werk enthält Material aus dem Systemreferenzdokument 5.1 („SRD 5.1”) von Wizards of the
Coast LLC, das unter https://dnd.wizards.com/de/resources/systems-reference-document verfügbar ist.
Das SRD 5.1 ist lizenziert gemäß der Lizenz Creative Commons Namensnennung 4.0 International, die
unter https://creativecommons.org/licenses/by/4.0/legalcode.de verfügbar ist.

Section 5 of CC-BY-4.0 includes a Disclaimer of Warranties and Limitation of Liability.

The terms were entered by hand from the SRD 5.1 in English and German, with the page of each term.
<!-- /wiki -->

### The Forgotten Realms

<!-- wiki tiddlyrpg-setting-forgottenrealms/license -->
The Calendar of Harptos and the other names of the Forgotten Realms in
`tiddlyrpg-setting-forgottenrealms` are not part of the SRD 5.1:

tiddlyrpg-setting-forgottenrealms is unofficial Fan Content permitted under the
[Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy). Not approved/endorsed
by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the
Coast LLC.
<!-- /wiki -->

## Development

See `CLAUDE.md`: `npm install`, `npm link tiddlyrpg-plugins`, `npm run smoke`, `npm test`.
