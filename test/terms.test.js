/*
 * <<term>> with the abilities and terms of tiddlyrpg-ruleset-dnd5e2014: WIS/WEI, AC/RK, the game
 * master GM/SL and experience points XP/EP - the German EP of the terms is no electrum piece, the
 * English GM no gold piece; each is read only within its domain.
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

function t(id, arg) {
	return h.filter(wiki, "[<id>trpgterm<arg>]", {id: id, arg: arg || ""}).join();
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
});

test("the hubs Ruleset and CampaignSetting: the system and the setting, each with its domains", function() {
	h.setLanguage(wiki, "de-DE");
	var html = h.render(wiki, "text/html", "{{Ruleset}}"),
		setting = h.render(wiki, "text/html", "{{CampaignSetting}}");
	assert.match(html, /<h2[^>]*>D&amp;D 5e \(2014, SRD 5\.1\)<\/h2>/);
	["Attribute", "Schaden", "Würfel", "Länge", "Begriffe", "Gewicht"].forEach(function(name) {
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
});
