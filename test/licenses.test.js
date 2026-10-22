/*
 * Readme and license of the plugins: the tabs come from README.md (its sections per plugin) and
 * LICENSE of this repo (files/tiddlywiki.files of each plugin); the ruleset carries the
 * attribution of the SRD 5.1 word for word and nothing else on Wizards of the Coast, the setting
 * the attribution and the notice of the Fan Content Policy.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	fs = require("fs"),
	path = require("path"),
	h = require("./helpers");

var $tw, wiki,
	root = path.join(__dirname, ".."),
	RULESET = "$:/plugins/tiddlyrpg-ruleset-dnd5e2014",
	SETTING = "$:/plugins/tiddlyrpg-setting-forgottenrealms";

// Page 1 of the SRD 5.1, English and German
var SRD_EN = "This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of " +
		"the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The " +
		"SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at " +
		"https://creativecommons.org/licenses/by/4.0/legalcode.",
	SRD_DE = "Dieses Werk enthält Material aus dem Systemreferenzdokument 5.1 („SRD 5.1”) von Wizards of the " +
		"Coast LLC, das unter https://dnd.wizards.com/de/resources/systems-reference-document verfügbar ist. " +
		"Das SRD 5.1 ist lizenziert gemäß der Lizenz Creative Commons Namensnennung 4.0 International, die " +
		"unter https://creativecommons.org/licenses/by/4.0/legalcode.de verfügbar ist.",
	FCP = "tiddlyrpg-setting-forgottenrealms is unofficial Fan Content permitted under the Fan Content Policy. " +
		"Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. " +
		"©Wizards of the Coast LLC.";

test.before(function() {
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = $tw.wiki;
	});
});

// A tiddler as plain text, whitespace collapsed
function text(title) {
	return h.render(wiki, "text/plain", "{{" + title + "}}").replace(/\s+/g, " ").trim();
}

test("the license of the repo: CC0 1.0", function() {
	assert.equal(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).license, "CC0-1.0");
	assert.match(fs.readFileSync(path.join(root, "LICENSE"), "utf8"), /^Creative Commons Legal Code\s+CC0 1\.0 Universal/);
	assert.doesNotMatch(fs.readFileSync(path.join(root, "README.md"), "utf8"), /Not affiliated/);
});

[RULESET, SETTING].forEach(function(plugin) {
	test(plugin + ": the tabs readme and license from the files of the repo", function() {
		assert.equal(wiki.getTiddler(plugin).getFieldString("list"), "readme license");
		assert.equal(wiki.getTiddler(plugin + "/readme").fields.type, "text/x-tiddlyrpg-markdown");
		assert.equal(wiki.getTiddler(plugin + "/license/notice").fields.type, "text/x-tiddlyrpg-markdown");
		assert.equal(wiki.getTiddlerText(plugin + "/license/text"), fs.readFileSync(path.join(root, "LICENSE"), "utf8"));
		var license = text(plugin + "/license");
		assert.match(license, /dedicated to the public domain under CC0 1\.0 Universal/);
		assert.ok(license.indexOf(SRD_EN) !== -1, "SRD attribution EN");
		assert.ok(license.indexOf(SRD_DE) !== -1, "SRD attribution DE");
		assert.match(license, /Section 5 of CC-BY-4\.0 includes a Disclaimer of Warranties and Limitation of Liability\./);
		assert.match(license, /Creative Commons Legal Code CC0 1\.0 Universal .* Statement of Purpose/);
	});
});

test("the ruleset: its readme, compatible with fifth edition, nothing else on Wizards", function() {
	var readme = text(RULESET + "/readme"),
		license = text(RULESET + "/license");
	assert.match(readme, /^\$:\/plugins\/tiddlyrpg-ruleset-dnd5e2014 - the rules system D&D 5e, rules of 2014, compatible with fifth edition/);
	assert.match(readme, /Each plugin works on its own/);
	assert.doesNotMatch(readme, /Calendar of Harptos as calendar data|npm/);
	assert.match(license, /contains terms \(damage types, abilities, item categories, abbreviations,\s+units and their factors, the forms of header lines\)/);
	assert.doesNotMatch(license, /Fan Content|endorsed|affiliated|coins/);
	assert.match(wiki.getTiddler(RULESET).fields.description, /compatible with fifth edition/);
});

test("the setting: its readme, the coins from the SRD, the notice of the Fan Content Policy", function() {
	var readme = text(SETTING + "/readme"),
		license = text(SETTING + "/license");
	assert.match(readme, /^\$:\/plugins\/tiddlyrpg-setting-forgottenrealms - the campaign setting Forgotten Realms/);
	assert.match(readme, /Own calendar or own coins\./);
	assert.doesNotMatch(readme, /rules of 2014|npm/);
	assert.match(license, /the names, abbreviations and rates of the coins/);
	assert.doesNotMatch(license, /damage types/);
	assert.ok(license.indexOf(FCP) !== -1, "notice of the Fan Content Policy");
	assert.match(h.render(wiki, "text/html", "{{" + SETTING + "/license}}"), /<a class="tc-tiddlylink-external" href="https:\/\/company.wizards.com\/en\/legal\/fancontentpolicy"/);
});
