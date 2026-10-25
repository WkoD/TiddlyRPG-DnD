/*
 * <<damage>> with the 13 damage types of tiddlyrpg-ruleset-dnd5e2014 and the cases of the campaign
 * Vandalia (as written there, one per kind of notation). The grammar itself: damage tests of
 * TiddlyRPG-Plugins.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	h = require("./helpers");

var $tw, wiki;

test.before(function() {
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = $tw.wiki;
	});
});

function dmg(value) {
	return h.filter(wiki, "[<v>trpgdamage[]]", {v: value}).join();
}

test.describe("de-DE", function() {
	test.before(function() {
		h.setLanguage(wiki, "de-DE");
	});

	test("the stat block form of the SRD", function() {
		assert.equal(dmg("1d8 piercing"), "1W8 Stichschaden");
		assert.equal(dmg("7 (1d8 + 3) slashing damage plus 4 (1d8) necrotic damage"), "7 (1W8 + 3) Hiebschaden plus 4 (1W8) nekrotischer Schaden");
	});

	test("Vandalia: types in English or German, with DMG, Dmg, Schaden, Damage", function() {
		assert.equal(dmg("1d8 cold DMG"), "1W8 Kälteschaden");
		assert.equal(dmg("2d8 Giftschaden"), "2W8 Giftschaden");
		assert.equal(dmg("1d6 Acid Schaden"), "1W6 Säureschaden");
		assert.equal(dmg("2d8 force Dmg"), "2W8 Energieschaden");
		assert.equal(dmg("1d4 extra Force Damage"), "1W4 Energieschaden");
	});

	test("Vandalia: Kriegsspitzhacke des Kommandanten, today and before", function() {
		assert.equal(dmg("1d8 + 1d4 + 1 fire DMG"), "1W8 + 1W4 + 1 Feuerschaden");
		assert.equal(dmg("1d8 pierce + 1d4 fire"), "1W8 Stichschaden plus 1W4 Feuerschaden");
	});

	test("Vandalia: Frostbringer and Wrath of Raksha", function() {
		assert.equal(dmg("1d8 bludgeon und 1d8 cold DMG"), "1W8 Wuchtschaden plus 1W8 Kälteschaden");
		assert.equal(dmg("1d4+1d6+1d8+1d10+1d12 Acid Schaden"), "1W4+1W6+1W8+1W10+1W12 Säureschaden");
	});

	test("declined German forms are read", function() {
		assert.equal(dmg("4 (1W8) nekrotischen Schaden"), "4 (1W8) nekrotischer Schaden");
	});
});

test.describe("en-GB", function() {
	test.before(function() {
		h.setLanguage(wiki, "en-GB");
	});

	test("German stat block text in English", function() {
		assert.equal(dmg("10 (2W6+3) Hiebschaden plus 3 (1W6) Säureschaden"), "10 (2d6+3) slashing damage plus 3 (1d6) acid damage");
		assert.equal(dmg("1W8 Stichschaden"), "1d8 piercing damage");
	});
});

// All 13 damage types of the domain, each with its phrase in both languages
test.describe("every damage type", function() {
	var PHRASES = {
		acid: ["Säureschaden", "acid damage"],
		bludgeoning: ["Wuchtschaden", "bludgeoning damage"],
		cold: ["Kälteschaden", "cold damage"],
		fire: ["Feuerschaden", "fire damage"],
		force: ["Energieschaden", "force damage"],
		lightning: ["Blitzschaden", "lightning damage"],
		necrotic: ["nekrotischer Schaden", "necrotic damage"],
		piercing: ["Stichschaden", "piercing damage"],
		poison: ["Giftschaden", "poison damage"],
		psychic: ["psychischer Schaden", "psychic damage"],
		radiant: ["gleißender Schaden", "radiant damage"],
		slashing: ["Hiebschaden", "slashing damage"],
		thunder: ["Schallschaden", "thunder damage"]
	};

	test("the 13 types of the domain", function() {
		var data = wiki.getTiddlerData("$:/tiddlyrpg/rules/domain/Damage");
		assert.deepEqual(Array.from(data.entries, function(entry) { return entry.id; }), Object.keys(PHRASES));
	});

	test("de-DE and en-GB", function() {
		[["de-DE", 0, "1W6 "], ["en-GB", 1, "1d6 "]].forEach(function(language) {
			h.setLanguage(wiki, language[0]);
			Object.keys(PHRASES).forEach(function(id) {
				assert.equal(dmg("1d6 " + id), language[2] + PHRASES[id][language[1]], language[0] + " " + id);
			});
		});
	});
});
