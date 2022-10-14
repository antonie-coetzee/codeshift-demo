import glob from "glob";
import { API, FileInfo, Options } from "jscodeshift";
import path from "path";

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options
) {
  const sourceRoot = path.resolve(options.root);

  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.ExportAllDeclaration, (p) => {
      return p.source?.value?.toString().startsWith(".") || false;
    })
    .forEach((p) => {
      const modPath = p.value.source?.value?.toString() || "";
      const modPathResolved = path.resolve(path.dirname(file.path), modPath);
      if (glob.sync(modPathResolved + "/index.*").length > 0) {
        p.value.source.value = modPath + "/index.js";
      } else {
        p.value.source.value = modPath + ".js";
      }
    });

  root
    .find(j.ImportDeclaration, (p) => {
      return p.source?.value?.toString().startsWith(".") || false;
    })
    .forEach((p) => {
      const modPath = p.value.source?.value?.toString();
      if (modPath == null) {
        return;
      }
      const modPathResolved = path.resolve(path.dirname(file.path), modPath);
      if (glob.sync(modPathResolved + "/index.*").length > 0) {
        p.value.source.value = modPath + "/index.js";
      } else {
        p.value.source.value = modPath + ".js";
      }
    });

  root
    .find(j.ImportDeclaration, (p) => {
      return p.source.value?.toString().startsWith("@/") || false;
    })
    .forEach((p) => {
      const relativePathFromSource = path.relative(
        path.dirname(file.path),
        sourceRoot
      );
      const importPath = p.value.source.value?.toString();
      const relativeToSourceModPath = importPath.replace(
        "@",
        relativePathFromSource
      );

      const absoluteModPath = importPath.replace("@", sourceRoot);
      if (glob.sync(absoluteModPath + "/index.*").length > 0) {
        p.value.source.value = relativeToSourceModPath + "/index.js";
      } else {
        p.value.source.value = relativeToSourceModPath + ".js";
      }
    });

  return root.toSource();
}
