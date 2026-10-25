/*
 * The character options of the content package (extract.js): the classes of the SRD 5.1 with their
 * subclasses and lasting choices as entries of the category Class, the folks with their subfolks
 * and the draconic ancestries as entries of the category Folk (tiddlyrpg-core, "Categories with a
 * tree"). An entry names what it belongs to in the field of its tree - a subclass its class
 * (classes: Sorcerer), a choice its subclass or class, a subfolk its folk (folk: Dwarf).
 *
 * Decisions (see README.md "Content package"):
 *   - the names of the subclasses are those of the SRD (p. 9-54), not the short ones of 5e-bits
 *     ("Draconic" -> "Draconic Bloodline", SUBCLASSES);
 *   - a lasting choice is "<feature>: <option>" as in 5e-bits ("Dragon Ancestor: Red",
 *     "Fighting Style: Archery", "Eldritch Invocation: Agonizing Blast"), a name of its own stays
 *     ("Pact of the Tome"); the fighting styles of fighter, paladin and ranger are one entry each
 *     with the classes that have it; an invocation that needs a pact belongs to the pact;
 *   - the damage type of a dragon ancestor comes from its name in 5e-bits ("Red - Fire Damage",
 *     the table of SRD p. 44), the breath of a draconic ancestry from its trait (table p. 5);
 *   - a choice whose text 5e-bits only repeats from its feature (a dragon ancestor, a land) or
 *     that has none (a favored enemy, a terrain, a draconic ancestry) gets a sentence of our own
 *     from its values;
 *   - Spellcaster ("requires attunement by a spellcaster") belongs to every class with the
 *     feature Spellcasting or Pact Magic;
 *   - a class shows its proficiencies, multiclassing (p. 56-57), its table and its features as
 *     sections <<feature>>, the Spellcasting with its parts;
 *   - the table of a class has the columns of the SRD (CLASS_COLUMNS, p. 8-54), not every number
 *     of 5e-bits (no "Brutal Critical Dice", "Metamagic Known", "Mystic Arcanum Level 6" ...), its
 *     cells written as there ("Unlimited", "+2", "+10 ft."); the spell slots per spell level are a
 *     table of their own below it, so that it fits the width of a tiddler - the warlock keeps
 *     "Spell Slots" and "Slot Level" in its table, as in the SRD; what a character chooses when it is
 *     made - equipment, skills, ability scores, languages - is left out;
 *   - a draconic ancestry is a subfolk of the dragonborn named in full, "Black Dragonborn" (the
 *     table "Draconic Ancestry", p. 5) - the card of a player character shows the subfolk alone;
 *   - Darkvision of a folk is its field senses; every other trait is an entry of the category Trait
 *     that names the folks and subfolks it belongs to (folk: Dwarf, folk: [[High Elf]]);
 *   - a folk names its languages without choice in the relation languages of the core, a language
 *     is "<name> (Language)" - several are creatures or folks too (Goblin, Halfling);
 *   - the feat Grappler with the mistakes of the data of 5e-bits mended (FEAT_TEXT).
 */
"use strict";

var SUBCLASSES = {berserker: "Path of the Berserker", lore: "College of Lore", life: "Life Domain", land: "Circle of the Land",
	champion: "Champion", "open-hand": "Way of the Open Hand", devotion: "Oath of Devotion", hunter: "Hunter", thief: "Thief",
	draconic: "Draconic Bloodline", fiend: "The Fiend", evocation: "School of Evocation"};

