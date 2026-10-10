/*
 * The shortcuts of tiddlyrpg-ruleset-dnd5e2014 (abilities, terms, ft mi lb) and of
 * tiddlyrpg-setting-forgottenrealms (the coins): per plugin the procedures of
 * rules/shortcuts match the shortcuts of its data, no name is taken by another global
 * definition, each shows like the macro it stands for, and the hub Ruleset lists them as
 * defined.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	h = require("./helpers");

var $tw, wiki, rules;

var RULESET = "tiddlyrpg-ruleset-dnd5e2014",
	SETTING = "tiddlyrpg-setting-forgottenrealms";

test.before(function() {
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = $tw.wiki;
		rules = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/rules.js");
	});
});

// The names a text defines with pragmas
function definitions(text) {
	return (text.match(/^\\(?:procedure|define|function|widget)\s+[^\s(]+/mg) || []).map(function(d) {
		return d.replace(/^\\\w+\s+/, "");
	});
}

// The shortcuts in the data of a plugin: the domains it registers, its currency
function inData(plugin) {
	var domains = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/language.js").domains(wiki),
		names = [];
	Object.keys(domains).forEach(function(name) {
		var d = domains[name];
		if(d.source !== "$:/plugins/" + plugin) {
			return;
		}
		(d.entries || []).forEach(function(e) { if(e.shortcut) { names.push(e.shortcut); } });
		Object.keys(d.units || {}).forEach(function(u) { if(d.units[u].shortcut) { names.push(d.units[u].shortcut); } });
	});
	if(plugin === SETTING) {
		(wiki.getTiddlerData("$:/tiddlyrpg/currency/Faerun").currencies || []).forEach(function(c) { if(c.shortcut) { names.push(c.shortcut); } });
	}
	return names.sort();
}

function procedures(plugin) {
	return definitions(wiki.getTiddlerText("$:/plugins/" + plugin + "/rules/shortcuts", "")).sort();
}

test("data and procedures match per plugin", function() {
	assert.deepEqual(procedures(RULESET), inData(RULESET));
	assert.deepEqual(inData(RULESET), ["ac", "cha", "con", "cr", "dc", "dex", "ft", "hp", "int", "lb", "mi", "pb", "str", "wis", "xp"]);
	assert.deepEqual(procedures(SETTING), inData(SETTING));
	assert.deepEqual(inData(SETTING), ["cp", "ep", "gp", "pp", "sp"]);
});

test("no shortcut takes a name another global definition has", function() {
	var own = ["$:/plugins/" + RULESET + "/rules/shortcuts", "$:/plugins/" + SETTING + "/rules/shortcuts"],
		names = procedures(RULESET).concat(procedures(SETTING)),
		taken = [];
	wiki.filterTiddlers(wiki.getTiddlerText("$:/core/config/GlobalImportFilter")).forEach(function(title) {
		if(own.indexOf(title) === -1) {
			definitions(wiki.getTiddlerText(title, "")).forEach(function(name) {
				if(names.indexOf(name) !== -1) {
					taken.push(name + " in " + title);
				}
			});
		}
	});
	Object.keys($tw.macros).forEach(function(name) {
		if(names.indexOf(name) !== -1) {
			taken.push(name + " (JavaScript macro)");
		}
	});
	assert.deepEqual(taken, []);
});

test.describe("de-DE", function() {
	test.before(function() {
		h.setLanguage(wiki, "de-DE");
	});

	test("abilities and terms", function() {
		assert.equal(h.render(wiki, "text/plain", "<<wis save>>, <<dex name>>, <<int>>, <<ac>>, <<pb>>, <<xp>>"), "WEI-Rettungswurf, Geschicklichkeit, INT, RK, ÜB, EP");
	});

	test("units and coins", function() {
		assert.equal(h.render(wiki, "text/plain", "<<ft 30>>"), h.render(wiki, "text/plain", "<<unit \"30 ft\">>"));
		assert.equal(h.render(wiki, "text/plain", "<<lb 10>>, <<gp 50>>, <<cp 3>>, <<pp 2>>"), "5 kg, 50 GM, 3 KM, 2 PM");
	});

	test("the hub Ruleset: every shortcut defined, none struck through", function() {
		var html = h.render(wiki, "text/html", "{{Ruleset}}");
		assert.doesNotMatch(html, /<s title=/);
		assert.match(html, /<td><code>&lt;&lt;pb&gt;&gt;<\/code><\/td>/);
		assert.match(html, /<td><code>&lt;&lt;ft&gt;&gt;<\/code><\/td>/);
	});

	test("the hub Currency: the shortcut of every coin", function() {
		var html = h.render(wiki, "text/html", "{{Currency}}");
		["cp", "sp", "ep", "gp", "pp"].forEach(function(name) {
			assert.match(html, new RegExp("<code>&lt;&lt;" + name + "&gt;&gt;</code>"), name);
		});
		assert.doesNotMatch(html, /<s title=/);
	});

	test("no hint for calls of the shortcuts", function() {
		h.add(wiki, {title: "Kurzformen", text: "<<wis save>> <<ft 60 range>> <<gp 5>> <<pb name>>"});
		try {
			assert.equal(h.filter(wiki, "[[Kurzformen]macrocheck[]] [[Kurzformen]trpgrulecheck[]]").length, 0);
		} finally {
			wiki.deleteTiddler("Kurzformen");
		}
	});
});

test("en-GB", function() {
	h.setLanguage(wiki, "en-GB");
	assert.equal(h.render(wiki, "text/plain", "<<wis save>>, <<ac>>, <<pb name>>, <<gp 50>>, <<ft 30>>"), "WIS save, AC, proficiency bonus, 50 gp, 30 ft");
});
