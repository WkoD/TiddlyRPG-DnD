/*
 * Plugin search path for TiddlyWiki in this repo (used by scripts/tw.js and test/helpers.js).
 *
 * Assembles TIDDLYWIKI_PLUGIN_PATH from this repo's own `plugins` folder, the plugins of
 * tiddlyrpg-core (node_modules/tiddlyrpg-plugins/plugins: tiddlyrpg-core, staticfiles) and the
 * individually pinned flibbles graph-stack packages (each ships under <pkg>/plugins), joined
 * with the OS-specific path delimiter (";" Windows, ":" elsewhere) - which is what TiddlyWiki's
 * boot splits on. Earlier folders win for a plugin found twice.
 *
 * During development node_modules/tiddlyrpg-plugins is an `npm link` to a checkout of
 * TiddlyRPG-Plugins (see CLAUDE.md).
 *
 * Also suppresses Node's DEP0169 (url.parse) deprecation warning that TiddlyWiki's core server
 * still triggers (cross-platform equivalent of NODE_OPTIONS=--no-deprecation).
 */
var path = require("path"),
	fs = require("fs");

module.exports = function() {
	process.noDeprecation = true;
	var root = path.join(__dirname, ".."),
		nodeModules = path.join(root, "node_modules"),
		pluginPaths = [path.join(root, "plugins")];
	["tiddlyrpg-plugins", "tw5-graph", "tw5-vis-network", "tw5-relink"].forEach(function(pkg) {
		pluginPaths.push(path.join(nodeModules, pkg, "plugins"));
	});
	process.env.TIDDLYWIKI_PLUGIN_PATH = pluginPaths.filter(function(p) { return fs.existsSync(p); }).join(path.delimiter);
};