var ABILITIES = {str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma"};

// The features whose children are lasting choices, with the class or subclass they belong to
// (null: the class of the feature); the fighting styles are merged by name
var CHOICES = {"dragon-ancestor": "draconic", "circle-of-the-land": "land", "fighter-fighting-style": null,
	"paladin-fighting-style": null, "ranger-fighting-style": null, "hunters-prey": "hunter", "defensive-tactics": "hunter",
	"multiattack": "hunter", "superior-hunters-defense": "hunter", "metamagic-1": null, "eldritch-invocations": null,
	"pact-boon": null};

// A title list: a title with a space in brackets
function titles(list) {
	return list.map(function(t) { return /\s/.test(t) ? "[[" + t + "]]" : t; }).join(" ");
}

// The columns of the table of a class after Level, Proficiency Bonus and Features, in the order
// of the SRD: [key in class_specific or spellcasting of 5e-bits, label, cell]; pact-slots and
// pact-slot-level from the spell slots of the warlock
var CLASS_COLUMNS = {
	barbarian: [["rage_count", "Rages", function(v) { return v === 9999 ? "Unlimited" : String(v); }],
		["rage_damage_bonus", "Rage Damage", function(v) { return "+" + v; }]],
	bard: [["cantrips_known", "Cantrips Known"], ["spells_known", "Spells Known"]],
	cleric: [["cantrips_known", "Cantrips Known"]],
	druid: [["cantrips_known", "Cantrips Known"]],
	fighter: [],
	monk: [["martial_arts", "Martial Arts"], ["ki_points", "Ki Points"],
		["unarmored_movement", "Unarmored Movement", function(v) { return "+" + v + " ft."; }]],
	paladin: [],
	ranger: [["spells_known", "Spells Known"]],
	rogue: [["sneak_attack", "Sneak Attack"]],
	sorcerer: [["sorcery_points", "Sorcery Points"], ["cantrips_known", "Cantrips Known"], ["spells_known", "Spells Known"]],
	warlock: [["cantrips_known", "Cantrips Known"], ["spells_known", "Spells Known"], ["pact-slots", "Spell Slots"],
		["pact-slot-level", "Slot Level"], ["invocations_known", "Invocations Known"]],
	wizard: [["cantrips_known", "Cantrips Known"]]
};

function ordinal(n) {
	return n + ({1: "st", 2: "nd", 3: "rd"}[n] || "th");
}

function capital(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

/*
The entries of the category Class: [{id, title, type, tags, fields, text}]. <h> the text helpers
of extract.js (wikitext, section, escape); <spellTitle(name)> the title of a spell in the package.
*/
exports.classes = function(data, h, spellTitle) {
	var features = {},
		out = [],
		classTitle = {};
	data.Features.forEach(function(f) { features[f.index] = f; });
	data.Classes.forEach(function(c) { classTitle[c.index] = c.name; });
	var subclassOf = {};
	data.Subclasses.forEach(function(s) { subclassOf[s.index] = s; });

	// The name of a feature in its section: without the class ("Spellcasting: Sorcerer") and the
	// count ("Indomitable (2 uses)") - the table shows those
	var featureName = function(name, className) {
		return name.replace(new RegExp(": " + className + "$"), "").replace(/ \([^)]*\)$/, "");
	};
	// The features of a list of levels as sections, each name once, without the choices
	var featureSections = function(levels, className, extra) {
		var seen = {},
			out = [];
		levels.forEach(function(level) {
			level.features.forEach(function(ref) {
				var f = features[ref.index];
				if(!f || f.parent || /^metamagic-.+-spell$/.test(f.index)) {
					return;
				}
				var name = featureName(f.name, className);
				if(seen[name]) {
					return;
				}
				seen[name] = true;
				var body = h.wikitext(f.desc);
				if(extra && extra[f.index]) {
					body += "\n\n" + extra[f.index];
				}
				out.push(h.section("feature", h.escape(name), body));
			});
		});
		return out;
	};

	data.Classes.forEach(function(c) {
		var fields = {"hit-die": "1d" + c.hit_die},
			parts = [];
		fields["saving-throws"] = c.saving_throws.map(function(a) { return a.index; }).join(", ");
		if(c.spellcasting) {
			fields["spellcasting-ability"] = c.spellcasting.spellcasting_ability.index;
		}
		var profs = c.proficiencies.filter(function(p) { return !/^saving-throw-/.test(p.index); }).map(function(p) { return p.name; });
		parts.push("''Proficiencies:'' " + h.escape(profs.join("; ")));
		var mc = c.multi_classing || {},
			prereq = (mc.prerequisites || []).map(function(p) { return ABILITIES[p.ability_score.index] + " " + p.minimum_score; }).join(" and ");
		if(mc.prerequisite_options) {
			prereq = mc.prerequisite_options.from.options.map(function(p) { return ABILITIES[p.ability_score.index] + " " + p.minimum_score; }).join(" or ");
		}
		var mcProfs = (mc.proficiencies || []).map(function(p) { return p.name; });
		parts.push("''Multiclassing:'' " + h.escape(prereq) + (mcProfs.length ? "; proficiencies gained: " + h.escape(mcProfs.join("; ")) : ""));
		// The table of the class: level, proficiency bonus, features, the columns of the SRD; the
		// spell slots per spell level a table of their own (not the warlock)
		var levels = data.Levels.filter(function(l) { return l.class.index === c.index && !l.subclass; }).sort(function(a, b) { return a.level - b.level; });
		var columns = CLASS_COLUMNS[c.index];
		if(!columns) {
			throw new Error("No columns of the SRD for the class " + c.index);
		}
		var slotsOf = function(l) {
			return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(n) { return (l.spellcasting || {})["spell_slots_level_" + n] || 0; });
		};
		var value = function(l, k) {
			var slots = slotsOf(l),
				level = slots.findIndex(function(n) { return n > 0; });
			if(k === "pact-slots") {
				return level === -1 ? 0 : slots[level];
			}
			if(k === "pact-slot-level") {
				return level === -1 ? 0 : ordinal(level + 1);
			}
			var own = l.class_specific || {};
			return k in own ? own[k] : (l.spellcasting || {})[k];
		};
		var cell = function(v, format) {
			if(v === 0 || v === undefined || v === null) {
				return "-";
			}
			return v && typeof v === "object" ? v.dice_count + "d" + v.dice_value : format ? format(v) : String(v);
		};
		var rows = ["|!Level |!Proficiency Bonus |!Features |" + columns.map(function(col) { return "!" + col[1] + " |"; }).join("")];
		levels.forEach(function(l) {
			var names = l.features.map(function(f) { return (features[f.index] || f).name.replace(new RegExp(": " + c.name + "$"), ""); });
			rows.push("|" + ordinal(l.level) + " |+" + l.prof_bonus + " |" + (names.length ? h.escape(names.join(", ")) : "-") + " |" +
				columns.map(function(col) { return cell(value(l, col[0]), col[2]) + " |"; }).join(""));
		});
		parts.push(rows.join("\n"));
		var highest = 0;
		levels.forEach(function(l) {
			slotsOf(l).forEach(function(n, i) {
				if(n) {
					highest = Math.max(highest, i + 1);
				}
			});
		});
		if(highest && c.index !== "warlock") {
			var range = [1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, highest),
				slotRows = ["|!Level |" + range.map(function(n) { return "!" + ordinal(n) + " |"; }).join("")];
			levels.forEach(function(l) {
				var slots = slotsOf(l);
				slotRows.push("|" + ordinal(l.level) + " |" + range.map(function(n) { return cell(slots[n - 1]) + " |"; }).join(""));
			});
			parts.push("''Spell Slots per Spell Level''");
			parts.push(slotRows.join("\n"));
		}
		// The parts of Spellcasting (5e-bits keeps them beside the feature)
		var extra = {};
		if(c.spellcasting) {
			var feature = levels.map(function(l) { return l.features; }).reduce(function(a, b) { return a.concat(b); }, []).filter(function(f) {
				return /^spellcasting-|^pact-magic/.test(f.index);
			})[0];
			if(feature) {
				extra[feature.index] = c.spellcasting.info.map(function(i) {
					return "''//" + h.escape(i.name) + ".//'' " + h.wikitext(i.desc);
				}).join("\n\n");
			}
		}
		var text = parts.join("\n\n") + "\n\n" + featureSections(levels, c.name, extra).join("\n\n");
		out.push({id: "class:" + c.index, title: c.name, type: "Class", tags: ["Information"], fields: fields, text: text});
	});

	data.Subclasses.forEach(function(s) {
		var title = SUBCLASSES[s.index],
			fields = {classes: classTitle[s.class.index]},
			levels = data.Levels.filter(function(l) { return l.subclass && l.subclass.index === s.index; }).sort(function(a, b) { return a.level - b.level; });
		if(!title) {
			throw new Error("No SRD name for the subclass " + s.index);
		}
		if(s.spells && s.index !== "land") {
			fields.spells = titles(s.spells.map(function(x) { return spellTitle(x.spell.name); }).filter(Boolean));
		}
		var text = [h.wikitext(s.desc)].concat(featureSections(levels, s.class.name)).join("\n\n");
		out.push({id: "class:" + s.index, title: title, type: "Class", tags: ["Information"], fields: fields, text: text});
	});

	// The lasting choices
	var styles = {};
	data.Features.forEach(function(f) {
		var parent = f.parent ? f.parent.index : (/^metamagic-.+-spell$/.test(f.index) ? "metamagic-1" : null);
		if(!parent || !(parent in CHOICES)) {
			return;
		}
		var owner = CHOICES[parent] ? SUBCLASSES[CHOICES[parent]] : classTitle[f.class.index],
			entry = {id: "class:" + f.index, title: f.name, type: "Class", tags: ["Information"], fields: {classes: titles([owner])}, text: h.wikitext(f.desc)};
		if(parent === "dragon-ancestor") {
			var m = /^Dragon Ancestor: (\w+) - (\w+) Damage$/.exec(f.name);
			entry.title = "Dragon Ancestor: " + m[1];
			entry.fields["damage-type"] = m[2].toLowerCase();
			// 5e-bits repeats the text of the feature: the choice is its dragon and damage type
			entry.text = "The dragon ancestor of a sorcerer of the Draconic Bloodline is a " + m[1].toLowerCase() +
				" dragon; the damage type of the features of the bloodline is " + m[2].toLowerCase() + ".";
		} else if(parent === "circle-of-the-land") {
			entry.fields.spells = titles((subclassOf.land.spells || []).filter(function(x) {
				return x.prerequisites.some(function(p) { return p.index === f.index; });
			}).map(function(x) { return spellTitle(x.spell.name); }).filter(Boolean));
			entry.text = "The land of a druid of the Circle of the Land: " + f.name.replace(/^Circle of the Land: /, "").toLowerCase() +
				". It gives the circle spells of that land.";
		} else if(/fighting-style$/.test(parent)) {
			var style = styles[f.name];
			if(style) {
				style.owners.push(owner);
				style.fields.classes = titles(style.owners);
				return;
			}
			entry.id = "class:fighting-style-" + f.name.replace(/^Fighting Style: /, "").toLowerCase().replace(/\W+/g, "-");
			entry.owners = [owner];
			styles[f.name] = entry;
		} else if(parent === "eldritch-invocations") {
			var pact = (f.prerequisites || []).filter(function(p) { return p.type === "feature"; }).map(function(p) {
				return features[p.feature.split("/").pop()].name;
			})[0];
			if(pact) {
				entry.fields.classes = titles([pact]);
			}
			var need = (f.prerequisites || []).map(function(p) {
				return p.type === "level" ? ordinal(p.level) + " level" : p.type === "spell" ? p.spell.split("/").pop().replace(/-/g, " ") + " cantrip" :
					features[p.feature.split("/").pop()].name;
			});
			if(need.length) {
				entry.text = "//Prerequisite: " + h.escape(need.join(", ")) + "//\n\n" + entry.text;
			}
		}
		out.push(entry);
	});
	out.forEach(function(e) { delete e.owners; });

	// Favored enemies and terrains of the ranger: options of 5e-bits without entries of their own
	var options = function(index, kind) {
		var spec = features[index].feature_specific;
		return spec[kind].from.options;
	};
	options("favored-enemy-1-type", "enemy_type_options").forEach(function(o) {
		out.push({id: "class:favored-enemy-" + o, title: "Favored Enemy: " + capital(o), type: "Class", tags: ["Information"], fields: {classes: "Ranger"},
			text: "A favored enemy of the ranger: " + o + "."});
	});
	options("natural-explorer-1-terrain-type", "terrain_type_options").forEach(function(o) {
		out.push({id: "class:natural-explorer-" + o, title: "Natural Explorer: " + capital(o), type: "Class", tags: ["Information"], fields: {classes: "Ranger"},
			text: "A favored terrain of the ranger: " + o + "."});
	});

	// Spellcaster: every class with Spellcasting or Pact Magic (attunement by a spellcaster, p. 206)
	var casters = data.Classes.filter(function(c) { return !!c.spellcasting; }).map(function(c) { return c.name; });
	out.push({id: "class:spellcaster", title: "Spellcaster", type: "Class", tags: ["Information"], fields: {classes: titles(casters)},
		text: "A creature that casts spells through a feature of its class: Spellcasting, or Pact Magic of the warlock. A magic item that requires attunement by a spellcaster names it."});
	return out;
};

