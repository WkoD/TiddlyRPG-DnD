/*
 * The content package content/dnd5e2014 (scripts/content/dnd5e2014/extract.js): every value of
 * every entry reads with the fields of tiddlyrpg-ruleset-dnd5e2014 in both languages, ids and
 * titles are unique, base and spells name entries of the package, and no text runs wikitext the
 * SRD does not have (only <<term>> of a condition).
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	fs = require("fs"),
	path = require("path"),
	h = require("./helpers");

var DIR = path.join(__dirname, "..", "content", "dnd5e2014"),
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
	assert.deepEqual(pkg.tiddlyrpg.content, ["content/dnd5e2014/manifest.json"]);
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
		if(e.fields.base && titles[e.fields.base] !== "Item") {
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

test("no text runs wikitext the SRD does not have: only <<term>> of a condition", function() {
	var conditions = JSON.parse(wiki.getTiddlerText("$:/tiddlyrpg/rules/domain/Condition")).entries.map(function(e) { return e.id; }),
		wrong = [];
	entries.forEach(function(e) {
		var text = e.text || "";
		(text.match(/<<[^>]*>>/g) || []).forEach(function(call) {
			var m = /^<<term ([a-z]+)>>$/.exec(call);
			if(!m || conditions.indexOf(m[1]) === -1) {
				wrong.push(e.title + ": " + call);
			}
		});
		if(/\[\[|\{\{|<\$|<</.test(text.replace(/<<term [a-z]+>>/g, ""))) {
			wrong.push(e.title + ": link, transclusion or widget");
		}
	});
	assert.deepEqual(wrong, []);
});

test("a text renders as written: no link the SRD does not have", function() {
	var e = entries.filter(function(x) { return x.title === "Bag of Holding"; })[0],
		html = wiki.renderText("text/html", "text/vnd.tiddlywiki", e.text);
	assert.doesNotMatch(html, /<a /);
	assert.match(html, /500 pounds/);
});
