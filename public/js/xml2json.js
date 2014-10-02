var xml2json = (function () {
    // ECMAScript 5 strict mode
    'use strict';

// http://blog.stevenlevithan.com/archives/faster-trim-javascript
// This is trim 12
//    function trim(str) {
//        var	strg = str.replace(/^\s\s*/, ''),
//            ws = /\s/,
//            i = strg.length;
//        while (ws.test(strg.charAt(--i)))
//        return strg.slice(0, i + 1);
//    }

//
// Comment by Alexander Stokes on 6 June 2012:
// NodeJs users:
// Trim 11 and trim 12 are transformed into functionally identical code in V8. No performance advantage is gained by using one over the other. I use the following variation, as it is the most clear way to represent the code.
//
 //   function trim (str) {
        // Trim left
//        var str = str.replace(/^\s\s*/, ”);
//
        // Trim right
//        for (i= str.length; i–;) {
//            if (/\S/.test(str[i])) {
//                return str.substring(0, i + 1);
//            }
//        }
//        return str
//    }
//

// trim28
// http://jsperf.com/mega-trim-test/43
     function trim(str) {
        var c;
        for (var i = 0, j = str.length; i < j; i++) {
            c = str.charCodeAt(i);
            if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12) continue; else break;
        }
        for (j--; j >= i; j--) {
            c = str.charCodeAt(j);
            if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12) continue; else break;
        }
        return str.substring(i, j + 1);
    }

    var module = {
        toJson: function (node) {
            var i, json, obj;

            if (!node.attributes.length && !node.childNodes.length) {
                return;
            }

            obj = {};

            for (i = 0; i < node.attributes.length; i++) {
                obj._attr = obj._attr || {};
                obj._attr[node.attributes[i].nodeName] = node.attributes[i].value;
            }

            for (i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].nodeType === 1) {
                    // Element node
                    json = this.toJson(node.childNodes[i]);

                    if (json) {
                        if (obj[node.childNodes[i].nodeName] instanceof Array) {
                            obj[node.childNodes[i].nodeName].push(json);
                        } else if (obj[node.childNodes[i].nodeName]) {
                            obj[node.childNodes[i].nodeName] = [obj[node.childNodes[i].nodeName]];
                            obj[node.childNodes[i].nodeName].push(json);
                        } else {
                            obj[node.childNodes[i].nodeName] = json;
                        }
                    }
                } else if (node.childNodes[i].nodeType === 3 && trim(node.childNodes[i].textContent)) {
                    // Text node
                    if (obj._text instanceof Array) {
                        obj._text.push(trim(node.childNodes[i].textContent));
                    } else if (obj._text) {
                        obj._text = [obj._text];
                        obj._text.push(trim(node.childNodes[i].textContent));
                    } else {
                        obj._text = trim(node.childNodes[i].textContent);
                    }
                }
            }

            return obj;
        },
        parseTheXml: function (xml) {
            var dom, json, obj, node, parser;

            parser = new DOMParser();
            dom = parser.parseFromString(xml, 'text/xml');
            node = dom.documentElement;
            obj = {};
            json = this.toJson(node);

            if (json) {
                obj[node.nodeName] = json;
            }

            return obj;
        }
    };

    return module;
}());