// The title of a language in the package ("Common (Language)")
var languageTitle = exports.languageTitle = function(name) {
	return name + " (Language)";
};

/*
The entries of the category Folk: the folks, their subfolks and the draconic ancestries of the
dragonborn.
*/
exports.folks = function(data, h) {
	var out = [];
	var bonuses = function(list) {
		return (list || []).map(function(b) { return b.ability_score.index + " +" + b.bonus; }).join(", ");
	};
	data.Races.forEach(function(r) {
		var fields = {size: r.size.toLowerCase(), speed: "walk " + r.speed + " ft"};
		if((r.traits || []).some(function(t) { return t.index === "darkvision"; })) {
			fields.senses = "darkvision 60 ft";
		}
		fields.languages = titles(r.languages.map(function(l) { return languageTitle(l.name); }));
		if(r.ability_bonuses && r.ability_bonuses.length) {
			fields["ability-bonuses"] = bonuses(r.ability_bonuses);
		}
		var text = [r.age, r.alignment, r.size_description, r.language_desc].filter(Boolean).map(function(p) { return h.wikitext([p]); }).join("\n\n");
		out.push({id: "folk:" + r.index, title: r.name, type: "Folk", tags: ["Information"], fields: fields, text: text});
	});
	data.Subraces.forEach(function(s) {
		var fields = {folk: s.race.name};
		if(s.ability_bonuses && s.ability_bonuses.length) {
			fields["ability-bonuses"] = bonuses(s.ability_bonuses);
		}
		var text = h.wikitext([s.desc]);
		out.push({id: "folk:" + s.index, title: s.name, type: "Folk", tags: ["Information"], fields: fields, text: text});
	});
	data.Traits.filter(function(t) { return t.parent && t.parent.index === "draconic-ancestry"; }).forEach(function(t) {
		var spec = t.trait_specific,
			breath = spec.breath_weapon || {},
			area = breath.area_of_effect || {},
			fields = {folk: "Dragonborn", "damage-type": spec.damage_type.index};
		if(area.size) {
			fields.area = area.size + " ft";
			fields["area-shape"] = area.type;
		}
		if(breath.dc && breath.dc.dc_type) {
			fields.save = breath.dc.dc_type.index;
		}
		var colour = t.name.replace(/^Draconic Ancestry \((\w+)\)$/, "$1").toLowerCase(),
			damage = spec.damage_type.index,
			text = "A dragonborn descended from a " + colour + " dragon: the breath weapon deals " + damage + " damage";
		if(area.size) {
			text += " in a " + area.size + "-foot " + area.type;
		}
		text += ", and the dragonborn has resistance to " + damage + " damage.";
		out.push({id: "folk:" + t.index, title: t.name.replace(/^Draconic Ancestry \((\w+)\)$/, "$1 Dragonborn"), type: "Folk",
			tags: ["Information"], fields: fields, text: text});
	});
	return out;
};

