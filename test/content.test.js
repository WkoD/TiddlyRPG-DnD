/*
 * The content package content/dnd5e2014/en-GB (scripts/content/dnd5e2014/extract.js): every value of
 * every entry reads with the fields of tiddlyrpg-ruleset-dnd5e2014 in both languages, ids and
 * titles are unique, base and spells name entries of the package, and no text runs wikitext the
 * SRD does not have (only <<term>> of a condition, the sections of the ruleset, the spells of a
 * spellcasting as links); the named parts of a stat block and of an item as sections, the intro of
 * the legendary actions.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	fs = require("fs"),
	path = require("path"),
	h = require("./helpers");

var DIR = path.join(__dirname, "..", "content", "dnd5e2014", "en-GB"),
	// fields of the core, no schema fields: the relations and the lock
	CORE = ["price", "base", "spells", "classes", "folk", "languages", "feats", "term", "secret-fields"];

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
	// the form the server reads (content-server.js), met by the core of this run
	var core = wiki.getTiddler("$:/plugins/tiddlyrpg-core").fields.version,
		need = /^>=\s*(\d+\.\d+\.\d+\S*)$/.exec((manifest["tiddlyrpg-core-version"] || "").trim());
	assert.ok(need, "tiddlyrpg-core-version as >=x.y.z: " + manifest["tiddlyrpg-core-version"]);
	assert.ok($tw.utils.checkVersions(core, need[1]), "tiddlyrpg-core " + core + " meets " + need[0]);
});

test("prices: a number or a range [lo, hi] in the reference coin, readable in the coins of the setting", function() {
	var content = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/content.js"),
		currency = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/currency.js"),
		cur = currency.active(wiki),
		bad = [];
	entries.forEach(function(e) {
		var p = e.fields.price;
		if(p === undefined) {
			return;
		}
		var shape = typeof p === "number" ? p > 0 : Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number" && p[0] < p[1];
		var price = content.toFields(wiki, manifest, e, e.title).price;
		if(!shape || currency.check(wiki, cur, price)) {
			bad.push(e.title + ": " + JSON.stringify(p) + " -> " + price);
		}
	});
	assert.deepEqual(bad, []);
	assert.ok(currency.check(wiki, cur, "zehn"), "the check reports an unreadable price");
});

test("every text renders without a raw table row", function() {
	// a paragraph that starts with "|": the row of a table TiddlyWiki did not read as one (as HTML -
	// the plain text runs the paragraphs together)
	var raw = /<p>\s*\|/,
		html = function(text) { return h.render(wiki, "text/html", text); };
	assert.ok(raw.test(html("|!Level |!Features |! \n|1st|Rage|")), "a broken header stays raw");
	assert.ok(raw.test(html("|!Face |!Effect |\n\n&#124; 1 | Gases")), "a row without its closing | stays raw");
	assert.ok(!raw.test(html("|!Face |!Effect |\n| 1 | Gases |")), "a table is none");
	assert.deepEqual(entries.filter(function(e) { return raw.test(html(e.text || "")); }).map(function(e) { return e.title; }), []);
});

test("items, spells, creatures, classes, folks, traits, languages, the feat and the glossary of the SRD 5.1", function() {
	var count = {};
	entries.forEach(function(e) {
		count[e.type] = (count[e.type] || 0) + 1;
	});
	assert.deepEqual(Object.keys(count).sort(), ["Class", "Creature", "Feat", "Folk", "Glossary", "Item", "Language", "Spell", "Trait"]);
	assert.ok(count.Item > 600 && count.Spell > 300 && count.Creature > 300, JSON.stringify(count));
	assert.ok(count.Class > 100 && count.Folk === 23 && count.Trait > 20 && count.Language === 16 && count.Feat === 1 && count.Glossary === 47, JSON.stringify(count));
	assert.deepEqual(entries.filter(function(e) { return ["Class", "Folk", "Trait", "Language", "Feat", "Glossary"].indexOf(e.type) !== -1 && e.tags.join() !== "Information"; }).map(function(e) { return e.title; }), [],
		"a category of Information: the tag Information beside the type");
});

test("ids and titles unique in the package (a class or folk before an item before a creature before a spell)", function() {
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
	assert.ok(titles.druid && titles["druid (creature)"], "the class keeps the title, the creature takes the type");
	assert.ok(titles["darkvision"] && titles["darkvision (glossary)"], "the spell keeps the title, the glossary takes the type");
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
		// classes and folk: what a spell, an item or an entry of the tree belongs to
		[["classes", "Class"], ["folk", "Folk"], ["languages", "Language"], ["feats", "Feat"]].forEach(function(pair) {
			$tw.utils.parseStringArray(e.fields[pair[0]] || "").forEach(function(title) {
				if(titles[title] !== pair[1]) {
					missing.push(e.title + " " + pair[0] + " " + title);
				}
			});
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

test("the languages are entries: a creature names Common (Language); the rarity common", function() {
	var languages = entries.filter(function(e) { return /\[\[Common \(Language\)\]\]/.test(e.fields.languages || ""); });
	assert.ok(languages.length > 50);
	assert.deepEqual(entries.filter(function(e) { return e.title === "Goblin"; })[0].fields.languages, "[[Common (Language)]] [[Goblin (Language)]]");
	assert.equal(entries.filter(function(e) { return e.title === "Potion of Healing"; })[0].fields.rarity, "common");
});

// Stat blocks of the SRD: what a creature only understands is no language it speaks; a note on a
// sense stays in the text
test("a creature speaks only its languages, what it understands stays in its text; a note on a sense too", function() {
	var get = function(title) { return entries.filter(function(e) { return e.title === title; })[0]; },
		kraken = get("Kraken"), pegasus = get("Pegasus"), cube = get("Gelatinous Cube"), grimlock = get("Grimlock");
	assert.equal(kraken.fields.languages, undefined);
	assert.match(kraken.text, /''Languages:'' understands Abyssal, Celestial, Infernal, and Primordial but can't speak/);
	assert.match(kraken.fields.senses, /telepathy 120 ft/);
	assert.equal(pegasus.fields.languages, undefined);
	assert.equal(get("Invisible Stalker").fields.languages, undefined, "Auran is no language of the SRD; Common only understood");
	assert.equal(cube.fields.senses, "blindsight 60 ft");
	assert.match(cube.text, /blindsight 60 ft\. \(blind beyond this radius\)/);
	assert.equal(grimlock.fields.senses, "blindsight 30 ft");
	assert.match(grimlock.text, /blindsight 30 ft\. or 10 ft\. while deafened \(blind beyond this radius\)/);
});

// What 5e-bits holds beside the text (quantity, contents, special) and the fixed sentences of the SRD
// for charges, bonuses and scores, read as the SRD means them
test("items: bundles, packs, special rules, one charge a day, bonuses and scores as the SRD says", function() {
	var get = function(title) { return entries.filter(function(e) { return e.title === title; })[0]; },
		f = function(title) { return get(title).fields; };
	assert.match(get("Arrow").text, /bundle of 20/);
	assert.equal(f("Arrow").price, 1, "the price of the bundle");
	assert.equal(f("Arrow of Slaying").base, "Arrow");
	assert.equal(f("Arrow of Slaying").weight, undefined, "one arrow, not the weight of the bundle of its base");
	assert.match(get("Burglar's Pack").text, /Contents:[^]*\* 5 × Candle/);
	assert.match(get("Lance").text, /disadvantage when you use a lance/);
	assert.match(get("Net").text, /<<term restrained>>/);
	assert.equal(entries.filter(function(e) { return e.title === "Elephant"; })[0].fields["carrying-capacity"], "1320 lb", "no thousands comma");
	["Gray Bag of Tricks", "Staff of Thunder and Lightning", "Necklace of Prayer Beads", "Rod of Lordly Might", "Luck Blade"].forEach(function(t) {
		assert.equal(f(t).charges, undefined, t + ": not one use a day");
	});
	assert.equal(f("Pearl of Power").charges, "1");
	assert.equal(f("Arrow-Catching Shield").bonus, undefined, "only against ranged attacks");
	assert.equal(f("Bracers of Defense").bonus, undefined, "only without armor and shield");
	assert.equal(f("Rod of Alertness").bonus, undefined, "for every creature in the light");
	assert.deepEqual([f("Ring of Protection").bonus, f("Ring of Protection")["saving-throw-bonus"]], ["+1", "+1"]);
	assert.deepEqual([f("Staff of Power").bonus, f("Staff of Power")["saving-throw-bonus"], f("Staff of Power")["spell-attack-bonus"]], ["+2", "+2", "+2"]);
	assert.equal(f("Wand of the War Mage, +3")["spell-attack-bonus"], "+3");
	assert.deepEqual([f("Belt of Hill Giant Strength").ability, f("Belt of Hill Giant Strength")["ability-score"]], ["str", "21"]);
	assert.deepEqual([f("Ioun Stone of Agility")["ability-score"], f("Ioun Stone of Agility")["ability-max"]], ["+2", "20"]);
	assert.equal(f("Manual of Bodily Health").ability, undefined, "a lasting increase stays in the text");
	assert.deepEqual([f("Ammunition, +2").category, f("Ammunition, +2").bonus, get("Ammunition, +2").tags.join()], ["ammunition", "+2", "Consumable"]);
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
		return (e.type === "Creature" || e.type === "Spell") && !fields.summary(wiki, values(e), fields.forTypes(wiki, [e.type])).text;
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
		section = JSON.parse(wiki.getTiddlerText("$:/tiddlyrpg/rules/domain/Section")).entries,
		kinds = section.map(function(e) { return e.id; }),
		intros = section.filter(function(e) { return e.intro; }).map(function(e) { return e.id; }),
		spells = {},
		wrong = [];
	entries.forEach(function(e) {
		if(e.type === "Spell") {
			spells[e.title] = true;
		}
	});
	entries.forEach(function(e) {
		var text = e.text || "";
		// the links of a spellcasting (a section runs to the next marker), to spells of the package
		text = text.split(/\n\n(?=<<)/).map(function(part) {
			return /^<<spellcasting[ >]/.test(part) ? part.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, function(link, shown, title) {
				if(!spells[title]) {
					wrong.push(e.title + ": a link to " + title);
				}
				return shown;
			}) : part;
		}).join("\n\n");
		(text.match(/<<[^>]*>>/g) || []).forEach(function(call) {
			var term = /^<<term ([a-z]+)>>$/.exec(call),
				named = /^<<([a-z-]+) (?:"[^"]+"|'[^']+')>>$/.exec(call),
				intro = /^<<([a-z-]+)>>$/.exec(call);
			// a section has a name; without one only the intro of a kind that has one
			if(!(term && conditions.indexOf(term[1]) !== -1) && !(named && kinds.indexOf(named[1]) !== -1) &&
				!(intro && intros.indexOf(intro[1]) !== -1)) {
				wrong.push(e.title + ": " + call);
			}
		});
		if(/<\/?\$/.test(text)) {
			wrong.push(e.title + ": a widget or block");
		}
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
	assert.match(text("Mage"), /^<<spellcasting "Spellcasting">> The mage is a 9th-level spellcaster[^]*\* 1st level \(4 slots\): \[\[detect magic\|Detect Magic\]\][^]*\[\[shield\|Shield \(Spell\)\]\]/m,
		"a list belongs to the section; the spells as links by their titles in the package");
	assert.match(text("Berserker Axe"), /^<<curse "Curse">> This axe is Cursed[^]*\n\nWhenever a Hostile creature/m, "the curse with the paragraph after it");
	assert.match(text("Adult Red Dragon"), /^<<legendary-action>> The dragon can take 3 legendary actions, choosing from the options below\.[^\n]*The dragon regains spent legendary actions at the start of its turn\.\n\n<<legendary-action "Detect">>/m,
		"the intro of the legendary actions, which 5e-bits leaves out");
	assert.match(text("Deck of Many Things"), /^<<effect "The Fates">> /m, "bold only");
	assert.equal((text("Deck of Many Things").match(/^<<effect "/mg) || []).length, 22, "all 22 cards: 5e-bits ends at Skull, the rest from the SRD p. 217-218");
	assert.match(text("Deck of Many Things"), /^<<effect "The Void">> This black card spells disaster\./m);
	assert.match(text("Archmage"), /^''Damage Resistances:'' bludgeoning, piercing, and slashing from nonmagical attacks \(from stoneskin\)$/m,
		"a resistance that is no damage type stays text, with its label");
	assert.match(text("Djinni"), /\n\n\* At will: \[\[detect evil and good\|Detect Evil and Good\]\][^\n]*\n\* 3\/day each: \[\[create food and water \(can create wine instead of water\)\|Create Food and Water\]\]/,
		"innate spellcasting: its lines one list, the spells as links");
	assert.match(text("Cult Fanatic"), /\* Cantrips \(at will\): \[\[light\|Light\]\][^\n]*\n\* 1st level \(4 slots\): \[\[command\|Command\]\]/, "a paragraph of cantrips joins the list");
	var unlinked = entries.filter(function(e) {
		return (e.text || "").split(/\n\n(?=<<)/).some(function(part) {
			return /^<<spellcasting[ >]/.test(part) && /(?:^|\s)(?:At will|\d+\/day(?: each)?|Cantrips \(at will\)|\d+(?:st|nd|rd|th) level \([^)]*\)): (?!\[\[)/m.test(part);
		});
	}).map(function(e) { return e.title; });
	assert.deepEqual(unlinked, [], "every spell list of a spellcasting links its spells (a mephit names one spell in its sentence)");
	assert.match(text("Lamia"), /requiring no material components\.\n\n\* At will: \[\[disguise self \(any humanoid form\)\|Disguise Self\]\][^\n]*\n\* 3\/day each: [^\n]*\n\* 1\/day: \[\[geas\|Geas\]\]/,
		"a list run into its sentence");
	assert.match(text("Archmage"), /\* 9th level \(1 slot\): \[\[time stop\|Time Stop\]\]\n\* The archmage casts these spells on itself before combat\./, "the footnote stays in the list");
	assert.doesNotMatch(entries.map(function(e) { return e.text || ""; }).join("\n"), /^!! /m, "the headings come from the ruleset");
	assert.match(text("Staff of Power"), /^<<effect "Retributive Strike">> /m);
	assert.match(text("Staff of the Woodlands"), /without using any charges\.\n\n<<effect "Tree Form">> You can use an action to plant/,
		"a part 5e-bits glues to the paragraph before, without its bold name: its own as in the SRD p. 245");
});

test("a text renders as written: no link the SRD does not have", function() {
	var e = entries.filter(function(x) { return x.title === "Bag of Holding"; })[0],
		html = wiki.renderText("text/html", "text/vnd.tiddlywiki", e.text);
	assert.doesNotMatch(html, /<a /);
	assert.match(html, /500 pounds/);
});

// A row of a table of TiddlyWiki ends in "|": a header row that did not ("|!d10 |!Damage Type |! ")
// turned the whole table into a paragraph of raw bars
test("every table of a text is a table: each row ends in a bar, the header row first", function() {
	var bad = [];
	entries.forEach(function(e) {
		(e.text || "").split("\n").forEach(function(line) {
			if(line.charAt(0) === "|" && !/\|[hfck]?$/.test(line)) {
				bad.push(e.title + ": " + line);
			}
		});
	});
	assert.deepEqual(bad, []);
	var html = wiki.renderText("text/html", "text/vnd.tiddlywiki", entries.filter(function(x) { return x.title === "Wand of Wonder"; })[0].text);
	assert.match(html, /<table><tbody><tr class="evenRow"><th align="left">d100<\/th><th align="left">Effect<\/th><\/tr>/);
	assert.doesNotMatch(html, /<p>\|/);
});

test("the classes: a class with its values and table, a subclass under its SRD name, the lasting choices in the tree", function() {
	var get = function(title) {
		return entries.filter(function(e) { return e.title === title; })[0];
	};
	var sorcerer = get("Sorcerer");
	assert.deepEqual(sorcerer.fields, {"hit-die": "1d6", "saving-throws": "con, cha", "spellcasting-ability": "cha"});
	assert.match(sorcerer.text, /^''Proficiencies:'' Daggers; Darts/);
	assert.match(sorcerer.text, /\n\|!Level \|!Proficiency Bonus \|!Features \|!Sorcery Points \|!Cantrips Known \|!Spells Known \|\n/,
		"the columns of the SRD (p. 42), no Metamagic Known");
	assert.match(sorcerer.text, /\n''Spell Slots per Spell Level''\n\n\|!Level \|!1st \|.*!9th \|\n/, "the slots a table of their own");
	assert.match(sorcerer.text, /\n\|20th \|4 \|3 \|3 \|3 \|3 \|2 \|2 \|1 \|1 \|\n/);
	assert.match(get("Barbarian").text, /\n\|!Level \|!Proficiency Bonus \|!Features \|!Rages \|!Rage Damage \|\n[^]*\n\|20th \|\+6 \|Primal Champion \|Unlimited \|\+4 \|/, "SRD p. 8");
	assert.match(get("Monk").text, /\n\|3rd \|\+2 \|[^|]*\|1d4 \|3 \|\+10 ft\. \|/, "SRD p. 26");
	assert.match(get("Warlock").text, /\|!Spell Slots \|!Slot Level \|!Invocations Known \|\n[^]*\n\|20th \|\+6 \|Eldritch Master \|4 \|15 \|4 \|5th \|8 \|/, "SRD p. 46");
	assert.doesNotMatch(get("Warlock").text, /Spell Slots per Spell Level/);
	// Every cell of the last column, where 5e-bits had 3 at level 4 and 4 at level 6
	assert.deepEqual(get("Warlock").text.split("\n").filter(function(l) { return /^\|\d/.test(l); }).map(function(l) { return l.split("|")[8].trim(); }),
		["-", "2", "2", "2", "3", "3", "4", "4", "5", "5", "5", "6", "6", "6", "7", "7", "7", "8", "8", "8"], "Invocations Known, SRD p. 46");
	entries.filter(function(e) { return e.type === "Class" && !e.fields.classes; }).forEach(function(c) {
		c.text.split("\n").filter(function(l) { return /^\|/.test(l); }).forEach(function(l) {
			assert.ok(l.split("|").length - 2 <= 10, c.title + ": at most 10 columns, so that the table fits a tiddler: " + l);
		});
	});
	assert.match(sorcerer.text, /<<feature "Spellcasting">> .*\n\n''\/\/Cantrips\.\/\/''/);
	assert.match(get("Fighter").text, /''Multiclassing:'' Strength 13 or Dexterity 13/, "SRD p. 56");
	assert.deepEqual(get("Draconic Bloodline").fields, {classes: "Sorcerer"});
	assert.deepEqual(get("Dragon Ancestor: Red").fields, {classes: "[[Draconic Bloodline]]", "damage-type": "fire"});
	assert.equal(get("Fighting Style: Archery").fields.classes, "Fighter Ranger");
	assert.equal(get("Fighting Style: Defense").fields.classes, "Fighter Paladin Ranger");
	assert.equal(get("Eldritch Invocation: Book of Ancient Secrets").fields.classes, "[[Pact of the Tome]]");
	assert.equal(get("Pact of the Tome").fields.classes, "Warlock");
	assert.equal(get("Spellcaster").fields.classes, "Bard Cleric Druid Paladin Ranger Sorcerer Warlock Wizard");
	assert.match(get("Life Domain").fields.spells, /^Bless \[\[Cure Wounds\]\]/);
	assert.match(get("Circle of the Land: Forest").fields.spells, /^Barkskin \[\[Spider Climb\]\]/);
	assert.equal(get("Fireball").fields.classes, "Sorcerer Wizard", "a spell names classes only");
	assert.equal(get("Wand of Fireballs").fields.classes, "Spellcaster");
	["Path of the Berserker", "College of Lore", "Life Domain", "Circle of the Land", "Champion", "Way of the Open Hand",
		"Oath of Devotion", "Hunter", "Thief", "Draconic Bloodline", "The Fiend", "School of Evocation"].forEach(function(title) {
		assert.equal(get(title).type, "Class", title);
	});
});

test("the folks: a folk with its values, a subfolk and a draconic ancestry in its tree", function() {
	var get = function(title) {
		return entries.filter(function(e) { return e.title === title; })[0];
	};
	assert.deepEqual(get("Dwarf").fields, {size: "medium", speed: "walk 25 ft", senses: "darkvision 60 ft",
		languages: "[[Common (Language)]] [[Dwarvish (Language)]]", "ability-bonuses": "con +2"});
	assert.doesNotMatch(get("Dwarf").text, /<<trait/, "the traits are entries of their own");
	assert.equal(get("Dwarven Resilience").fields.folk, "Dwarf");
	assert.equal(get("Fey Ancestry").fields.folk, "Elf Half-Elf");
	assert.equal(get("Dwarven Toughness").fields.folk, "[[Hill Dwarf]]");
	assert.deepEqual(entries.filter(function(e) { return e.type === "Trait" && /^Darkvision/.test(e.title); }), [], "Darkvision is the field senses, no trait");
	assert.deepEqual(get("Hill Dwarf").fields, {folk: "Dwarf", "ability-bonuses": "wis +1"});
	assert.deepEqual(get("Black Dragonborn").fields, {folk: "Dragonborn", "damage-type": "acid", area: "30 ft", "area-shape": "line", save: "dex"});
});

test("languages, the feat and the glossary: their values and terms", function() {
	var get = function(title) {
		return entries.filter(function(e) { return e.title === title; })[0];
	};
	assert.deepEqual(get("Common (Language)").fields, {"language-type": "standard", script: "Common"});
	assert.equal(get("Abyssal (Language)").fields["language-type"], "exotic");
	assert.deepEqual(get("Grappler").fields, {prerequisites: "str 13"});
	assert.match(get("Grappler").text, /close-quarters grappling/, "the mistakes of 5e-bits mended");
	assert.deepEqual(get("Frightened").fields, {term: "frightened"});
	assert.deepEqual(get("Use an Object").fields, {term: "use-an-object"});
	assert.deepEqual(get("Darkvision (Glossary)").fields, {term: "darkvision"});
	var language = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/language.js"),
		domains = language.domains(wiki),
		unknown = entries.filter(function(e) { return e.type === "Glossary"; }).filter(function(e) {
			return !["Condition", "Skill", "Action", "Sense"].some(function(d) {
				return (domains[d].entries || []).some(function(x) { return x.id === e.fields.term; });
			});
		}).map(function(e) { return e.title + " " + e.fields.term; });
	assert.deepEqual(unknown, [], "every term of the glossary is a term of the ruleset");
});
