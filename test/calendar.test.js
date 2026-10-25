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
		h.add(wiki, {title: "$:/config/tiddlyrpg/rules/setting/mode", text: "domain"});
		h.add(wiki, {title: "$:/config/tiddlyrpg/rules/setting/domain/Calendar", text: "en-GB"});
		try {
			assert.equal(f("[[1351-01-31]dateformat[]]"), "Midwinter 1351");
		} finally {
			wiki.deleteTiddler("$:/config/tiddlyrpg/rules/setting/mode");
			wiki.deleteTiddler("$:/config/tiddlyrpg/rules/setting/domain/Calendar");
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

// Every month and festival of the data under its name in each language: a renamed id or a
// wrong label fails here (the festivals on day 31 of their month, Shieldmeet on 32 in a leap year)
test.describe("every month and festival in both languages", function() {
	var MONTHS = ["Hammer", "Alturiak", "Ches", "Tarsakh", "Mirtul", "Kythorn", "Flamerule", "Eleasis", "Eleint", "Marpenoth", "Uktar", "Nightal"],
		FESTIVALS = [["1351-01-31", "Midwinter"], ["1351-04-31", "Greengrass"], ["1351-07-31", "Midsummer"], ["1352-07-32", "Shieldmeet"], ["1351-09-31", "Highharvestide"], ["1351-11-31", "FeastOfTheMoon"]],
		NAMES = {
			"de-DE": {day: "5. ", festivals: ["Mittwinter", "Grüngras", "Mittsommer", "Schildtreff", "Hochernte", "Fest des Mondes"]},
			"en-GB": {day: "5 ", festivals: ["Midwinter", "Greengrass", "Midsummer", "Shieldmeet", "Highharvestide", "Feast of the Moon"]}
		};

	test("the ids of the data", function() {
		var cal = calendar.active(wiki);
		assert.deepEqual(Array.from(cal.months, function(m) { return m.id; }), MONTHS);
		var festivals = [];
		cal.months.forEach(function(m) { (m.festivals || []).forEach(function(fest) { festivals.push(fest.id); }); });
		assert.deepEqual(festivals, FESTIVALS.map(function(fest) { return fest[1]; }));
	});

	Object.keys(NAMES).forEach(function(code) {
		test(code, function() {
			h.setLanguage(wiki, code);
			MONTHS.forEach(function(month, i) {
				var date = "1351-" + (i < 9 ? "0" : "") + (i + 1) + "-05";
				assert.equal(f("[[" + date + "]dateformat[]]"), NAMES[code].day + month + " 1351", date);
			});
			FESTIVALS.forEach(function(fest, i) {
				assert.equal(f("[[" + fest[0] + "]dateformat[]]"), NAMES[code].festivals[i] + " " + fest[0].slice(0, 4), fest[1]);
			});
		});
	});
});