/*
The entries of the category Trait: every trait of a folk or subfolk but Darkvision (the field
senses of the folk) and the choices of a draconic ancestry (entries of Folk), each naming the
folks it belongs to.
*/
exports.traits = function(data, h) {
	var owners = {};
	var add = function(index, title) {
		(owners[index] = owners[index] || []).push(title);
	};
	data.Races.forEach(function(r) { (r.traits || []).forEach(function(t) { add(t.index, r.name); }); });
	data.Subraces.forEach(function(s) { (s.racial_traits || []).forEach(function(t) { add(t.index, s.name); }); });
	return data.Traits.filter(function(t) {
		return t.index !== "darkvision" && !t.parent && owners[t.index];
	}).map(function(t) {
		return {id: "trait:" + t.index, title: t.name, type: "Trait", tags: ["Information"], fields: {folk: titles(owners[t.index])},
			text: h.wikitext(t.desc)};
	});
};

// The entries of the category Language: the standard and exotic languages (SRD p. 59)
exports.languages = function(data, h) {
	return data.Languages.map(function(l) {
		var fields = {"language-type": l.type.toLowerCase()};
		if(l.script) {
			fields.script = l.script;
		}
		var speakers = (l.typical_speakers || []).join(", ");
		return {id: "language:" + l.index, title: languageTitle(l.name), type: "Language", tags: ["Information"], fields: fields,
			text: speakers ? "Typical speakers: " + h.escape(speakers) + "." : ""};
	});
};

// The text of Grappler as the SRD has it (p. 75): 5e-bits writes "close--quarters" and capitals
var FEAT_TEXT = {grappler: function(text) {
	return text.replace("close--quarters", "close-quarters").replace("the Skills", "the skills").replace(" Grappling", " grappling")
		.replace("Attack Rolls", "attack rolls").replace("Grappled by", "grappled by").replace("are both Restrained", "are both restrained");
}};

// The entries of the category Feat: the feat of the SRD (p. 75)
exports.feats = function(data, h) {
	return data.Feats.map(function(f) {
		var fields = {};
		if(f.prerequisites && f.prerequisites.length) {
			fields.prerequisites = f.prerequisites.map(function(p) { return p.ability_score.index + " " + p.minimum_score; }).join(", ");
		}
		var desc = f.desc.map(function(line) { return FEAT_TEXT[f.index] ? FEAT_TEXT[f.index](line) : line; });
		return {id: "feat:" + f.index, title: f.name, type: "Feat", tags: ["Information"], fields: fields, text: h.wikitext(desc)};
	});
};
