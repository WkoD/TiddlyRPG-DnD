/*
 * The SRD terms of tiddlyrpg-ruleset-dnd5e2014, written by hand: every entry of a domain and every
 * unit and token has its keys in every language; every key in srd.multids stands below a comment
 * with a page reference; the plugin lists its license tab. Needs no TiddlyWiki boot.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	fs = require("fs"),
	path = require("path");

var plugin = path.join(__dirname, "..", "plugins", "tiddlyrpg-ruleset-dnd5e2014"),
	CODES = ["en-GB", "de-DE"];

// The JSON of the domain tiddlers
function domains() {
	var dir = path.join(plugin, "rules", "domains");
	return fs.readdirSync(dir).map(function(file) {
		var text = fs.readFileSync(path.join(dir, file), "utf8").replace(/\r\n/g, "\n");
		return JSON.parse(text.slice(text.indexOf("\n\n") + 2));
	});
}

// The keys of a language: {key: value}
function keys(code) {
	var dir = path.join(plugin, "language", code),
		result = {};
	fs.readdirSync(dir).forEach(function(file) {
		var text = fs.readFileSync(path.join(dir, file), "utf8").replace(/\r\n/g, "\n");
		text.slice(text.indexOf("\n\n") + 2).split("\n").forEach(function(line) {
			var pos = line.indexOf(":");
			if(line.charAt(0) !== "#" && pos > 0) {
				result[line.slice(0, pos).trim()] = line.slice(pos + 1).trim();
			}
		});
	});
	return result;
}

// The keys every language needs for the domains
function needed() {
	var list = ["Rules/System/Name", "Rules/Unit/System"];
	domains().forEach(function(d) {
		list.push("Rules/Domain/" + d.domain);
		if(d.type === "unit") {
			Object.keys(d.units).forEach(function(id) { list.push("Rules/Unit/" + id); });
		} else if(d.type === "tokens") {
			d.tokens.forEach(function(t) { list.push("Rules/Token/" + t.id); });
		} else if(d.type === "damage") {
			list.push("Rules/Damage/Pattern", "Rules/Damage/Join", "Rules/Damage/Joiners", "Rules/Damage/Fillers");
			d.entries.forEach(function(e) {
				list.push("Rules/Damage/" + e.id);
				if(!e.qualifier) {
					list.push("Rules/Damage/" + e.id + "/Phrase");
				}
			});
		} else if(d.type === "label") {
			d.entries.forEach(function(e) { list.push("Rules/Term/" + e.id, "Rules/Term/" + e.id + "/name"); });
		}
	});
	return list.filter(function(key, index) { return list.indexOf(key) === index; });
}

test("the six domains of the ruleset with their types", function() {
	var types = {};
	domains().forEach(function(d) { types[d.domain] = d.type; });
	assert.deepEqual(types, {Ability: "label", Damage: "damage", Dice: "tokens", Length: "unit", Terms: "label", Weight: "unit"});
});

test("every domain has an example for the settings tab", function() {
	assert.deepEqual(domains().filter(function(d) { return !d.example; }).map(function(d) { return d.domain; }), []);
});

test("the 13 damage types, 6 abilities and 7 terms of the SRD 5.1", function() {
	var byName = {};
	domains().forEach(function(d) { byName[d.domain] = d; });
	assert.equal(byName.Damage.entries.length, 13);
	assert.deepEqual(byName.Ability.entries.map(function(e) { return e.id; }), ["str", "dex", "con", "int", "wis", "cha"]);
	assert.deepEqual(byName.Terms.entries.map(function(e) { return e.id; }), ["ac", "hp", "dc", "cr", "xp", "gm", "pb"]);
});

CODES.forEach(function(code) {
	test(code + ": every entry, unit and token has its keys", function() {
		var have = keys(code);
		assert.deepEqual(needed().filter(function(key) { return !have[key]; }), []);
	});
});

CODES.forEach(function(code) {
	test(code + ": every key of srd.multids stands below a comment with a page reference", function() {
		var text = fs.readFileSync(path.join(plugin, "language", code, "srd.multids"), "utf8").replace(/\r\n/g, "\n"),
			blocks = text.slice(text.indexOf("\n\n") + 2).split(/\n\s*\n/),
			bare = [];
		blocks.forEach(function(block) {
			var lines = block.split("\n"),
				comment = lines.filter(function(l) { return l.charAt(0) === "#"; }).join(" "),
				entries = lines.filter(function(l) { return l.charAt(0) !== "#" && l.indexOf(":") > 0; });
			if(entries.length && !/\b(p|S)\. \d+/.test(comment)) {
				bare.push(entries[0]);
			}
		});
		assert.deepEqual(bare, []);
	});
});

test("the plugin lists its license tab", function() {
	var info = JSON.parse(fs.readFileSync(path.join(plugin, "plugin.info"), "utf8"));
	assert.deepEqual(info.list.split(" "), ["readme", "license"]);
	assert.ok(fs.existsSync(path.join(plugin, "license.tid")));
});
