/*
 * The fields of tiddlyrpg-ruleset-dnd5e2014 against the stat blocks of the SRD 5.1: what the rules
 * derive (proficiency and XP by challenge rating p. 256-258, saving throws and skills with
 * expertise, passive Perception), categories as in the rulebook, the lines that join fields. The
 * engine itself: tests of TiddlyRPG-Plugins.
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
	assert.equal(read(DRAGON, "xp"), "18000");
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

test("categories as in the rulebook: the trait names the kind", function() {
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
