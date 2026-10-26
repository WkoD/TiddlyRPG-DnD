/*
 * Formulas with the terms of tiddlyrpg-ruleset-dnd5e2014 (modules/formula.js of the core): the cases
 * of the campaigns (Vandalia) in English and German - a DC with the challenge rating, the DC of a
 * mask as two formulas with the modifiers, a value of a class table by name with its entry, the
 * healing of a potion with the average of a Hit Die; the variants mod and score of every ability.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	h = require("./helpers");

var $tw, wiki, rules;

test.before(function() {
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = $tw.wiki;
		rules = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/rules.js");
		h.add(wiki, {title: "Barbarian", tags: "Information Class", text: "''Proficiencies:'' Light Armor\n\n|!Level |!Rages |!Rage Damage |\n|1st |2 |+2 |\n\n<<feature \"Rage\">> In battle, you fight with primal ferocity."});
	});
});

function term(id, value) {
	return rules.term(wiki, id, "", value).text;
}

function dice(text) {
	return rules.diceText(wiki, text).text;
}

test("en-GB: the cases of the campaigns", function() {
	h.setLanguage(wiki, "en-GB");
	assert.equal(term("dc", "10 + cr"), "DC 10 + CR");
	assert.equal(term("dc", "8 + cha:mod + pb"), "DC 8 + CHA modifier + PB");
	assert.equal(term("dc", "8 + int:mod + pb"), "DC 8 + INT modifier + PB");
	assert.equal(term("dc", "10 + 'Rage Damage|Barbarian'"), "DC 10 + Rage Damage");
	assert.equal(dice("1d8 * cr"), "1d8 × CR");
	assert.equal(dice("pb + 'Rage Damage|Barbarian'"), "PB + Rage Damage");
	assert.equal(dice("1d4 + 'Rage Damage|Barbarian'"), "1d4 + Rage Damage");
	assert.equal(dice("1/4 hit-dice + hit-dice:average + con:mod"), "1/4 Hit Dice + average of a Hit Die + CON modifier");
	assert.equal(dice("(1/4 hit-dice + hit-dice:average + con:mod) / 2"), "(1/4 Hit Dice + average of a Hit Die + CON modifier) / 2");
	assert.equal(dice("str:score * 15"), "STR score × 15");
	assert.equal(rules.diceText(wiki, "10 + Rage Damage").problem, "Rules/Check/Formula", "a word of the campaign is no term");
});

test("de-DE: the same in German", function() {
	h.setLanguage(wiki, "de-DE");
	assert.equal(term("dc", "10 + cr"), "SG 10 + HG");
	assert.equal(term("dc", "8 + cha:mod + pb"), "SG 8 + CHA-Modifikator + ÜB");
	assert.equal(dice("1d8 * cr"), "1W8 × HG");
	assert.equal(dice("1/4 hit-dice + hit-dice:average + con:mod"), "1/4 Trefferwürfel + Durchschnitt eines Trefferwürfels + KON-Modifikator");
	assert.equal(dice("str:score * 15"), "STR-Wert × 15");
	assert.equal(term("dc", "10 + 'Rage Damage|Barbarian'"), "SG 10 + Rage Damage", "a name stays as the entry writes it");
});

test("every ability has the variants mod and score in both languages", function() {
	["en-GB", "de-DE"].forEach(function(code) {
		h.setLanguage(wiki, code);
		["str", "dex", "con", "int", "wis", "cha"].forEach(function(id) {
			["mod", "score"].forEach(function(variant) {
				var r = rules.term(wiki, id, variant);
				assert.equal(r.problem, null, code + " " + id + ":" + variant);
			});
		});
	});
});

test("rendered: one dotted unit, Rage Damage links to the class at its column", function() {
	h.setLanguage(wiki, "en-GB");
	var out = h.render(wiki, "text/html", "<<term dc value:\"10 + 'Rage Damage|Barbarian'\">>");
	assert.match(out, /<span class="trpg-rule">DC 10 \+ <a [^>]*href="#Barbarian"[^>]*>Rage Damage<\/a><\/span>/, out);
	var body = h.render(wiki, "text/html", "<$trpg-body $tiddler=\"Barbarian\" $mode=\"block\"/>", {currentTiddler: "Barbarian"});
	assert.match(body, /data-trpg-anchor="column-rage-damage"/);
	assert.match(body, /data-trpg-anchor="feature-rage"/);
});
