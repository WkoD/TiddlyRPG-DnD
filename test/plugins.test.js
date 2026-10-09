/*
 * The plugins of this repo as data plugins of tiddlyrpg-core: each has its plugin type, depends
 * only on the core, contains no JS module, has the version of package.json, and needs a core
 * version the linked or pinned tiddlyrpg-core meets. The setting is the active one.
 */
var test = require("node:test"),
	assert = require("node:assert/strict"),
	fs = require("fs"),
	path = require("path"),
	h = require("./helpers");

var root = path.join(__dirname, ".."),
	pkg = require(path.join(root, "package.json")),
	TYPES = {"tiddlyrpg-ruleset-dnd5e2014": "ruleset", "tiddlyrpg-setting-forgottenrealms": "setting"};

var $tw, wiki, pluginTypes;

test.before(function() {
	return h.boot().then(function(tw) {
		$tw = tw;
		wiki = $tw.wiki;
		pluginTypes = $tw.modules.execute("$:/plugins/tiddlyrpg-core/modules/plugin-types.js");
	});
});

var folders = fs.readdirSync(path.join(root, "plugins"));

test("the version of this repo is the version of tiddlyrpg-core (kept the same for now)", function() {
	assert.equal(pkg.version, pluginTypes.coreVersion(wiki));
});

test("every plugin folder is known to this test", function() {
	assert.deepEqual(folders.slice().sort(), Object.keys(TYPES).sort());
});

folders.forEach(function(folder) {
	var title = "$:/plugins/" + folder;
	test.describe(folder, function() {
		test("type, dependency on the core only, version of package.json", function() {
			var tiddler = wiki.getTiddler(title);
			assert.ok(tiddler, "loaded");
			assert.equal(tiddler.fields["plugin-type"], TYPES[folder]);
			assert.equal(tiddler.fields.version, pkg.version);
			assert.deepEqual(tiddler.getFieldList("dependents").slice(), ["$:/plugins/tiddlyrpg-core"]);
		});

		test("no JS modules", function() {
			var info = JSON.parse(wiki.getTiddlerText(title)).tiddlers;
			var js = Object.keys(info).filter(function(t) {
				return info[t].type === "application/javascript" || info[t]["module-type"];
			});
			assert.deepEqual(js, []);
		});

		test("the core meets its tiddlyrpg-core-version", function() {
			var problems = pluginTypes.versionProblems(wiki).map(function(p) { return p.title; });
			assert.equal(problems.indexOf(title), -1);
			assert.match(wiki.getTiddler(title).fields["tiddlyrpg-core-version"] || "", /^>=\d+\.\d+\.\d+$/);
		});
	});
});

test("the Forgotten Realms are the active setting", function() {
	assert.equal(pluginTypes.active(wiki, "setting"), "$:/plugins/tiddlyrpg-setting-forgottenrealms");
});
