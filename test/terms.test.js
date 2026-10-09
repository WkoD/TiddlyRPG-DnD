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
});

test("de-DE", function() {
	h.setLanguage(wiki, "de-DE");
	assert.equal(t("wis"), "WEI");
	assert.equal(t("wis", "save"), "WEI-Rettungswurf");
	assert.equal(t("ac"), "RK");
	assert.equal(t("gm"), "SL");
	assert.equal(t("xp"), "EP");
	assert.equal(t("dex", "name"), "Geschicklichkeit");
});
