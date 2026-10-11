/*
 * The Calendar of Harptos of tiddlyrpg-setting-forgottenrealms with the real data and language
 * keys: active through the setting, months and festivals in de-DE and en-GB, the era, the leap
 * day Shieldmeet, the length of a year. The engine itself is tested in TiddlyRPG-Plugins
 * (calendar-engine, dates) against a fixture copy of these data.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	h = require("./helpers");

var $tw, wiki, calendar;

test.before(function() {
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = tw.wiki;
		calendar = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/calendar.js");
	});
});

function f(text) {
	return h.filter(wiki, text).join();
}

test("Harptos is the active calendar", function() {
	var cal = calendar.active(wiki);
	assert.equal(cal && cal.id, "Harptos");
});

test("a year has 365 days, a leap year 366 (Shieldmeet every 4 years)", function() {
	var cal = calendar.active(wiki),
		length = function(year) {
			return calendar.dayNumber(cal, year + 1, 1, 1) - calendar.dayNumber(cal, year, 1, 1);
		};
	assert.equal(length(1351), 365);
	assert.equal(length(1352), 366);
});

test.describe("de-DE", function() {
	test.before(function() {
		h.setLanguage(wiki, "de-DE");
	});

	test("months and festivals", function() {
		assert.equal(f("[[1351-07-05]dateformat[]]"), "5. Flamerule 1351");
		assert.equal(f("[[1351-01-31]dateformat[]]"), "Mittwinter 1351");
		assert.equal(f("[[1351-07-31]dateformat[]]"), "Mittsommer 1351");
	});

	test("era and Shieldmeet", function() {
		assert.equal(f("[[1351-07-05]dateformat:era[]]"), "5. Flamerule 1351 DR");
		assert.equal(f("[[1352-07-30]dateadd[2]]"), "1352-07-32");
		assert.equal(f("[[1351-07-30]dateadd[2]]"), "1351-08-01");
	});
});

test.describe("rules language", function() {
	test.before(function() {
		h.setLanguage(wiki, "de-DE");
	});

	test("the setting registers the domain Calendar", function() {
		var language = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/language.js");
		assert.equal(language.domains(wiki).Calendar.type, "calendar");
	});

	test("shown in en-GB in a German wiki", function() {
		h.add(wiki, {title: "$:/config/tiddlyrpg/rules/setting/display/mode", text: "domain"});
		h.add(wiki, {title: "$:/config/tiddlyrpg/rules/setting/display/domain/Calendar", text: "en-GB"});
		try {
			assert.equal(f("[[1351-01-31]dateformat[]]"), "Midwinter 1351");
		} finally {
			wiki.deleteTiddler("$:/config/tiddlyrpg/rules/setting/display/mode");
			wiki.deleteTiddler("$:/config/tiddlyrpg/rules/setting/display/domain/Calendar");
		}
		assert.equal(f("[[1351-01-31]dateformat[]]"), "Mittwinter 1351");
	});
});

test.describe("en-GB", function() {
	test.before(function() {
		h.setLanguage(wiki, "en-GB");
	});

	test("months and festivals", function() {
		assert.equal(f("[[1351-07-05]dateformat[]]"), "5 Flamerule 1351");
		assert.equal(f("[[1351-01-31]dateformat[]]"), "Midwinter 1351");
	});
});
