/*
 * <<term>> with the abilities and terms of tiddlyrpg-ruleset-dnd5e2014: WIS/WEI, AC/RK, the game
 * master GM/SL and experience points XP/EP - the German EP of the terms is no electrum piece, the
 * English GM no gold piece; each is read only within its domain. From the terms by group: a
 * condition, an action, cover with its variants, an alignment with its name, the creature type
 * giant beside the language giant-language.
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

function t(id, variant) {
	return h.filter(wiki, "[<id>trpgterm<variant>]", {id: id, variant: variant || ""}).join();
}

test("en-GB", function() {
	h.setLanguage(wiki, "en-GB");
	assert.equal(t("wis"), "WIS");
	assert.equal(t("wis", "save"), "WIS save");
	assert.equal(t("ac"), "AC");
	assert.equal(t("gm"), "GM");
	assert.equal(t("xp"), "XP");
	assert.equal(t("dex", "name"), "Dexterity");
	assert.equal(t("pb"), "PB");
	assert.equal(t("pb", "name"), "proficiency bonus");
	assert.equal(t("charmed"), "charmed");
	assert.equal(t("dash"), "Dash");
	assert.equal(t("long-rest"), "long rest");
	assert.equal(t("cover", "three-quarters"), "three-quarters cover");
	assert.equal(t("passive-perception"), "passive Perception");
	assert.equal(t("lg"), "LG");
	assert.equal(t("lg", "name"), "lawful good");
	assert.equal(t("giant"), "giant");
	assert.equal(t("giant-language"), "Giant");
});

test("a term without abbreviation has no variant name; a value follows the term", function() {
	h.setLanguage(wiki, "de-DE");
	assert.equal(t("charmed", "name"), "charmed name");
	assert.equal(h.filter(wiki, "[[exhaustion]trpgterm[],[2]]").join(), "Erschöpfung 2");
});

test("the hubs Ruleset and CampaignSetting: the system and the setting, each with its domains", function() {
	h.setLanguage(wiki, "de-DE");
	var html = h.render(wiki, "text/html", "{{Ruleset}}"),
		setting = h.render(wiki, "text/html", "{{CampaignSetting}}");
	assert.match(html, /<h2[^>]*>D&amp;D 5e \(2014, SRD 5\.1\)<\/h2>/);
	["Attribute", "Schaden", "Würfel", "Länge", "Begriffe", "Gewicht", "Zustände", "Aktionen", "Spielmechanik",
		"Zauberwirken", "Sinne", "Fertigkeiten", "Kreaturentypen", "Größenkategorien", "Gesinnungen",
		"Schulen der Magie", "Sprachen"].forEach(function(name) {
		assert.match(html, new RegExp("<h3[^>]*>" + name + "</h3>"), name);
	});
	assert.match(setting, /<h2[^>]*>Forgotten Realms<\/h2>/);
	["Kalender", "Währung"].forEach(function(name) {
		assert.match(setting, new RegExp("<h3[^>]*>" + name + "</h3>"), name);
		assert.doesNotMatch(html, new RegExp("<h3[^>]*>" + name + "</h3>"), name);
	});
	assert.equal((html.match(/<td><code>(acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder)<\/code><\/td>/g) || []).length, 13);
});

test("de-DE", function() {
	h.setLanguage(wiki, "de-DE");
	assert.equal(t("wis"), "WEI");
	assert.equal(t("wis", "save"), "WEI-Rettungswurf");
	assert.equal(t("ac"), "RK");
	assert.equal(t("gm"), "SL");
	assert.equal(t("xp"), "EP");
	assert.equal(t("dex", "name"), "Geschicklichkeit");
	assert.equal(t("pb"), "ÜB");
	assert.equal(t("pb", "name"), "Übungsbonus");
	assert.equal(t("charmed"), "bezaubert");
	assert.equal(t("dash"), "Spurt");
	assert.equal(t("long-rest"), "lange Rast");
	assert.equal(t("cover", "three-quarters"), "Dreivierteldeckung");
	assert.equal(t("passive-perception"), "passive Wahrnehmung");
	assert.equal(t("lg"), "RG");
	assert.equal(t("lg", "name"), "rechtschaffen gut");
	assert.equal(t("giant"), "Riese");
	assert.equal(t("giant-language"), "Riesisch");
});
