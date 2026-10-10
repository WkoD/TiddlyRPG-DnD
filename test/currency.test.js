/*
 * The coins of the Forgotten Realms of tiddlyrpg-setting-forgottenrealms with the real data: the active currency,
 * gp / GM and the other labels of the SRD 5.1, the rates, the reference coin matching the prices
 * of tiddlyrpg-ruleset-dnd5e2014 (gp), the hub. The engine itself: currency tests of
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

function f(text, variables) {
	return h.filter(wiki, text, variables).join(" ");
}

test("the coins of the Forgotten Realms are the currency, gp matches the prices of the ruleset", function() {
	assert.equal(f("[currency[id]]"), "ForgottenRealms");
	assert.equal(f("[currency[coins]]"), "cp sp ep gp pp");
	assert.equal(f("[currency[reference]]"), "gp");
	assert.equal(f("[currency[rulesreference]]"), "gp");
	assert.equal(f("[currency[referencevalid]]"), "yes");
});

test("the rates of the SRD 5.1: 1 gp = 10 sp = 100 cp, 1 ep = 5 sp, 1 pp = 10 gp", function() {
	h.setLanguage(wiki, "en-GB");
	assert.equal(f("[<p>priceconvert[sp]]", {p: "1 gp"}), "10");
	assert.equal(f("[<p>priceconvert[cp]]", {p: "1 gp"}), "100");
	assert.equal(f("[<p>priceconvert[sp]]", {p: "1 ep"}), "5");
	assert.equal(f("[<p>priceconvert[gp]]", {p: "1 pp"}), "10");
});

test("de-DE: GM, SM, KM, EM, PM", function() {
	h.setLanguage(wiki, "de-DE");
	assert.equal(f("[<p>priceformat[]]", {p: "50 gp"}), "50 GM");
	assert.equal(f("[<p>priceformat[]]", {p: "1 pp 3 ep 2 sp 5 cp"}), "1 PM 3 EM 2 SM 5 KM");
	assert.equal(f("[<v>trpgunit[]]", {v: "3 gp 5 sp"}), "3 GM 5 SM");
});

test("en-GB: German labels are read", function() {
	h.setLanguage(wiki, "en-GB");
	assert.equal(f("[<p>priceformat[]]", {p: "50 GM"}), "50 gp");
	assert.equal(f("[<p>priceformat[]]", {p: "2 Gold"}), "2 gp");
});

test("the electrum piece is ep in the currency, the experience points are XP/EP in the terms", function() {
	h.setLanguage(wiki, "de-DE");
	assert.equal(f("[<p>priceformat[]]", {p: "3 ep"}), "3 EM");
	assert.equal(f("[[xp]trpgterm[]]"), "EP");
});

test("the hub Currency", function() {
	h.setLanguage(wiki, "de-DE");
	var html = h.render(wiki, "text/html", "{{Currency}}");
	assert.match(html, /Münzen der Forgotten Realms/);
	assert.match(html, /Preise des Regelwerks in GM sind hier Preise in GM\./);
});
