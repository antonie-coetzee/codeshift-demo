import fs from "fs";
import { API, FileInfo } from "jscodeshift";
import path from "path";
import glob from "glob";

const sourceRoot = path.resolve("../foo-app/src/");
export default function transformer(file: FileInfo, api: API) {
    const j = api.jscodeshift;
    const root = j(file.source);

    root.find(j.ExportAllDeclaration, p => {
        return p.source?.value?.toString().startsWith(".") || false;
    }).forEach(p => {
        const modPath = p.value.source?.value?.toString() || "";
        const modPathResolved = path.resolve(path.dirname(file.path), modPath);
        if (glob.sync(modPathResolved + "/index.*").length > 0) {
            p.value.source.value = modPath + "/index.js";
        } else {
            p.value.source.value = modPath + ".js";
        }
    });

    root.find(j.ImportDeclaration, p => {
        return p.source?.value?.toString().startsWith(".") || false;
    }).forEach(p => {
        const modPath = p.value.source?.value?.toString();
        if (modPath == null) {
            return;
        }
        const modPathResolved = path.resolve(path.dirname(file.path), modPath);
        console.log(modPathResolved);
        if (glob.sync(modPathResolved + "/index.*").length > 0) {
            p.value.source.value = modPath + "/index.js";
        } else {
            p.value.source.value = modPath + ".js";
        }
    });

    root.find(j.ImportDeclaration, p => {
        return p.source.value?.toString().startsWith("@/") || false;
    }).forEach(p => {
        const relativePath = path.relative(path.resolve(path.dirname(file.path)), sourceRoot);
        const absolutePath = p.value.source.value?.toString().replace("@", sourceRoot);
        const modPath = p.value.source.value?.toString().replace("@", relativePath);
        if (glob.sync(absolutePath + "/index.*").length > 0) {
            p.value.source.value = modPath + ".js";
        } else {
            p.value.source.value = modPath + "/index.js";
        }
    });

    return root.toSource();
}
