/*
 * Shared setup for the tests (npm test).
 *
 * Every test file runs in its own process (node:test) and boots TiddlyWiki once with the smoke
 * edition (tiddlyrpg-core, the plugins of this repo, de-DE language pack). Files do not share
 * wiki state; within a file, a test that changes the wiki restores it afterwards.
 */
var path = require("path");

require("../scripts/plugin-path")();

var root = path.join(__dirname, ".."),
	$tw;

// Boots the wiki; resolves with $tw
exports.boot = function() {
	return new Promise(function(resolve) {
		$tw = require("tiddlywiki").TiddlyWiki();
		$tw.boot.argv = [path.join(root, "editions", "smoke")];
		$tw.boot.boot(function() {
			resolve($tw);
		});
	});
};

exports.setLanguage = function(wiki, code) {
	wiki.addTiddler(new $tw.Tiddler({title: "$:/language", text: "$:/languages/" + code}));
};

// Adds a tiddler from plain fields
exports.add = function(wiki, fields) {
	wiki.addTiddler(new $tw.Tiddler(fields));
};

// Renders wikitext with the global definitions imported, as the page template does in the browser
var IMPORT = "\\import [subfilter{$:/core/config/GlobalImportFilter}]\n";

exports.render = function(wiki, type, text, variables) {
	return wiki.renderText(type, "text/vnd.tiddlywiki", IMPORT + text, {variables: variables || {}});
};

// Result of a filter (array of titles)
exports.filter = function(wiki, text, variables) {
	return wiki.filterTiddlers(text, $tw.rootWidget.makeFakeWidgetWithVariables(variables || {}));
};
