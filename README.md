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
  1 lb = 0.5 kg), `Dice`, `Damage` (the 13 damage types), `Ability` and `Terms`, and the
  terms by group: `Condition`, `Action`, `Mechanics` (rolls, rest, damage, cover), `Spellcasting`,
  `Sense`, `Skill`, `CreatureType`, `Size`, `Alignment`, `School` and `LanguageType` (standard,
  exotic). Each term is written with its id, e.g. `<<term charmed>>`, `<<term cover
  variant:"half">>`, `<<term lg variant:"name">>`; every id that stands alone is unique across the
  domains. A term the glossary of the content package explains links to its entry. The languages
  themselves are entries of the category `Language` of the core (see "Content package").
- The domains of the fields below: `ItemCategory` (main entries such as `weapon`, `armor`,
  `potion`, `wondrous-item`, each with its properties: `martial`, `melee`, `versatile`, `sword`,
  `medium` ...), `Rarity`, `Component`, `Area`, `SpellWord` (`self`, `touch`,
  `instantaneous` ...), `SaveSuccess`, `SpellAttack`, `DamageGroup` (`nonmagical` ...),
  `Movement`, `Challenge` (with the XP and proficiency bonus of each challenge rating), the table
  `Level` (the XP of each level, "Character Advancement"), and the units `Time` (action, round, minute ... - not converted), `Speed` (mph, km/h) and `Volume`
  (gal, ft³, l).
- The kinds of sections of the text (`Section`): named parts of an item or a creature, each at the
  start of its paragraph - `<<effect "Name">>` (what an item does), `<<curse "Curse">>` (seen
  where the field `cursed` is: locked with `secret-fields: cursed`, the players see the curse when
  the DM lifts the lock), `<<trait "Pack Tactics">>`, `<<spellcasting "Spellcasting">>`,
  `<<action "Bite">>`, `<<bonus-action "Name">>`, `<<reaction "Parry">>`,
  `<<legendary-action "Tail Attack">>`, `<<lair-action "Name">>`, and `<<feature "Font of Magic">>` for
  the features of a class or subclass (under the heading "Class Features"). Each runs to the next one (a list belongs to the spellcasting before it) and
  shows in this order, as in a stat block: effects, curse; features; traits, spellcasting, then actions,
  bonus actions, reactions, legendary and lair actions under their headings. Legendary and lair
  actions start with their introduction, a section without a name: `<<legendary-action>> The
  dragon can take 3 legendary actions ...`.
- Fields with schema (`$:/tiddlyrpg/rules/fields/...`): what an item, artifact, material, spell,
  creature, folk, person or player character holds as values, shown as a block like a stat block in the
  rulebook, with a header line ("martial weapon (melee, sword, versatile), rare (requires
  attunement)", "3rd-level evocation", "Medium beast, unaligned"):
  - items: `category`, `rarity`, `attunement`, `cursed`, `damage`,
    `damage-versatile`, `range`, `ac`, `bonus`, `charges`, `recharge`, `save`, `area`, `duration`,
    `light-bright`, `capacity`, `weight` ...; "Attunement by" is the relation `classes` of the core
    (`classes: Spellcaster`, `classes: Cleric Druid`);
  - spells: `level`, `school`, `ritual`, `casting-time`, `range`, `components`, `duration`,
    `concentration`, `area`, `save`, `attack`, `damage`, `healing`; the classes that cast it are the
    relation `classes` of the core (`classes: Sorcerer Wizard`);
  - creatures: `size`, `creature-type`, `alignment`, `ac`, `hp`, `speed`, `str` ... `cha`,
    `saves`, `skills`, `senses`, `cr` ...; the languages are the relation `languages` of the core,
    shown in the stat block;
  - persons and player characters: `height`, `weight`;
  - persons and player characters: `xp` (a whole number, "120.000" or "120,000" read as
    120000, shown with the thousands separator of the wiki language) - the level (`character-level`) and the XP of the next level (`xp-next`) derive from it
    and are never written; the card of the hub `Player` shows the level ("Level 13"), also of a
    former player character; `class-levels` - the level of each class of a character with
    several or without XP (`class-levels: Fighter 5, Rogue 8`; the form offers a number per class
    it names in `classes`) - without XP the level is their sum, with XP a message tells when they
    add up to more ("level up due" when less); the block shows them in the tree of the classes,
    a row per class beside the folk; `character-background`, the background as free text;
  - classes (`Information Class`: a class, a subclass, a lasting choice): `hit-die`,
    `saving-throws`, `spellcasting-ability`, `damage-type` (of a dragon ancestor);
  - folks (`Information Folk`): `size`, `speed`, `senses`, `ability-bonuses` (`con +2`), and of
    a draconic ancestry `damage-type`, `area`, `save` (its breath); its languages are the relation
    `languages` of the core;
  - languages (`Information Language`): `language-type` (standard, exotic), `script`;
  - feats (`Information Feat`): `prerequisites` (`str 13`).

  What the rules derive is not written: the modifier of an ability, the average of hit points,
  proficiency bonus and XP from the challenge rating, saving throws and skills (with
  `expertise`), passive Perception, the level from the XP - a written value wins.
