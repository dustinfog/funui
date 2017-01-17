let Promise = require('bluebird');
let fs = require('fs');
let htmlminifier = require("html-minifier");
let jsdom = require("jsdom").jsdom;

fs.existsAsync = function(path) {
    return new Promise(function(onFulfil) {
        fs.exists(path, function(exists) {
            onFulfil(exists);
        });
    });
};

exports.compileUI = Promise.coroutine(function *(srcDir, distDir, localeDir, callback) {
    let transRepo = {};

    let filenames = yield fs.readdirAsync(srcDir);

    for(let filename of filenames) {
        let matches;
        if (!(matches = filename.match(/([^/\.]+)\.html/))) {
            return;
        }

        let name = matches[1];
        let distBase = distDir + "/" + name;
        let layoutFileName = distBase + ".layout.js";
        filename = srcDir + "/" + filename;

        if ((yield fs.existsAsync(layoutFileName)) && (yield fs.statAsync(layoutFileName)).mtime.getTime() > (yield fs.statAsync(filename)).mtime.getTime()) {
            return;
        }

        let rawHtml = yield fs.readFileAsync(filename, "utf-8");
        let document = jsdom(rawHtml).defaultView.document;
        let layoutContent = "FunUI.layouts[\"" + name + "\"] = " + JSON.stringify(htmlminifier.minify(document.getElementById(name).outerHTML, {
                removeComments: true,
                collapseWhitespace: true
            })) + ";\n";
        let styleFilename = distBase+ ".css";
        let traitFileName = distBase + ".trait.js";

        yield Promise.all([
            fs.writeFileAsync(layoutFileName, layoutContent),
            fs.writeFileAsync(styleFilename, document.getElementById("exportStyle").innerHTML),
            fs.writeFileAsync(traitFileName, "(function(){" + document.getElementById("exportScript").innerHTML + "})();")
        ]);

        let langElements = document.getElementsByClassName("F-Lang");
        for(let i = 0, length = langElements.length; i < length; i ++) {
            let langElement = langElements.item(i);
            let lang = langElement.id;

            let trans = transRepo[lang];
            if (!trans) {
                let langFile = localeDir + '/' + lang + '.json';

                if (!grunt.file.exists(langFile)) {
                    continue;
                }

                trans = JSON.parse(grunt.file.read(langFile));
                transRepo[lang] = trans;
            }

            let viewTrans = JSON.parse(langElement.innerHTML);
            for (let key in viewTrans) {
                if (!trans[key] && viewTrans.hasOwnProperty(key)) {
                    trans[key] = viewTrans[key];
                }
            }
        }
    }

    yield Promise.all(Object.keys(transRepo)
            .map(
                lang => fs.writeFileAsync(localeDir + '/' + lang + '.json', JSON.stringify(transRepo[lang], null, '    '))
    ));
    callback();
});