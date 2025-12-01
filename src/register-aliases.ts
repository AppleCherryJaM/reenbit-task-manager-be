import path from "path";
import moduleAlias from "module-alias";

const basePath = path.resolve(__dirname);
moduleAlias.addAliases({
	"@": basePath,
	"@controllers": path.join(basePath, "controllers"),
	"@models": path.join(basePath, "models"),
	"@services": path.join(basePath, "services"),
	"@utils": path.join(basePath, "utils"),
	"@lib": path.join(basePath, "lib"),
	"@validators": path.join(basePath, "validators"),
	"@validation": path.join(basePath, "models/validation"),
});