- Language keys `Rules/...` in en-GB and de-DE; the terms come from the System Reference Document
  5.1 in English and German (see "Sources and licenses").
- `$:/tiddlyrpg/rules/system`: the name of the system; its prices are in gold pieces
  (`currency-reference: gp`).

Lengths know the kinds `range`, `distance` and `size`: `<<unit "60 ft" kind:"range">>` shows whole feet
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

## Content package SRD 5.1 English (`content/dnd5e2014/en-GB/`)

The items, spells, creatures, classes, folks, traits, languages, the feat and the glossary of
the SRD 5.1 in English as entries for the ruleset - among the items equipment, magic items,
trade goods, food and drink and poisons, among the classes their subclasses and lasting
choices, among the folks their subfolks -, each with its fields filled and its text. They are
no tiddlers of the wiki: what a wiki with this package in `node_modules` names is included at
every start, also in its published copy (`README.md` of `TiddlyRPG-Plugins` -> "Content
packages"); the rest is offered while the wiki runs on the Node server - in the search of the
editor, in the choice of a relation, at a missing link and on the hub "Content". The DM takes
an entry into the wiki to change it; it becomes an ordinary tiddler. Without the package nothing
of this shows.

The wiki names the package "SRD 5.1 (English)"; every taken or included entry carries the tag
`SRD 5.1 English`, and its text stays English whatever the language of the wiki. A package in
another language would stand beside it in a folder of its own (`content/dnd5e2014/<code>/`).

- Titles are unique in the package: a class, folk, trait, language or feat before an item before
  a creature before a spell before an entry of the glossary ("Shield" is the armor, the spell is
  "Shield (Spell)"; "Druid" is the class, the creature "Druid (Creature)"; "Darkvision" is the
  spell, the glossary "Darkvision (Glossary)"). `npm run content` reports every title that gets a
  suffix.
- **Classes** (`Information Class`, the tree of the relation `classes` of the core): the 12
  classes with proficiencies, multiclassing (p. 56-57), their table with the columns of the SRD
  (the spell slots per spell level a table of their own below it, but not for the warlock) and
  their features; the 12
  subclasses under the names of the SRD ("Draconic Bloodline", not "Draconic") with `classes:
  <class>`; the lasting choices as "<feature>: <option>" with `classes: <subclass or class>` -
  "Dragon Ancestor: Red" (`damage-type: fire`, table p. 44), "Circle of the Land: Forest" (its
  spells), "Fighting Style: Archery" (one entry, `classes: Fighter Ranger`), "Pact of the Tome",
  "Eldritch Invocation: ..." (under the pact it needs), "Metamagic: ...", the options of the
  Hunter, "Favored Enemy: ...", "Natural Explorer: ..."; "Spellcaster" belongs to the 8 classes
  with Spellcasting or Pact Magic. A subclass or choice with spells of its own names them in
  `spells`; a spell names its classes only. What a character chooses when it is made
  (equipment, skills) is left out.
- **Folks** (`Information Folk`): the 9 folks with their values, texts and languages, the 4
  subfolks with `folk: <folk>`, the 10 draconic ancestries of the dragonborn as "Black Dragonborn"
  (`folk: Dragonborn`) with their breath (table p. 5).
- **Traits** (`Information Trait`): every trait of a folk or subfolk with `folk: <folks>` (Fey
  Ancestry belongs to Elf and Half-Elf); Darkvision is the field `senses` of the folk.
- **Languages** (`Information Language`): the 16 of the SRD (p. 59) as "Common (Language)" -
  several are creatures or folks too -, with type, script and typical speakers. A creature and a
  folk name theirs in `languages`; what is no language of the SRD ("understands Common but can't
  speak") stays in the text of the creature.
- **Feat** (`Information Feat`): Grappler (p. 75).
- **Glossary** (`Information Glossary`): the conditions (appendix PH-A), the skills (p. 78-81), the
  actions in combat (p. 92-93) and the senses (p. 86, 257), each with `term: <id>`; `<<term>>` and
  the values of the rules link to them.
- A figure names its class, subclass and choices in `classes`, its folk in `folk`, its feats and
  languages in `feats` and `languages`, entries of the package taken or not.
- **Conditions in the texts:** a condition the text gives is `<<term>>` and links to its entry of
  the glossary - after a verb ("is poisoned", "fall prone", "knocked unconscious", "while
  charmed", "is no longer frightened"), in a list after it ("can't be blinded, deafened, or
  incapacitated") and as "the prone condition". Where the word describes, it stays plain ("the
  grappled creature", "an invisible sphere", "prone to wanderlust").
- A magic item that names its base item ("Weapon (warhammer)") names it in `base` and carries all
  its values; nothing is inherited, so the item stays as it is when the base changes.
- Mounts are creatures with `price` and `carrying-capacity`; vehicles are items.
- A cursed item comes with the field `cursed` locked (`secret-fields: cursed`).
- The weapon groups (`sword`, `axe` ...) and the ammunition of a weapon are our reading; the SRD
  does not say which weapons are swords.
- Prices are in gold pieces and taken in the coins of the setting of the wiki.

`npm run content` builds it again from the 5e-bits database (fetched once into a cache next to
the script, not checked in).

## Using it in a wiki

A wiki of the TiddlyRPG family already has `tiddlyrpg-plugins` in its `package.json`, and its
launcher `scripts/tw.js` already lists `tiddlyrpg-dnd` among the packages whose `plugins` folder
it loads. Add this package to `devDependencies`, pinned to a tag like `tiddlyrpg-plugins`
(`"tiddlyrpg-dnd": "git+https://github.com/WkoD/TiddlyRPG-DnD.git#2.2.1"`), and the plugins to
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
| `<<term wis>>`, `<<term wis variant:"save">>` (abilities str, dex, con, int, wis, cha; variants `save`, `name`, `mod`, `score`) | WIS / WEI, WIS save / WEI-Rettungswurf, WIS modifier / WEI-Modifikator, WIS score / WEI-Wert |
| `<<term ac>>`, `<<term pb variant:"name">>` (terms ac, hp, dc, cr, xp, pb; variant `name`) | AC / RK, proficiency bonus / Übungsbonus |
| `<<term dc value:"10 + cr">>`, `<<term dc value:"8 + cha:mod + pb">>` (a formula as the value) | DC 10 + CR / SG 10 + HG, DC 8 + CHA modifier + PB |
| `<<dice "1d8 * cr">>`, `<<dice "1/4 hit-dice + hit-dice:average + con:mod">>` (a formula without a term before it; `hit-dice` with the variant `average`) | 1d8 × CR / 1W8 × HG, 1/4 Hit Dice + average of a Hit Die + CON modifier |
| `<<damage "1d4 + pb fire">>` (a formula before the type of damage) | 1d4 + PB fire damage / 1W4 + ÜB Feuerschaden |
| `<<rule "Rage" entry:"Barbarian">>`, `<<rule "Rage Damage" entry:"Barbarian">>` (a feature or a column of the table of a class, with its class; in a formula in single quotes, the class after a bar) | Rage, Rage Damage - as the class writes them, linked to the place in it |
| `<<unit "30 ft">>`, `<<unit "60 ft" kind:"range">>` (lengths with the kinds `range`, `distance` and `size`, weights) | 30 ft / 9 m |
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
`tiddlyrpg-ruleset-dnd5e2014` contains terms (damage types, abilities, item categories, abbreviations,
units and their factors, the forms of header lines) taken from the System Reference Document 5.1
and reformatted.
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

### The content package

`content/dnd5e2014/en-GB/` is material of the SRD 5.1 (attribution above), converted from the data of
the [5e-bits database](https://github.com/5e-bits/5e-database) (MIT License); both notices are in
`content/dnd5e2014/en-GB/NOTICE.md`. A wiki that takes entries from it and is published carries the
attribution of the SRD 5.1 as well; every taken entry names its source in the field `source`.

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
