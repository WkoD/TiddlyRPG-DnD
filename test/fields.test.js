/*
 * The fields of tiddlyrpg-ruleset-dnd5e2014 against the stat blocks of the SRD 5.1: what the rules
 * derive (proficiency and XP by challenge rating p. 256-258, saving throws and skills with
 * expertise, passive Perception, the level of a player character by its XP p. 56), categories as
 * in the rulebook, the lines that join fields, the values of a folk. The engine itself: tests of TiddlyRPG-Plugins.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	h = require("./helpers");

var $tw, wiki, fields;

test.before(function() {
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = $tw.wiki;
		fields = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/fields.js");
		h.setLanguage(wiki, "en-GB");
	});
});

function read(values, field) {
	return fields.read(wiki, values, field).text;
}

// Adult Red Dragon, p. 287: CR 17, saves Dex +6, Con +13, Wis +7, Cha +11, Perception +13, Stealth +6,
// passive Perception 23
var DRAGON = {str: "27", dex: "10", con: "25", int: "16", wis: "13", cha: "21", cr: "17",
	saves: "dex, con, wis, cha", skills: "perception, stealth", expertise: "perception"};

test("proficiency bonus and XP from the challenge rating; a written value wins", function() {
	assert.equal(read(DRAGON, "proficiency"), "+6");
	assert.equal(read(DRAGON, "xp"), "18,000", "as the SRD writes it, p. 287");
	assert.equal(read({cr: "1/4"}, "xp"), "50");
	assert.equal(read({cr: "0"}, "xp"), "10");
	assert.equal(read({cr: "0", xp: "0"}, "xp"), "0", "CR 0: 0 or 10 XP (p. 258)");
	assert.equal(read({cr: "1/8"}, "proficiency"), "+2");
	assert.equal(read({cr: "30"}, "proficiency"), "+9");
});

test("saving throws and skills: modifier plus proficiency, expertise twice", function() {
	assert.equal(read(DRAGON, "saves"), "DEX +6, CON +13, WIS +7, CHA +11");
	assert.equal(read(DRAGON, "skills"), "Perception +13, Stealth +6");
	assert.equal(read(DRAGON, "senses"), "passive Perception 23");
	assert.equal(read({int: "20", cr: "21", skills: "arcana +18"}, "skills"), "Arcana +18", "the Lich: written");
});

test("hit points as in the stat block", function() {
	assert.equal(read({hp: "19d12 + 133"}, "hp"), "256 (19d12 + 133)");
});

test("categories as in the rulebook: the property names the kind", function() {
	assert.equal(read({category: "weapon, martial, melee, sword, versatile"}, "category"), "martial weapon (melee, sword, versatile)");
	assert.equal(read({category: "armor, heavy"}, "category"), "heavy armor");
	assert.equal(read({category: "weapon, simple, ranged, ammunition, arrow"}, "category"), "simple weapon (ranged, ammunition: arrows)");
	assert.equal(read({category: "ammunition, arrow"}, "category"), "ammunition (arrows)");
	assert.equal(read({category: "poison, ingested"}, "category"), "poison (ingested)");
	h.setLanguage(wiki, "de-DE");
	try {
		assert.equal(read({category: "weapon, martial, melee, sword, versatile"}, "category"), "Kriegswaffe (Nahkampf, Schwert, vielseitig)");
		assert.equal(read({category: "armor, medium"}, "category"), "mittelschwere Rüstung");
	} finally {
		h.setLanguage(wiki, "en-GB");
	}
});

test("lines that join fields", function() {
	var line = function(values, key, list, flags) {
		return fields.line(wiki, values, {fields: list, key: key, flags: flags});
	};
	assert.equal(line({ac: "12", "ac-dex": "yes", "ac-dex-max": "2"}, "Rules/Line/ac", ["ac", "ac-dex", "ac-dex-max"], {"ac-dex": "Rules/Line/AcDex"}),
		"12 + Dex modifier (max 2)");
	assert.equal(line({charges: "7", recharge: "1d6 + 1", "recharge-on": "dawn"}, "Rules/Line/charges", ["charges", "recharge", "recharge-on"]),
		"7, regains 1d6 + 1 (recharge: dawn)");
	assert.equal(line({save: "dex", "save-dc": "15", "save-success": "half"}, "Rules/Line/save", ["save", "save-dc", "save-success"]),
		"DEX save DC 15, half damage on a success");
	assert.equal(line({duration: "1 minute", concentration: "yes"}, "Rules/Line/duration", ["duration", "concentration"], {concentration: "Rules/Line/Concentration"}),
		"Concentration, up to 1 minute");
	assert.equal(line({cr: "1/4"}, "Rules/Line/challenge", ["cr", "xp"]), "1/4 (50 XP)");
	assert.equal(line({damage: "1d8 bludgeoning plus 1d8 cold", "damage-versatile": "1d10 bludgeoning plus 1d8 cold", category: "weapon"},
		"Rules/Line/damage", ["damage", "damage-versatile"]),
		"1d8 bludgeoning + 1d8 cold, versatile (1d10 bludgeoning + 1d8 cold)",
		"versatile damage reads like damage: types, several parts; the short form of the weapon tables");
	h.setLanguage(wiki, "de-DE");
	try {
		assert.equal(line({damage: "1d8 bludgeoning plus 1d8 cold", "damage-versatile": "1d10 bludgeoning plus 1d8 cold", category: "weapon"},
			"Rules/Line/damage", ["damage", "damage-versatile"]),
			"1W8 Wucht + 1W8 Kälte, vielseitig (1W10 Wucht + 1W8 Kälte)");
	} finally {
		h.setLanguage(wiki, "en-GB");
	}
});

test("units of the new domains: time without conversion, speed and volume as the German SRD", function() {
	assert.equal(read({"casting-time": "1 bonus-action"}, "casting-time"), "1 bonus action");
	assert.equal(read({duration: "10 minutes"}, "duration"), "10 minutes");
	assert.equal(read({duration: "until-dispelled"}, "duration"), "Until dispelled");
	h.setLanguage(wiki, "de-DE");
	try {
		assert.equal(read({duration: "10 minutes"}, "duration"), "10 Minuten");
		assert.equal(read({"travel-speed": "4 mph"}, "travel-speed"), "6,4 km/h", "de p. 76 Galeere");
		assert.equal(read({"capacity-volume": "64 ft³"}, "capacity-volume"), "1792 Liter", "de p. 249");
		assert.equal(read({speed: "walk 30 ft, fly 60 ft, hover"}, "speed"), "9 m, Fliegen 18 m, Schweben");
	} finally {
		h.setLanguage(wiki, "en-GB");
	}
});

test("a spell slot with its level, as the spells of the SRD write it (EN p. 114, DE S. 125)", function() {
	var rules = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/rules.js");
	assert.equal(rules.term(wiki, "spell-slot", "level", "3").text, "spell slot of 3rd level");
	h.setLanguage(wiki, "de-DE");
	try {
		assert.equal(rules.term(wiki, "spell-slot", "level", "3").text, "Zauberplatz des 3. Grades");
		assert.equal(rules.term(wiki, "spell-slot").text, "Zauberplatz");
	} finally {
		h.setLanguage(wiki, "en-GB");
	}
});

test("a folk (Information Folk): size, speed, senses - no stat block, no passive Perception without Wisdom", function() {
	wiki.addTiddler(new $tw.Tiddler({title: "Nichny", tags: "Information Folk", size: "medium", speed: "walk 30 ft, climb 30 ft",
		senses: "darkvision 60 ft", text: "Cat folk."}));
	try {
		var block = h.render(wiki, "text/plain", "{{Nichny||$:/plugins/tiddlyrpg-core/viewtemplates/fields}}");
		assert.equal(block, "Size MediumSpeed 30 ft, climb 30 ftSenses darkvision 60 ft");
		assert.deepEqual(Array.from(fields.forTiddler(wiki, "Nichny").fields), ["size", "speed", "senses", "ability-bonuses", "damage-type", "area", "area-shape", "save"]);
	} finally {
		wiki.deleteTiddler("Nichny");
	}
});

// Character Advancement, p. 56: the level by the XP, every threshold; the XP of the next level
test("the level of a player character by its XP, as the table Character Advancement", function() {
	var thresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000,
		140000, 165000, 195000, 225000, 265000, 305000, 355000];
	thresholds.forEach(function(xp, i) {
		assert.equal(read({xp: String(xp)}, "character-level"), String(i + 1), xp + " XP");
		if(xp > 0) {
			assert.equal(read({xp: String(xp - 1)}, "character-level"), String(i), (xp - 1) + " XP");
		}
		assert.equal(read({xp: String(xp)}, "xp-next"), i + 1 < thresholds.length ? thresholds[i + 1].toLocaleString("en-GB") : "");
	});
	assert.equal(read({xp: "24500"}, "character-level"), "7");
	assert.equal(read({}, "character-level"), "");
	// The XP of a challenge rating are a reward: a person with stat block gets no level from them
	assert.equal(read({cr: "5"}, "xp"), "1,800");
	assert.equal(read({cr: "5"}, "character-level"), "");
	assert.equal(read({cr: "5"}, "xp-next"), "");
});

test("a player character: level, XP and the next level in its block, the level on its card", function() {
	h.add(wiki, {title: "Held", tags: "Player", player: "Tom", xp: "128500"});
	try {
		assert.deepEqual(Array.from(h.filter(wiki, "[[Held]trpgfieldsections[]]")), ["advancement"]);
		assert.deepEqual(Array.from(h.filter(wiki, "[[Held]trpgfieldlines[advancement]]")), ["character-level", "xp", "xp-next"]);
		assert.deepEqual(Array.from(h.filter(wiki, "[[Held]trpgfieldcard[]]")), ["Level 13"]);
		h.setLanguage(wiki, "de-DE");
		assert.deepEqual(Array.from(h.filter(wiki, "[[Held]trpgfieldcard[]]")), ["Stufe 13"]);
		assert.equal(read({xp: "128500"}, "xp-next"), "140.000", "the thousands separator of the wiki language");
	} finally {
		h.setLanguage(wiki, "en-GB");
		wiki.deleteTiddler("Held");
	}
});

test("XP as people write them: thousands separated, also on a person", function() {
	assert.equal(read({xp: "120.000"}, "character-level"), "13");
	assert.equal(read({xp: "120,000"}, "character-level"), "13");
	assert.equal(read({xp: "120.000"}, "xp"), "120,000");
	assert.equal(fields.read(wiki, {xp: "1,5"}, "xp").problem, "Rules/Check/Integer");
	assert.ok(fields.forTypes(wiki, ["Person"]).fields.indexOf("xp") !== -1, "a person may have XP");
});

test("a class: hit dice, saving throws, spellcasting ability; a folk: the ability score increase, the breath of an ancestry", function() {
	h.add(wiki, {title: "Hexer", tags: "Information Class", "hit-die": "1d8", "saving-throws": "wis, cha", "spellcasting-ability": "cha"});
	h.add(wiki, {title: "Schwarz", tags: "Information Folk", folk: "Drachenblut", "damage-type": "acid", area: "30 ft", "area-shape": "line", save: "dex", "ability-bonuses": "str +2, cha +1"});
	try {
		assert.equal(h.render(wiki, "text/plain", "{{Hexer||$:/plugins/tiddlyrpg-core/viewtemplates/fields}}"),
			"Hit Dice 1d8Saving Throws WIS, CHASpellcasting Ability CHA");
		assert.equal(read({"ability-bonuses": "str +2, cha +1"}, "ability-bonuses"), "STR +2, CHA +1");
		assert.equal(read({"damage-type": "fire"}, "damage-type"), "fire");
		assert.equal(fields.read(wiki, {"damage-type": "sunlight"}, "damage-type").problem, "Rules/Check/Label");
		assert.match(h.render(wiki, "text/plain", "{{Schwarz||$:/plugins/tiddlyrpg-core/viewtemplates/fields}}"), /Damage Type acid.*30 ft line/);
	} finally {
		["Hexer", "Schwarz"].forEach(function(t) { wiki.deleteTiddler(t); });
	}
});

test("a character: the background as free text beside the level", function() {
	assert.ok(fields.forTypes(wiki, ["Player"]).fields.indexOf("character-background") !== -1);
	assert.equal(read({"character-background": "Grew up at sea"}, "character-background"), "Grew up at sea");
});

test("a language: its type and script; a feat: its prerequisite; the levels of the classes", function() {
	assert.equal(read({"language-type": "exotic"}, "language-type"), "exotic");
	assert.equal(read({prerequisites: "str 13"}, "prerequisites"), "STR 13");
	h.add(wiki, {title: "Kämpfer", tags: "Information Class"});
	h.add(wiki, {title: "Schurke", tags: "Information Class"});
	try {
		assert.equal(read({"class-levels": "Kämpfer 5, Schurke 8"}, "class-levels"), "Kämpfer 5, Schurke 8");
		assert.equal(read({"class-levels": "Kämpfer 5, Schurke 8"}, "character-level"), "13", "without XP the sum of the levels");
		assert.equal(read({xp: "6500", "class-levels": "Kämpfer 5, Schurke 8"}, "character-level"), "5", "the XP win");
		assert.equal(wiki.getTiddlerText("$:/config/flibbles/relink/fields/class-levels").trim(), "trpgtitles");
	} finally {
		["Kämpfer", "Schurke"].forEach(function(t) { wiki.deleteTiddler(t); });
	}
});
