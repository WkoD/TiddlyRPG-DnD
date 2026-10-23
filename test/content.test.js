/*
 * The content package content/dnd5e2014/en-GB (scripts/content/dnd5e2014/extract.js): every value of
 * every entry reads with the fields of tiddlyrpg-ruleset-dnd5e2014 in both languages, ids and
 * titles are unique, base and spells name entries of the package, and no text runs wikitext the
 * SRD does not have (only <<term>> of a condition, the sections of the ruleset, the spells of a
 * spellcasting as links); the named parts of a stat block and of an item as sections.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	fs = require("fs"),
	path = require("path"),
	h = require("./helpers");

var DIR = path.join(__dirname, "..", "content", "dnd5e2014", "en-GB"),
	// fields of the core, no schema fields
	CORE = ["price", "base", "spells", "secret-fields"];

var $tw, wiki, fields, manifest, entries;

test.before(function() {
	manifest = JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"));
	entries = [];
	manifest.files.forEach(function(file) {
		Array.prototype.push.apply(entries, JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")).entries);
	});
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = $tw.wiki;
		fields = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/fields.js");
	});
});

// The fields of an entry as a tiddler holds them
function values(entry) {
	var out = {};
	Object.keys(entry.fields).forEach(function(name) {
		out[name] = String(entry.fields[name]);
	});
	return out;
}

test("the manifest: the ruleset of this repo, the files beside it; package.json names it", function() {
	var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
	assert.deepEqual(pkg.tiddlyrpg.content, ["content/dnd5e2014/en-GB/manifest.json"]);
	assert.equal(manifest.name, "SRD 5.1 (English)", "the name says the language of the texts");
	assert.equal(manifest.tag, "SRD 5.1 English", "the tag of every taken tiddler");
	assert.equal(manifest.ruleset, "$:/plugins/tiddlyrpg-ruleset-dnd5e2014");
	assert.equal(manifest.language, "en-GB");
	assert.ok(wiki.getTiddler(manifest.ruleset), "the ruleset plugin");
	manifest.files.forEach(function(file) {
		assert.ok(fs.existsSync(path.join(DIR, file)), file);
	});
});

test("items, spells and creatures of the SRD 5.1", function() {
	var count = {};
	entries.forEach(function(e) {
		count[e.type] = (count[e.type] || 0) + 1;
	});
	assert.deepEqual(Object.keys(count).sort(), ["Creature", "Item", "Spell"]);
	assert.ok(count.Item > 600 && count.Spell > 300 && count.Creature > 300, JSON.stringify(count));
});

test("ids and titles unique in the package (an item before a creature before a spell)", function() {
	var ids = {},
		titles = {},
		twice = [];
	entries.forEach(function(e) {
		if(ids[e.id] || titles[e.title.toLowerCase()]) {
			twice.push(e.id + " " + e.title);
		}
		ids[e.id] = titles[e.title.toLowerCase()] = true;
	});
	assert.deepEqual(twice, []);
	assert.ok(titles.shield && titles["shield (spell)"], "the armor keeps the title, the spell takes the type");
});

test("no umbrella entries: a variant stands for itself", function() {
	assert.deepEqual(entries.filter(function(e) { return e.fields.rarity === "varies"; }).map(function(e) { return e.title; }), []);
	assert.equal(entries.filter(function(e) { return e.title === "Potion of Healing"; }).length, 1);
});

test("base and spells name entries of the package, by their titles", function() {
	var titles = {},
		missing = [];
	entries.forEach(function(e) {
		titles[e.title] = e.type;
	});
	entries.forEach(function(e) {
		// a title list, as the relation reads it: one title, in brackets when it has a space
		var base = $tw.utils.parseStringArray(e.fields.base || "");
		if(e.fields.base && (base.length !== 1 || titles[base[0]] !== "Item")) {
			missing.push(e.title + " base " + e.fields.base);
		}
		$tw.utils.parseStringArray(e.fields.spells || "").forEach(function(title) {
			if(titles[title] !== "Spell") {
				missing.push(e.title + " spells " + title);
			}
		});
	});
	assert.deepEqual(missing, []);
	var thrower = entries.filter(function(e) { return e.title === "Dwarven Thrower"; })[0];
	assert.equal(thrower.fields.base, "Warhammer");
	assert.equal(thrower.fields.damage, "1d8 bludgeoning", "the values of the base come along");
	assert.equal(thrower.fields.bonus, "+3");
	assert.equal(thrower.fields.price, undefined, "never the price of the base");
});

test("poisons with their damage, save and what a success does (SRD p. 204-205)", function() {
	var poison = function(title) { return entries.filter(function(e) { return e.title === title; })[0].fields; };
	assert.equal(poison("Assassin's Blood").damage, "1d12 poison");
	assert.equal(poison("Assassin's Blood")["save-success"], "half");
	assert.equal(poison("Burnt Othur Fumes")["save-success"], undefined, "no half on a success");
	assert.equal(poison("Malice").damage, undefined, "no damage: blinded");
	assert.equal(poison("Poison, basic (vial)").category, "poison, injury");
	assert.equal(poison("Poison, basic (vial)").damage, "1d4 poison");
});

test("the language Common is common-language, the rarity common", function() {
	var languages = entries.filter(function(e) { return / common-language|^common-language/.test(e.fields.languages || ""); });
	assert.ok(languages.length > 50);
	assert.equal(entries.filter(function(e) { return e.title === "Potion of Healing"; })[0].fields.rarity, "common");
});

test("a cursed item comes locked: players see the curse when the DM lifts the lock", function() {
	var cursed = entries.filter(function(e) { return e.fields.cursed; });
	assert.ok(cursed.length > 0);
	cursed.forEach(function(e) {
		assert.equal(e.fields["secret-fields"], "cursed", e.title);
	});
});

["en-GB", "de-DE"].forEach(function(code) {
	test(code + ": every value of every entry reads with the fields of its type", function() {
		h.setLanguage(wiki, code);
		var wrong = [];
		entries.forEach(function(e) {
			var schema = fields.forTypes(wiki, [e.type]),
				v = values(e);
			Object.keys(v).forEach(function(name) {
				if(CORE.indexOf(name) !== -1) {
					return;
				}
				var p = schema.fields.indexOf(name) === -1 ? {key: "not in the schema"} : fields.problem(wiki, v, name),
					spec = fields.registry(wiki).definitions[name];
				if(!p && spec && spec.when && !fields.fits(wiki, v, spec.when, schema.fields)) {
					p = {key: "when"};
				}
				if(p) {
					wrong.push(e.title + " " + name + ": " + v[name] + " (" + p.key + ")");
				}
			});
		});
		assert.deepEqual(wrong, []);
	});
});

test("every creature and spell has its header line", function() {
	h.setLanguage(wiki, "de-DE");
	var empty = entries.filter(function(e) {
		return e.type !== "Item" && !fields.summary(wiki, values(e), fields.forTypes(wiki, [e.type])).text;
	}).map(function(e) { return e.title; });
	assert.deepEqual(empty, []);
});

test("headers in the form of the SRD (de p. 438, 414, 142)", function() {
	var header = function(title) {
		var e = entries.filter(function(x) { return x.title === title; })[0];
		return fields.summary(wiki, values(e), fields.forTypes(wiki, [e.type])).text;
	};
	h.setLanguage(wiki, "de-DE");
	assert.equal(header("Wolf"), "Mittelgroßes Tier, gesinnungslos");
	assert.equal(header("Swarm of Bats"), "Mittelgroßer Schwarm winziger Tiere, gesinnungslos");
	assert.equal(header("Fireball"), "Hervorrufungszauber 3. Grades");
	assert.equal(header("Fire Bolt"), "Zaubertrick der Hervorrufung");
	h.setLanguage(wiki, "en-GB");
	assert.equal(header("Wolf"), "Medium beast, unaligned");
	assert.equal(header("Swarm of Bats"), "Medium swarm of Tiny beasts, unaligned");
	assert.equal(header("Detect Magic"), "1st-level divination (ritual)");
});

test("no text runs wikitext the SRD does not have: <<term>> of a condition, the sections of the ruleset, spells of a spellcasting as links", function() {
	var conditions = JSON.parse(wiki.getTiddlerText("$:/tiddlyrpg/rules/domain/Condition")).entries.map(function(e) { return e.id; }),
		kinds = JSON.parse(wiki.getTiddlerText("$:/tiddlyrpg/rules/domain/Section")).entries.map(function(e) { return e.id; }),
		spells = {},
		wrong = [];
	entries.forEach(function(e) {
		if(e.type === "Spell") {
			spells[e.title] = true;
		}
	});
	entries.forEach(function(e) {
		var text = e.text || "";
		// the links of a spellcasting, to spells of the package
		text = text.replace(/(<\$spellcasting [^>]*>)([^]*?)(<\/\$spellcasting>)/g, function(all, open, inner, close) {
			return open + inner.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, function(link, shown, title) {
				if(!spells[title]) {
					wrong.push(e.title + ": a link to " + title);
				}
				return shown;
			}) + close;
		});
		(text.match(/<<[^>]*>>/g) || []).forEach(function(call) {
			var term = /^<<term ([a-z]+)>>$/.exec(call),
				section = /^<<([a-z-]+) "[^"]+">>$/.exec(call);
			if(!(term && conditions.indexOf(term[1]) !== -1) && !(section && kinds.indexOf(section[1]) !== -1)) {
				wrong.push(e.title + ": " + call);
			}
		});
		(text.match(/<\/?\$[^>]*>/g) || []).forEach(function(tag) {
			var block = /^<\/?\$([a-z-]+)(?: name="[^"]+")?>$/.exec(tag);
			if(!block || kinds.indexOf(block[1]) === -1) {
				wrong.push(e.title + ": " + tag);
			}
		});
		if(/\[\[|\{\{/.test(text)) {
			wrong.push(e.title + ": link or transclusion");
		}
	});
	assert.deepEqual(wrong, []);
});

test("the named parts of a text as sections: the parts of a stat block, the effects and the curse of an item", function() {
	var text = function(title) { return entries.filter(function(e) { return e.title === title; })[0].text; };
	assert.match(text("Wolf"), /^<<trait "Pack Tactics">> The wolf has advantage/m);
	assert.match(text("Wolf"), /^<<action "Bite">> Melee Weapon Attack/m);
	assert.match(text("Mage"), /<\$spellcasting name="Spellcasting">\n\nThe mage is a 9th-level spellcaster[^]*\* 1st level \(4 slots\): \[\[detect magic\|Detect Magic\]\][^]*\[\[shield\|Shield \(Spell\)\]\][^]*\n\n<\/\$spellcasting>/,
		"a list: the block form; the spells as links by their titles in the package");
	assert.match(text("Berserker Axe"), /<\$curse name="Curse">\n\nThis axe is Cursed[^]*Whenever a Hostile creature[^]*<\/\$curse>$/, "the curse runs to the end");
	assert.match(text("Staff of Power"), /^<<effect "Retributive Strike">> /m);
});

test("a text renders as written: no link the SRD does not have", function() {
	var e = entries.filter(function(x) { return x.title === "Bag of Holding"; })[0],
		html = wiki.renderText("text/html", "text/vnd.tiddlywiki", e.text);
	assert.doesNotMatch(html, /<a /);
	assert.match(html, /500 pounds/);
});
