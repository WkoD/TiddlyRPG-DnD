/*
 * The glossary of the content package (extract.js): an entry of the category Glossary for each
 * term of the ruleset the SRD 5.1 explains - the conditions (appendix PH-A, p. 358-359), the
 * skills (p. 78-81), the actions in combat (p. 92-93) and the senses (p. 86, tremorsense p. 257;
 * srd-tables.js, 5e-bits has no text for them). Its field term is the id of the term in its
 * domain; <<term frightened>> and a value of the rules link to it (modules/glossary.js of
 * tiddlyrpg-core).
 */
"use strict";

function entry(id, title, term, text) {
	return {id: "glossary:" + id, title: title, type: "Glossary", tags: ["Information"], fields: {term: term}, text: text};
}

exports.glossary = function(data, h, tables) {
	var out = [];
	data.Conditions.forEach(function(c) {
		out.push(entry("condition-" + c.index, c.name, c.index, h.wikitext(c.desc)));
	});
	data.Skills.forEach(function(s) {
		out.push(entry("skill-" + s.index, s.name, s.index, h.wikitext(s.desc)));
	});
	// The actions in combat: a heading "### Attack" each in the section of 5e-bits
	var actions = data["Rule-Sections"].filter(function(r) { return r.index === "actions-in-combat"; })[0];
	actions.desc.split(/\n(?=### )/).slice(1).forEach(function(part) {
		var lines = part.split("\n"),
			name = lines[0].replace(/^### /, "").trim(),
			id = name.toLowerCase().replace(/[^a-z]+/g, "-");
		out.push(entry("action-" + id, name, id, h.wikitext(lines.slice(1))));
	});
	tables.senses.forEach(function(s) {
		out.push(entry("sense-" + s.id, s.name, s.id, h.wikitext([s.desc])));
	});
	return out;
};
