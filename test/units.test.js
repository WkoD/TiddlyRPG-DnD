/*
 * <<unit>> with the real domains of tiddlyrpg-ruleset-dnd5e2014: the factors of the SRD 5.1 per
 * pair, sizes in feet and inches, the cases of the campaigns (sizes of persons in cm, weights in
 * pounds, ranges in feet). The engine itself: unit tests of TiddlyRPG-Plugins.
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

function u(value, kind) {
	return h.filter(wiki, "[<v>trpgunit<k>]", {v: value, k: kind || ""}).join();
}

test.describe("en-GB", function() {
	test.before(function() {
		h.setLanguage(wiki, "en-GB");
	});

	test("a person of 228 cm", function() {
		assert.equal(u("228 cm"), "7 ft 7 in");
	});

	test("30 m is 100 ft, 1,6 km is 1 mi, 1,5 kg is 3 lb", function() {
		assert.equal(u("30 m"), "100 ft");
		assert.equal(u("1,6 km"), "1 mi");
		assert.equal(u("1,5 kg"), "3 lb");
	});

	test("sizes and distances are one domain: a height in metres also without kind", function() {
		assert.equal(u("1,70 m"), "5 ft 8 in");
		assert.equal(u("9 m"), "30 ft");
		assert.equal(u("12 m", "range"), "40 ft");
	});

	test("German words of a campaign text", function() {
		assert.equal(u("300 Pfund"), "300 lb");
		assert.equal(u("1,70 m"), "5 ft 8 in");
	});
});

test.describe("de-DE", function() {
	test.before(function() {
		h.setLanguage(wiki, "de-DE");
	});

	test("the factors of the SRD 5.1: 5 ft = 1,5 m, 30 ft = 9 m, 400 ft = 120 m, 30 mi = 48 km, 2 lb = 1 kg", function() {
		assert.equal(u("5 ft"), "1,5 m");
		assert.equal(u("30 ft"), "9 m");
		assert.equal(u("400 feet"), "120 m");
		assert.equal(u("30 miles"), "48 km");
		assert.equal(u("2 lb."), "1 kg");
	});

	test("5etools forms", function() {
		assert.equal(u("30 ft., fly 50 ft."), "9 m, fly 15 m");
		assert.equal(u("150 feet"), "45 m");
	});

	test("a size: below 1 m in cm", function() {
		assert.equal(u("6 ft"), "1,8 m");
		assert.equal(u("3 ft"), "90 cm");
	});

	test("the kinds range and travel; a number needs its unit", function() {
		assert.equal(u("25 ft", "range"), "7,5 m");
		assert.equal(u("3 mi", "travel"), "4,8 km");
		assert.equal(u("60", "range"), "60", "without unit unchanged");
	});
});
