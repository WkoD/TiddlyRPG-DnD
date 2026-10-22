#!/usr/bin/env node
/*
 * The content package of tiddlyrpg-ruleset-dnd5e2014: the items, spells and creatures of the
 * SRD 5.1 (English) as entries for tiddlyrpg-core (module header of modules/content-server.js in
 * TiddlyRPG-Plugins), written to content/dnd5e2014/en-GB/ - the language of the texts in the path,
 * a package in another language would stand beside it.
 *
 * Source: the SRD data of 5e-bits (https://github.com/5e-bits/5e-database, MIT), tag VERSION,
 * fetched into the cache folder beside this script (not checked in). What 5e-bits does not have -
 * trade goods, food and drink, poisons - comes from the SRD 5.1 itself (srd-tables.js beside this
 * script, with the pages). Usage:
 *
 *   node scripts/content/dnd5e2014/extract.js            fetch (if not cached) and write
 *
 * Decisions (see README.md "Content package"):
 *   - titles unique in the package: item before creature before spell ("Shield (Spell)");
 *   - umbrella entries of 5e-bits (with "variants") fall away, their variants stay;
 *   - mounts and the goat are creatures with price and carrying capacity, vehicles are items;
 *   - the weapon groups (sword, axe ...) and the kind of ammunition of a weapon are our reading,
 *     the SRD does not list them (GROUPS, AMMUNITION below);
 *   - a magic item that names one item ("Weapon (warhammer)") gets base and all its values;
 *   - prices are numbers in gp (the reference coin of the ruleset; the core writes them in the
 *     coins of the setting), weights in lb;
 *   - texts are wikitext: the Markdown of 5e-bits converted, every character that would start
 *     markup of TiddlyWiki written as an entity, conditions as <<term>>.
 */
"use strict";

var fs = require("fs"),
	path = require("path"),
	https = require("https"),
	tables = require("./srd-tables.js");

var VERSION = "v5.12.0",
	BASE = "https://raw.githubusercontent.com/5e-bits/5e-database/" + VERSION + "/src/2014/en/",
	CACHE = path.join(__dirname, "cache", VERSION),
	OUT = path.join(__dirname, "..", "..", "..", "content", "dnd5e2014", "en-GB"),
	FILES = ["Equipment", "Magic-Items", "Spells", "Monsters"];

/* Fetching */

function get(url) {
	return new Promise(function(resolve, reject) {
		https.get(url, function(res) {
			if(res.statusCode !== 200) {
				reject(new Error(url + ": " + res.statusCode));
				return;
			}
			var chunks = [];
			res.on("data", function(c) { chunks.push(c); });
			res.on("end", function() { resolve(Buffer.concat(chunks).toString("utf8")); });
		}).on("error", reject);
	});
}

function load(name) {
	var file = path.join(CACHE, name + ".json");
	if(fs.existsSync(file)) {
		return Promise.resolve(JSON.parse(fs.readFileSync(file, "utf8")));
	}
	return get(BASE + "5e-SRD-" + name + ".json").then(function(text) {
		fs.mkdirSync(CACHE, {recursive: true});
		fs.writeFileSync(file, text);
		return JSON.parse(text);
	});
}

/* Text: Markdown of 5e-bits -> wikitext */

// Characters that would start markup of TiddlyWiki, as entities
function escape(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/\[\[/g, "&#91;&#91;")
		.replace(/\{\{/g, "&#123;&#123;")
		.replace(/''/g, "&#39;&#39;")
		.replace(/\/\//g, "&#47;&#47;")
		.replace(/__/g, "&#95;&#95;")
		.replace(/~~/g, "&#126;&#126;")
		.replace(/\^\^/g, "&#94;&#94;")
		.replace(/,,/g, "&#44;&#44;")
		.replace(/`/g, "&#96;")
		.replace(/@@/g, "&#64;&#64;")
		.replace(/\$\$/g, "&#36;&#36;");
}

var CONDITIONS = ["blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated", "invisible",
	"paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];

// A condition after a verb that gives it ("is poisoned", "the prone condition") as <<term>>
function terms(text) {
	var list = CONDITIONS.join("|");
	return text
		.replace(new RegExp("\\b(is|are|be|becomes|become|been|being|falls|knocked|left) (" + list + ")\\b", "g"), "$1 <<term $2>>")
		.replace(new RegExp("\\bthe (" + list + ") condition\\b", "g"), "the <<term $1>> condition");
}

// One line of text: bold, italics, escapes
function inline(line) {
	var out = "",
		re = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/g,
		pos = 0,
		m;
	while((m = re.exec(line))) {
		out += terms(escape(line.slice(pos, m.index)));
		if(m[1] !== undefined) {
			out += "''//" + escape(m[1]) + "//''";
		} else if(m[2] !== undefined) {
			out += "''" + escape(m[2]) + "''";
		} else {
			out += "//" + escape(m[3] !== undefined ? m[3] : m[4]) + "//";
		}
		pos = m.index + m[0].length;
	}
	out += terms(escape(line.slice(pos)));
	// A line must not start markup of a block
	return out.replace(/^([!#*;:>|-])/, function(c) { return "&#" + c.charCodeAt(0) + ";"; });
}

// The lines of 5e-bits (paragraphs, tables, lists) as wikitext
function wikitext(lines) {
	var out = [];
	(lines || []).forEach(function(line) {
		String(line).split("\n").forEach(function(part) {
			var trimmed = part.trim();
			if(!trimmed) {
				return;
			}
			if(/^\|.*\|$/.test(trimmed)) {
				if(/^\|[\s:|-]+\|$/.test(trimmed)) {
					// the separator after the header: the header row becomes |!...|
					var head = out.pop();
					out.push(head.replace(/\|([^|]*)/g, function(all, cell) { return cell.trim() || all === "|" ? "|!" + cell.trim() + " " : all; }).replace(/\|! \|!$/, "|"));
					return;
				}
				var cells = trimmed.slice(1, -1).split("|").map(function(c) { return inline(c.trim()).replace(/^&#124;/, ""); });
				out.push("|" + cells.join(" |") + " |");
				return;
			}
			if(/^[-*] /.test(trimmed)) {
				out.push("* " + inline(trimmed.slice(2)));
				return;
			}
			out.push(inline(trimmed));
		});
	});
	// paragraphs apart, table rows and list items together
	return out.reduce(function(text, line, i) {
		var prev = out[i - 1] || "",
			together = (line.charAt(0) === "|" && prev.charAt(0) === "|") || (line.indexOf("* ") === 0 && prev.indexOf("* ") === 0);
		return text + (i ? (together ? "\n" : "\n\n") : "") + line;
	}, "");
}

/* Values */

function priceOf(cost) {
	if(!cost || !cost.quantity) {
		return undefined;
	}
	var factor = {cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10}[cost.unit];
	return Math.round(cost.quantity * factor * 100) / 100;
}

function feet(text) {
	return String(text).replace(/\s*feet\b|\s*foot\b|\s*ft\.?/g, " ft").replace(/\s+/g, " ").trim();
}

function cr(value) {
	return {0.125: "1/8", 0.25: "1/4", 0.5: "1/2"}[value] || String(value);
}

function signed(n) {
	return (n < 0 ? "" : "+") + n;
}

/* Equipment */

// Our reading: the group of a weapon (magic items say "any sword") and the ammunition it shoots
var GROUPS = {
	sword: ["Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"],
	axe: ["Battleaxe", "Greataxe", "Handaxe"],
	bow: ["Longbow", "Shortbow"],
	crossbow: ["Crossbow, hand", "Crossbow, heavy", "Crossbow, light"],
	mace: ["Mace"],
	hammer: ["Light hammer", "Warhammer", "Maul"],
	polearm: ["Glaive", "Halberd", "Pike"],
	spear: ["Spear", "Javelin", "Trident"]
};
var AMMUNITION = {Longbow: "arrow", Shortbow: "arrow", "Crossbow, hand": "bolt", "Crossbow, heavy": "bolt",
	"Crossbow, light": "bolt", Sling: "sling-bullet", Blowgun: "blowgun-needle"};
var AMMO_ITEMS = {Arrow: "arrow", "Crossbow bolt": "bolt", "Sling bullet": "sling-bullet", "Blowgun needle": "blowgun-needle"};
var PROPERTIES = ["ammunition", "finesse", "heavy", "light", "loading", "reach", "special", "thrown", "two-handed", "versatile"];

function groupOf(name) {
	return Object.keys(GROUPS).filter(function(g) { return GROUPS[g].indexOf(name) !== -1; });
}

function equipment(e) {
	var cat = e.equipment_category.index,
		fields = {},
		category = [];
	if(cat === "weapon") {
		category = ["weapon", e.weapon_category.toLowerCase(), e.weapon_range.toLowerCase()].concat(groupOf(e.name));
		(e.properties || []).forEach(function(p) {
			if(PROPERTIES.indexOf(p.index) !== -1) {
				category.push(p.index);
			}
		});
		if(AMMUNITION[e.name]) {
			category.push(AMMUNITION[e.name]);
		}
		if(e.damage) {
			fields.damage = e.damage.damage_dice + " " + e.damage.damage_type.index;
		}
		if(e.two_handed_damage) {
			fields["damage-versatile"] = e.two_handed_damage.damage_dice;
		}
		var range = e.weapon_range === "Ranged" ? e.range : e.throw_range;
		if(range && range.long) {
			fields.range = range.normal + "/" + range.long + " ft";
		} else if(range && range.normal && e.weapon_range === "Ranged") {
			fields.range = range.normal + " ft";
		}
	} else if(cat === "armor") {
		if(e.armor_category === "Shield") {
			category = ["shield"];
			fields.ac = signed(e.armor_class.base);
		} else {
			category = ["armor", e.armor_category.toLowerCase()];
			fields.ac = String(e.armor_class.base);
			if(e.armor_class.dex_bonus) {
				fields["ac-dex"] = "yes";
				if(e.armor_class.max_bonus) {
					fields["ac-dex-max"] = String(e.armor_class.max_bonus);
				}
			}
			if(e.str_minimum) {
				fields["strength-min"] = String(e.str_minimum);
			}
			if(e.stealth_disadvantage) {
				fields.stealth = "disadvantage";
			}
		}
	} else if(cat === "adventuring-gear") {
		var gear = e.gear_category && e.gear_category.index;
		if(gear === "ammunition") {
			category = ["ammunition"].concat(AMMO_ITEMS[e.name] ? [AMMO_ITEMS[e.name]] : []);
		} else if(gear === "arcane-foci") {
			category = ["focus", "arcane"];
		} else if(gear === "druidic-foci") {
			category = ["focus", "druidic"];
		} else if(gear === "holy-symbols") {
			category = ["focus", "holy"];
		} else if(gear === "equipment-packs") {
			category = ["equipment-pack"];
		} else {
			category = ["adventuring-gear"];
		}
	} else if(cat === "tools") {
		category = ["tool"].concat({"Artisan's Tools": ["artisan"], "Musical Instrument": ["instrument"], "Gaming Sets": ["gaming"]}[e.tool_category] || []);
	} else if(cat === "mounts-and-vehicles") {
		if(e.vehicle_category === "Waterborne Vehicles") {
			category = ["vehicle", "water"];
			if(e.speed) {
				fields["travel-speed"] = e.speed.quantity + " mph";
			}
		} else if(/saddle|barding|bit and bridle|feed|saddlebags|stabling/i.test(e.name)) {
			category = ["tack"];
		} else {
			category = ["vehicle", "land"];
		}
		if(e.capacity) {
			fields.capacity = feetless(e.capacity);
		}
	} else {
		return null;
	}
	fields.category = category.join(", ");
	if(e.weight) {
		fields.weight = e.weight + " lb";
	}
	var price = priceOf(e.cost);
	if(price !== undefined) {
		fields.price = price;
	}
	sentences((e.desc || []).join("\n"), fields);
	return {id: "item:" + e.index, title: e.name, type: "Item", tags: tagsOf(category), fields: fields, text: wikitext(e.desc)};
}

function feetless(text) {
	return String(text).replace(/\s*lb\.?/, " lb");
}

// The category tag of the wiki of the first main entry that names one (ItemCategory "tag")
var TAGS = {weapon: "Equipment", armor: "Equipment", shield: "Equipment", ammunition: "Consumable", focus: "Equipment",
	"food-and-drink": "Consumable", poison: "Consumable", "wondrous-item": "Equipment", ring: "Equipment", rod: "Equipment",
	staff: "Equipment", wand: "Equipment", potion: "Consumable", scroll: "Consumable"};

function tagsOf(category) {
	var main = category.filter(function(c) { return TAGS[c]; })[0];
	// ammunition is a trait of a weapon, a main entry alone
	if(main === "ammunition" && category.indexOf("weapon") !== -1) {
		main = "weapon";
	}
	return main ? [TAGS[main]] : [];
}

/* Magic items */

var KINDS = {"wondrous item": "wondrous-item", "wondrous items": "wondrous-item", "wondous item": "wondrous-item",
	potion: "potion", ring: "ring", weapon: "weapon", armor: "armor", wand: "wand", staff: "staff", scroll: "scroll", rod: "rod"};

function magicItem(m, equipmentByName) {
	if(m.variants && m.variants.length) {
		return null;
	}
	var desc = m.desc.slice(),
		head = desc.shift(),
		match = /^([^,(]+?)\s*(?:\(([^)]*)\))?\s*,\s*([a-z ]+?)\s*(?:\((requires attunement([^)]*))\))?\s*$/i.exec(head),
		fields = {},
		category = [];
	if(!match) {
		throw new Error("head of " + m.name + ": " + head);
	}
	var kind = KINDS[match[1].trim().toLowerCase()],
		inner = (match[2] || "").trim(),
		base = null;
	category.push(kind);
	if(kind === "weapon" || kind === "armor") {
		var any = /^any (\w+)/i.exec(inner);
		if(any && GROUPS[any[1].toLowerCase()]) {
			category.push(any[1].toLowerCase());
		} else if(inner && !/^any\b|,| or /i.test(inner)) {
			base = equipmentByName[inner.toLowerCase()] || equipmentByName[inner.toLowerCase() + " armor"] || null;
		}
	}
	var rarity = match[3].trim().toLowerCase().replace(/ /g, "-");
	fields.rarity = rarity === "common" ? "common-rarity" : rarity;
	if(match[4]) {
		fields.attunement = "yes";
		var by = /^ by an? (.*)$/.exec(match[5] || "");
		if(by) {
			var classes = by[1].split(/,\s*|\s+or\s+|\s+and\s+/).map(function(c) { return c.replace(/^an? /, "").trim().toLowerCase(); }).filter(Boolean);
			if(classes.every(function(c) { return CLASSES.indexOf(c) !== -1; })) {
				fields.classes = classes.join(", ");
			}
		}
	}
	if(base) {
		// the values of the base item come along, nothing is inherited
		Object.keys(base.fields).forEach(function(name) {
			if(name !== "price") {
				fields[name] = base.fields[name];
			}
		});
		fields.base = base.title;
		category = base.fields.category.split(", ");
		fields.rarity = rarity === "common" ? "common-rarity" : rarity;
	}
	fields.category = category.join(", ");
	var text = desc.join("\n");
	charges(text, fields);
	var bonus = /(?:have|gain) a \+(\d) bonus to attack and damage rolls made with this (?:magic )?weapon/i.exec(text) ||
		/(?:have|gain) a \+(\d) bonus to AC/i.exec(text);
	if(bonus) {
		fields.bonus = "+" + bonus[1];
	}
	sentences(text, fields);
	if(/\*\*\*Curse\.\*\*\*/.test(text)) {
		// players see the curse once the DM lifts the lock
		fields.cursed = "yes";
		fields["secret-fields"] = "cursed";
	}
	var thrown = /has the thrown property with a normal range of (\d+) feet and a long range of (\d+) feet/.exec(text);
	if(thrown) {
		fields.range = thrown[1] + "/" + thrown[2] + " ft";
		if(category.indexOf("thrown") === -1) {
			category.push("thrown");
			fields.category = category.join(", ");
		}
	}
	return {id: "item:" + m.index, title: m.name, type: "Item", tags: tagsOf(category), fields: fields,
		text: wikitext(desc), spellText: text};
}

var CLASSES = ["barbarian", "bard", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard", "spellcaster"];

// Charges and their recovery from the fixed sentences of the SRD
function charges(text, fields) {
	var has = /has (\d+) charges/.exec(text);
	if(has) {
		fields.charges = has[1];
		var regains = /regains (\d+d\d+(?: ?\+ ?\d+)?|\d+) expended charges daily at dawn/.exec(text);
		if(regains) {
			fields.recharge = regains[1].replace(/ ?\+ ?/, " + ");
			fields["recharge-on"] = "dawn";
		} else if(/regains all expended charges daily at dawn/.test(text)) {
			fields["recharge-on"] = "dawn";
		}
	} else if(/can't be used again until the next dawn/.test(text)) {
		fields.charges = "1";
		fields["recharge-on"] = "dawn";
	}
}

// Light, capacity and resistances from the fixed sentences of the SRD, where the text says it
// once (the Handy Haversack names the capacity of each pouch: text only)
function sentences(text, fields) {
	var once = function(re) {
		var all = text.match(new RegExp(re.source, "g")) || [];
		return all.length === 1 ? re.exec(text) : null;
	};
	var light = once(/bright light in a (\d+)-foot radius and dim light for an additional (\d+) feet/);
	if(light) {
		fields["light-bright"] = light[1] + " ft";
		fields["light-dim"] = light[2] + " ft";
	}
	var hold = once(/can hold up to ([\d,]+) pounds, not exceeding a volume of ([\d,]+) cubic feet/);
	if(hold) {
		fields.capacity = hold[1] + " lb";
		fields["capacity-volume"] = hold[2] + " ft³";
	}
	var res = [],
		re = /you have resistance to (\w+) damage/gi,
		m;
	while((m = re.exec(text))) {
		var type = m[1].toLowerCase();
		if(DAMAGE.indexOf(type) !== -1 && res.indexOf(type) === -1) {
			res.push(type);
		}
	}
	if(res.length) {
		fields.resistances = res.join(", ");
	}
}

// The spells an item casts or gives (names: the spell names in lower case), in the fixed phrases of
// the SRD: "cast X", "cast X, Y, or Z", "the effect of the X spell", "X (3 charges)" - running text
// writes spell names in lower case, so "a shield" or "bright light" is no spell; "the remove curse
// spell" alone is how to end a curse, not a spell of the item
function spellsNamed(text, names) {
	var out = [],
		add = function(name) {
			if(out.indexOf(name) === -1) {
				out.push(name);
			}
		},
		at = function(pos) {
			// the longest name at pos that ends before a letter
			return names.filter(function(n) {
				return text.substr(pos, n.length) === n && !/[a-z]/i.test(text.charAt(pos + n.length));
			}).sort(function(a, b) { return b.length - a.length; })[0];
		},
		re = /\bcast(?:s|ing)? (?:the )?/g,
		m;
	while((m = re.exec(text))) {
		var pos = m.index + m[0].length,
			name;
		while((name = at(pos))) {
			add(name);
			pos += name.length;
			var sep = /^(?:,? (?:and|or) |, )/.exec(text.slice(pos));
			if(!sep) {
				break;
			}
			pos += sep[0].length;
		}
	}
	names.forEach(function(n) {
		var esc = n.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
		if(new RegExp("\\beffects? of (?:the|an?) " + esc + " spell\\b").test(text) ||new RegExp("\\b" + esc + " \\(\\d+ charges?\\)").test(text)) {
			add(n);
		}
	});
	return out;
}

/* Spells */

var TIME = {action: "action", "bonus action": "bonus-action", reaction: "reaction", minute: "minute", minutes: "minute",
	hour: "hour", hours: "hour", round: "round", rounds: "round", day: "day", days: "day"};

function time(text) {
	var m = /^(\d+) (action|bonus action|reaction|minutes?|hours?|rounds?|days?)$/.exec(text.trim());
	return m ? m[1] + " " + TIME[m[2]] + (m[1] !== "1" && !/action|reaction/.test(m[2]) ? "s" : "") : null;
}

function spell(s) {
	var fields = {level: String(s.level), school: s.school.index};
	if(s.ritual) {
		fields.ritual = "yes";
	}
	var cast = s.casting_time.split(/,\s*/);
	fields["casting-time"] = time(cast[0]) || cast[0];
	if(cast.length > 1) {
		fields["casting-trigger"] = cast.slice(1).join(", ");
	}
	var self = /^Self \((\d+)-foot(?:-radius)? (cone|cube|cylinder|line|sphere|radius|hemisphere)\)$/.exec(s.range);
	if(self) {
		fields.range = "self";
	} else if(/^(Self|Touch|Sight|Unlimited|Special)$/.test(s.range)) {
		fields.range = s.range.toLowerCase();
	} else {
		fields.range = s.range.replace(/ feet$/, " ft").replace(/ miles?$/, " mi");
	}
	fields.components = s.components.map(function(c) { return c.toLowerCase(); }).join(", ");
	var duration = s.duration.replace(/^Up to /, "");
	if(/^(Instantaneous|Special)$/.test(duration)) {
		fields.duration = duration.toLowerCase();
	} else if(/^Until dispelled$/.test(duration)) {
		fields.duration = "until-dispelled";
	} else {
		fields.duration = time(duration) || duration;
	}
	if(s.concentration) {
		fields.concentration = "yes";
	}
	if(s.area_of_effect) {
		fields.area = s.area_of_effect.size + " ft";
		fields["area-shape"] = s.area_of_effect.type;
	}
	if(s.dc) {
		fields.save = s.dc.dc_type.index;
		if(s.dc.dc_success === "half" || s.dc.dc_success === "none") {
			fields["save-success"] = s.dc.dc_success;
		}
	}
	if(s.attack_type) {
		fields.attack = s.attack_type;
	}
	// the damage at the lowest slot or character level, of each type; with the modifier of the
	// caster ("1d8 + MOD") it stays text
	var damage = [].concat(s.damage || []).filter(function(d) { return d.damage_type; }).map(function(d) {
		var at = d.damage_at_slot_level || d.damage_at_character_level || {},
			first = Object.keys(at).sort(function(a, b) { return a - b; })[0];
		return first && !/MOD/i.test(at[first]) ? at[first] + " " + d.damage_type.index : null;
	});
	if(damage.length && damage.every(Boolean)) {
		fields.damage = damage.join(" plus ");
	}
	if(s.heal_at_slot_level) {
		var heal = Object.keys(s.heal_at_slot_level).sort(function(a, b) { return a - b; })[0];
		if(!/MOD/.test(s.heal_at_slot_level[heal])) {
			fields.healing = s.heal_at_slot_level[heal];
		}
	}
	fields.classes = (s.classes || []).map(function(c) { return c.index; }).join(", ");
	var text = wikitext(s.desc);
	if(s.material) {
		text = "//" + escape(s.material.replace(/^A |^An /, function(a) { return a; })) + "//\n\n" + text;
	}
	if(s.higher_level && s.higher_level.length) {
		text += "\n\n''//At Higher Levels.//'' " + wikitext(s.higher_level);
	}
	return {id: "spell:" + s.index, title: s.name, type: "Spell", tags: [], fields: fields, text: text};
}

/* Creatures */

var LANGUAGES = {common: "common", dwarvish: "dwarvish", elvish: "elvish", giant: "giant-language", gnomish: "gnomish",
	goblin: "goblin", halfling: "halfling", orc: "orc", abyssal: "abyssal", celestial: "celestial-language",
	draconic: "draconic", "deep speech": "deep-speech", infernal: "infernal", primordial: "primordial", sylvan: "sylvan",
	undercommon: "undercommon"};
var DAMAGE = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
var GROUP_PHRASES = [
	[/^bludgeoning, piercing, and slashing from nonmagical (?:weapons|attacks) (?:that aren't silvered|not made with silvered weapons)$/i, "nonmagical-silvered"],
	[/^bludgeoning, piercing, and slashing from nonmagical (?:weapons|attacks) that aren't adamantine$/i, "nonmagical-adamantine"],
	[/^bludgeoning, piercing, and slashing from nonmagical (?:weapons|attacks)$/i, "nonmagical"],
	[/^damage from spells$/i, "spells"]
];

function modifier(score) {
	return Math.floor((score - 10) / 2);
}

function damageList(list, rest) {
	var ids = [];
	(list || []).forEach(function(entry) {
		if(DAMAGE.indexOf(entry) !== -1) {
			ids.push(entry);
			return;
		}
		var group = GROUP_PHRASES.filter(function(g) { return g[0].test(entry); })[0];
		if(group) {
			ids.push(group[1]);
		} else {
			rest.push(entry);
		}
	});
	return ids.join(", ");
}

function creature(x) {
	var f = {},
		rest = [],
		pb = x.proficiency_bonus;
	var swarm = /^swarm of (\w+) (\w+?)s?$/i.exec(x.type);
	f.size = x.size.toLowerCase();
	if(swarm) {
		f.swarm = swarm[1].toLowerCase();
		f["creature-type"] = swarm[2].toLowerCase();
	} else {
		f["creature-type"] = x.type.toLowerCase();
	}
	if(x.subtype) {
		f.subtype = x.subtype;
	}
	var alignment = {"unaligned": "unaligned", "any alignment": "any", "any non-good alignment": "any-non-good",
		"any non-lawful alignment": "any-non-lawful", "any chaotic alignment": "any-chaotic", "any evil alignment": "any-evil",
		"lawful good": "lg", "neutral good": "ng", "chaotic good": "cg", "lawful neutral": "ln", "neutral": "n",
		"chaotic neutral": "cn", "lawful evil": "le", "neutral evil": "ne", "chaotic evil": "ce"}[x.alignment];
	if(alignment) {
		f.alignment = alignment;
	} else {
		rest.push("Alignment: " + x.alignment);
	}
	f.ac = String(x.armor_class[0].value);
	if(x.armor_class.length > 1 || x.armor_class[0].type !== "dex") {
		var notes = x.armor_class.map(function(ac) {
			return ac.value + " (" + (ac.type === "armor" && ac.armor ? ac.armor.map(function(a) { return a.name.toLowerCase(); }).join(", ") : ac.type) + ")";
		});
		rest.push("Armor Class: " + notes.join(", "));
	}
	f.hp = x.hit_points_roll.replace(/([+-])/, " $1 ");
	var speeds = [];
	Object.keys(x.speed).forEach(function(kind) {
		if(kind === "hover") {
			if(x.speed.hover) {
				speeds.push("hover");
			}
		} else {
			speeds.push(kind + " " + feet(x.speed[kind]));
		}
	});
	f.speed = speeds.join(", ");
	["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].forEach(function(name) {
		f[name.slice(0, 3)] = String(x[name]);
	});
	f.cr = cr(x.challenge_rating);
	// written only where it is not what the rules derive
	var expectedPb = Math.max(2, Math.ceil(x.challenge_rating / 4) + 1);
	if(pb !== expectedPb) {
		f.proficiency = signed(pb);
	}
	var expectedXp = {0: 10}[x.challenge_rating];
	if(x.xp !== undefined && expectedXp !== undefined && x.xp !== expectedXp) {
		f.xp = String(x.xp);
	}
	var saves = [],
		skills = [],
		expertise = [];
	(x.proficiencies || []).forEach(function(p) {
		var save = /^saving-throw-(\w+)$/.exec(p.proficiency.index),
			skill = /^skill-(.+)$/.exec(p.proficiency.index);
		if(save) {
			var mod = modifier(x[{str: "strength", dex: "dexterity", con: "constitution", int: "intelligence", wis: "wisdom", cha: "charisma"}[save[1]]]);
			saves.push(save[1] + (p.value === mod + pb ? "" : " " + signed(p.value)));
		} else if(skill) {
			var ability = SKILL_ABILITY[skill[1]],
				base = modifier(x[ability]);
			if(p.value === base + pb) {
				skills.push(skill[1]);
			} else if(p.value === base + 2 * pb) {
				skills.push(skill[1]);
				expertise.push(skill[1]);
			} else {
				skills.push(skill[1] + " " + signed(p.value));
			}
		}
	});
	if(saves.length) {
		f.saves = saves.join(", ");
	}
	if(skills.length) {
		f.skills = skills.join(", ");
	}
	if(expertise.length) {
		f.expertise = expertise.join(", ");
	}
	var vul = damageList(x.damage_vulnerabilities, rest),
		res = damageList(x.damage_resistances, rest),
		imm = damageList(x.damage_immunities, rest);
	if(vul) { f.vulnerabilities = vul; }
	if(res) { f.resistances = res; }
	if(imm) { f.immunities = imm; }
	if(x.condition_immunities && x.condition_immunities.length) {
		f["condition-immunities"] = x.condition_immunities.map(function(c) { return c.index; }).join(", ");
	}
	var senses = [];
	Object.keys(x.senses).forEach(function(kind) {
		if(kind === "passive_perception") {
			var perception = (x.proficiencies || []).filter(function(p) { return p.proficiency.index === "skill-perception"; })[0],
				expected = 10 + (perception ? perception.value : modifier(x.wisdom));
			if(x.senses[kind] !== expected) {
				senses.push("passive-perception " + x.senses[kind]);
			}
		} else {
			senses.push(kind + " " + feet(x.senses[kind]).replace(/ \(.*\)$/, ""));
		}
	});
	var languages = [],
		other = [];
	(x.languages || "").split(/,\s*/).forEach(function(lang) {
		var tele = /^telepathy (\d+) ft\.?$/.exec(lang.trim());
		if(tele) {
			senses.push("telepathy " + tele[1] + " ft");
		} else if(LANGUAGES[lang.trim().toLowerCase()]) {
			languages.push(LANGUAGES[lang.trim().toLowerCase()]);
		} else if(lang.trim() && lang.trim() !== "-" && lang.trim() !== "—") {
			other.push(lang.trim());
		}
	});
	if(senses.length) {
		f.senses = senses.join(", ");
	}
	if(languages.length) {
		f.languages = languages.join(", ");
	}
	if(other.length) {
		rest.push("Languages: " + other.join(", "));
	}
	var sections = [];
	if(rest.length) {
		sections.push(rest.map(function(r) { return "''" + escape(r.split(":")[0]) + ":''" + escape(r.slice(r.indexOf(":") + 1)); }).join("\n\n"));
	}
	[["special_abilities", null], ["actions", "Actions"], ["reactions", "Reactions"], ["legendary_actions", "Legendary Actions"]].forEach(function(part) {
		var list = x[part[0]];
		if(list && list.length) {
			sections.push((part[1] ? "!! " + part[1] + "\n\n" : "") + list.map(function(a) {
				return "''//" + escape(a.name) + ".//'' " + wikitext([a.desc]);
			}).join("\n\n"));
		}
	});
	return {id: "creature:" + x.index, title: x.name, type: "Creature", tags: [], fields: f, text: sections.join("\n\n")};
}

var SKILL_ABILITY = {athletics: "strength", acrobatics: "dexterity", "sleight-of-hand": "dexterity", stealth: "dexterity",
	arcana: "intelligence", history: "intelligence", investigation: "intelligence", nature: "intelligence", religion: "intelligence",
	"animal-handling": "wisdom", insight: "wisdom", medicine: "wisdom", perception: "wisdom", survival: "wisdom",
	deception: "charisma", intimidation: "charisma", performance: "charisma", persuasion: "charisma"};

/* From the SRD text (srd-tables.js) */

function slug(name) {
	return name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function tableItems() {
	var out = [];
	tables.tradeGoods.forEach(function(t) {
		var fields = {category: "trade-good", price: t.price};
		if(t.weight) {
			fields.weight = t.weight;
		}
		out.push({id: "item:" + slug(t.name), title: t.name, type: "Item", tags: [], fields: fields, text: wikitext([t.desc])});
	});
	tables.food.forEach(function(t) {
		out.push({id: "item:" + slug(t.name), title: t.name, type: "Item", tags: tagsOf(["food-and-drink"]),
			fields: {category: "food-and-drink", price: t.price}, text: ""});
	});
	tables.poisons.forEach(function(t) {
		out.push({id: "item:" + slug(t.name), title: t.name, type: "Item", tags: tagsOf(["poison"]),
			fields: {category: "poison, " + t.type, price: t.price, save: "con", "save-dc": String(t.dc)},
			text: wikitext([t.desc]), spellText: t.desc});
	});
	return out;
}

/* The package */

function main() {
	return Promise.all(FILES.map(load)).then(function(all) {
		var data = {};
		FILES.forEach(function(name, i) { data[name] = all[i]; });
		var items = [],
			byName = {};
		data.Equipment.forEach(function(e) {
			if(e.equipment_category.index === "mounts-and-vehicles" && e.vehicle_category === "Mounts and Other Animals") {
				return;
			}
			var entry = equipment(e);
			if(entry) {
				items.push(entry);
				byName[e.name.toLowerCase()] = entry;
			}
		});
		tableItems().forEach(function(entry) { items.push(entry); });
		var spells = data.Spells.map(spell),
			spellTitles = {};
		data["Magic-Items"].forEach(function(m) {
			var entry = magicItem(m, byName);
			if(entry) {
				items.push(entry);
			}
		});
		var creatures = data.Monsters.map(creature);
		// Mounts and the goat: price and carrying capacity from the table "Mounts and Other Animals"
		data.Equipment.filter(function(e) { return e.vehicle_category === "Mounts and Other Animals"; }).forEach(function(e) {
			// "Horse, riding" is the Riding Horse; the donkey has no stat block (the SRD: "Donkey or mule")
			var name = {Donkey: "Mule"}[e.name] || e.name.replace(/^(\w+), (\w+)$/, "$2 $1"),
				target = creatures.filter(function(c) { return c.title.toLowerCase() === name.toLowerCase(); })[0];
			if(target && target.fields.price === undefined) {
				target.fields.price = priceOf(e.cost);
				if(e.capacity) {
					target.fields["carrying-capacity"] = feetless(e.capacity);
				}
			}
		});
		tables.creaturePrices.forEach(function(p) {
			var target = creatures.filter(function(c) { return c.title === p.title; })[0];
			if(target) {
				target.fields.price = p.price;
			}
		});
		// Titles unique: item before creature before spell
		var taken = {};
		items.forEach(function(e) { taken[e.title.toLowerCase()] = true; });
		creatures.forEach(function(e) {
			if(taken[e.title.toLowerCase()]) {
				e.title += " (Creature)";
			}
			taken[e.title.toLowerCase()] = true;
		});
		spells.forEach(function(e) {
			if(taken[e.title.toLowerCase()]) {
				e.title += " (Spell)";
			}
			taken[e.title.toLowerCase()] = true;
			spellTitles[e.title.replace(/ \(Spell\)$/, "").toLowerCase()] = e.title;
		});
		// The spells an item names, by their titles in the package
		items.forEach(function(e) {
			var names = e.spellText ? spellsNamed(e.spellText, Object.keys(spellTitles)).map(function(n) { return spellTitles[n]; }) : [];
			if(names.length) {
				e.fields.spells = names.filter(function(n, i) { return names.indexOf(n) === i; }).map(function(n) {
					return /\s/.test(n) ? "[[" + n + "]]" : n;
				}).join(" ");
			}
			delete e.spellText;
		});
		fs.mkdirSync(OUT, {recursive: true});
		var write = function(name, entries) {
			fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify({entries: entries}, null, "\t") + "\n");
		};
		write("items", items);
		write("spells", spells);
		write("creatures", creatures);
		fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({
			name: "SRD 5.1 (English)",
			ruleset: "$:/plugins/tiddlyrpg-ruleset-dnd5e2014",
			language: "en-GB",
			"tiddlyrpg-core-version": ">=2.1.0",
			tag: "SRD 5.1 English",
			source: "[[SRD 5.1 (English)|https://dnd.wizards.com/resources/systems-reference-document]] (CC-BY-4.0)",
			files: ["items.json", "spells.json", "creatures.json"]
		}, null, "\t") + "\n");
		console.log("items " + items.length + ", spells " + spells.length + ", creatures " + creatures.length);
	});
}

main().catch(function(error) {
	console.error(error);
	process.exit(1);
});
