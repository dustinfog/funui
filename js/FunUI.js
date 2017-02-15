/**
 * todo: AddedToDocument
 */
Object.defineProperty(String.prototype, "literal", {
    get: function () {
        try {
            return JSON.parse(this);
        } catch (e) {
            return this;
        }
    }
});

/**
 @param {string} type
 @param {EventListener|Function} listener
 @param {boolean} [useCapture = false]
 */
EventTarget.prototype.on = EventTarget.prototype.addEventListener;

/**
 @param {string} type
 @param {EventListener|Function} listener
 @param {boolean} [useCapture = false]
 */
EventTarget.prototype.off = EventTarget.prototype.removeEventListener;
/**
 @param {Event} event
 @return {boolean}
 */
EventTarget.prototype.fire = EventTarget.prototype.dispatchEvent;

/**
 * hack for querySelector and querySelectorAll to support :scope
 *
 * @link http://stackoverflow.com/questions/6481612/queryselector-search-immediate-children
 */
(function (doc, proto) {
    try {
        doc.querySelector(':scope body');
    } catch (err) {
        ['querySelector', 'querySelectorAll'].forEach(function (method) {
            var native = proto[method];
            proto[method] = function (selectors) {
                if (/(^|,)\s*:scope/.test(selectors)) {
                    var id = this.id;
                    this.id = id || ('ID' + Date.now());
                    selectors = selectors.replace(/((^|,)\s*):scope/g, '$1#' + this.id);
                    var result = doc[method](selectors);
                    this.id = id;
                    return result;
                } else {
                    return native.call(this, selectors);
                }
            }
        });
    }
})(window.document, HTMLElement.prototype);

/**
 * hack for dataset
 * @link https://gist.github.com/brettz9/4093766
 */
if (!document.documentElement.dataset &&
    (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset') || !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
) {
    var propDescriptor = {
        enumerable: true,
        get: function () {
            'use strict';
            var i,
                that = this,
                HTML5_DOMStringMap,
                attrVal, attrName, propName,
                attribute,
                attributes = this.attributes,
                attsLength = attributes.length,
                toUpperCase = function (n0) {
                    return n0.charAt(1).toUpperCase();
                },
                getter = function () {
                    return this;
                },
                setter = function (attrName, value) {
                    return (typeof value !== 'undefined') ?
                        this.setAttribute(attrName, value) :
                        this.removeAttribute(attrName);
                };
            try { // Simulate DOMStringMap w/accessor support
                // Test setting accessor on normal object
                ({}).__defineGetter__('test', function () {
                });
                HTML5_DOMStringMap = {};
            }
            catch (e1) { // Use a DOM object for IE8
                HTML5_DOMStringMap = document.createElement('div');
            }
            for (i = 0; i < attsLength; i++) {
                attribute = attributes[i];
                // Fix: This test really should allow any XML Name without
                //         colons (and non-uppercase for XHTML)
                if (attribute && attribute.name &&
                    (/^data-\w[\w\-]*$/).test(attribute.name)) {
                    attrVal = attribute.value;
                    attrName = attribute.name;
                    // Change to CamelCase
                    propName = attrName.substr(5).replace(/-./g, toUpperCase);
                    try {
                        Object.defineProperty(HTML5_DOMStringMap, propName, {
                            enumerable: this.enumerable,
                            get: getter.bind(attrVal || ''),
                            set: setter.bind(that, attrName)
                        });
                    }
                    catch (e2) { // if accessors are not working
                        HTML5_DOMStringMap[propName] = attrVal;
                    }
                }
            }
            return HTML5_DOMStringMap;
        }
    };
    try {
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    } catch (e) {
        propDescriptor.enumerable = false;
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    }
}
/**
 * @return {Array.<String>}
 */
HTMLElement.prototype.getClasses = function () {
    if (this.classList) {
        var ret = [];
        for (var i = 0, length = this.classList.length; i < length; i++) {
            ret.push(this.classList.item(i));
        }
        return ret;
    } else {
        return this.className.split(/\s+/).filter(function (e) {
            return e != '';
        });
    }
};
/**
 *
 * @param {String} className
 * @return {boolean}
 */
HTMLElement.prototype.hasClass = function (className) {
    if (this.classList) {
        return this.classList.contains(className);
    } else {
        return this.getClasses().indexOf(className) >= 0;
    }
};

/**
 *
 * @param {String} className
 */
HTMLElement.prototype.addClass = function (className) {
    if (!this.hasClass(className)) {
        if (this.classList) {
            this.classList.add(className);
        } else {
            this.className += ' ' + className;
        }
    }
};

/**
 *
 * @param {String} className
 */
HTMLElement.prototype.removeClass = function (className) {
    if (this.classList) {
        this.classList.remove(className);
    } else {
        this.className = this.getClasses().filter(function (e) {
            return e != className;
        }).join(' ');
    }
};
/**
 *
 * @param {String} className
 * @return {HTMLElement|null}
 */
HTMLElement.prototype.getSubComponent = function (className) {
    return this.querySelector(":scope>." + className);
};
/**
 *
 * @param {String} className
 * @return {Array.<HTMLElement>}
 */
HTMLElement.prototype.getSubComponents = function (className) {
    var ret = [];
    var list = this.querySelectorAll(":scope>." + className);
    for (var i = 0, length = list.length; i < length; i++) {
        ret.push(list.item(i));
    }
    return ret;
};

/**
 *
 * @param {String} className
 * @param {String} tagName
 * @param {Array.<boolean>} created
 * @return {HTMLElement}
 */
HTMLElement.prototype.presentSubComponent = function () {
    var className = arguments[0];
    var tagName = null;
    var created = null;
    var Reference = FunUI.utils.Reference;

    for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] == "string") {
            tagName = arguments[i];
        } else if (arguments[i] instanceof Reference) {
            created = arguments[i];
            created.set(false);
        }
    }

    var subComponent = this.getSubComponent(className);
    if (!subComponent) {
        subComponent = this.appendChild(
            function () {
                var element = document.createElement(tagName || 'div');
                element.className = className;
                return element;
            }()
        );

        if (created) {
            created.set(true);
        }
    }

    return subComponent;
};

/**
 *
 * @param {boolean} force
 * @return {HTMLElement|null}
 */
HTMLElement.prototype.presentLabelChild = function (force) {
    var label = this.getSubComponent('label');
    if (!label) {
        var childNodes = this.childNodes;
        var contentNode = null;
        for (var i = 0, length = childNodes.length; i < length; i++) {
            var childNode = childNodes[i];
            if (childNode.nodeType == Node.TEXT_NODE && childNode.nodeValue.trim() != '') {
                contentNode = childNode;
                break;
            }
        }


        if (contentNode != null || force) {
            label = document.createElement('span');
            label.className = 'label';
            if (contentNode != null) {
                label.innerHTML = contentNode.nodeValue;
                this.replaceChild(label, contentNode);
            } else {
                this.appendChild(label);
            }

        }
    }

    return label;
};

/**
 *
 * @param {Function} callback
 */
HTMLElement.prototype.delayCall = function (callback) {
    if (typeof callback != 'function') {
        throw new Error('callback must be a function');
    }

    if (!this.funUIInitialized) {
        if (!this._delayedCalls) {
            this._delayedCalls = [];
        }


        if (arguments.length >= 2) {
            callback = Function.prototype.bind.apply(callback, Array.prototype.slice.call(arguments, 1));
        }

        this._delayedCalls.push(callback);
    } else {
        var thisObj = arguments.length >= 2 ? arguments[1] : null;
        var args = Array.prototype.slice.call(arguments, 2);

        callback.apply(thisObj, args);
    }
};

HTMLElement.prototype.initFunUI = (function () {
    return function () {
        if (typeof this.funUIInitialized != "undefined") {
            return false;
        }

        this.funUIInitialized = false;

        // parse parameter
        var immediately = false;
        var extraTraits = [];
        for (var i = 0, length = arguments.length; i < length; i++) {
            var arg = arguments[i];
            if (typeof arg == "boolean") {
                immediately = arg;
            } else {
                extraTraits.push(arg);
            }
        }

        // init children
        for (i = 0, length = this.children.length; i < length; i++) {
            this.children[i].initFunUI(immediately);
        }

        // collect traits
        var componentTrait = null, customizedTrait = null;

        var prefix = "F-";
        var classes = this.getClasses();
        for (i = 0, length = classes.length; i < length; i++) {
            var componentClass = classes[i];
            if (componentClass.indexOf(prefix) != 0) {
                continue;
            }

            var componentName = componentClass.substr(prefix.length);
            if (!!FunUI.components[componentName]) {
                componentTrait = FunUI.components[componentName];
                break;
            }
        }

        if (!!this.id && FunUI.traits[this.id]) {
            customizedTrait = FunUI.traits[this.id];
            delete FunUI.traits[this.id];
        }

        var dataSet = {};
        for (var propName in this.dataset) {
            if (this.dataset.hasOwnProperty(propName)) {
                var value = this.dataset[propName];
                value = FunUI.lang.apply(value);
                dataSet[propName] = value.literal;
            }
        }
        // mix in
        var initializers = mixInStart(this, componentTrait, extraTraits, customizedTrait, dataSet);

        if (immediately) {
            mixInFinish(this, initializers);
        } else {
            setTimeout(mixInFinish, 0, this, initializers);
        }

        return true;
    };

    /**
     * @param {HTMLElement} element
     * @param {...} traits
     * @return Array.<function>
     */
    function mixInStart() {
        var args = Array.from(arguments);
        var element = args.shift();
        var traits = flattenTraits(args);

        var init = "__init__";
        var initializers = [];

        for (var i = 0, length = traits.length; i < length; i++) {
            var trait = traits[i];

            for (var prop in trait) {
                if (!trait.hasOwnProperty(prop)) {
                    continue;
                }

                if (prop == init) {
                    initializers.push(trait[prop]);
                    continue;
                }

                var propertyDescriptor = Object.getOwnPropertyDescriptor(trait, prop);
                if (propertyDescriptor.get || propertyDescriptor.set) {
                    var originPropertyDescriptor = Object.getOwnPropertyDescriptor(element, prop);
                    if (!originPropertyDescriptor) {
                        Object.defineProperty(element, prop, propertyDescriptor);
                    } else {
                        originPropertyDescriptor.set = propertyDescriptor.set;
                        originPropertyDescriptor.get = propertyDescriptor.get;
                    }
                } else {
                    var value = trait[prop];

                    if (typeof value == "function") {
                        value = value.bind(element);
                    }

                    element[prop] = value;
                }
            }
        }

        return initializers;
    }

    function mixInFinish(element, initializers) {
        for (var i = 0, length = initializers.length; i < length; i++) {
            initializers[i].call(element);
        }

        while (element._delayedCalls && element._delayedCalls.length) {
            element._delayedCalls.shift().call(null);
        }

        element.funUIInitialized = true;
        element.fire(new CustomEvent(FunUI.events.INITIALIZED));
    }

    function flattenTraits(traits) {
        var ret = [];
        for (var i = 0, length = traits.length; i < length; i++) {
            var trait = traits[i];

            if (trait == null) {
                continue;
            }

            if (trait.constructor == Object) {
                ret.push(trait);
            } else if (trait.constructor == Array) {
                Array.prototype.push.apply(ret, flattenTraits.call(null, trait));
            } else {
                throw new Error("Traits must be simple object");
            }
        }

        return ret;
    }
})();
/**
 *
 * @type {Array.<function>}
 */
HTMLElement.prototype._delayedCalls = null;

HTMLElement.prototype.getStylePixel = function (styleName) {
    var value = getComputedStyle(this, null).getPropertyValue(styleName);
    var posPx = value.lastIndexOf("px");
    if (posPx < 0 || posPx != value.length - 2) {
        return 0;
    }

    return parseInt(value);
};

HTMLElement.prototype.invalidate = function () {
    if (!this._invalid) {
        if (!this.hasOwnProperty("validate")) {
            this.validate = this.validate.bind(this);
        }
        this._invalid = setTimeout(this.validate, 0);
    }
};

/**
 * @abstract
 */
HTMLElement.prototype.validate = function () {
    if (typeof this.commitProperties == 'function') {
        this.commitProperties();
    }

    clearTimeout(this._invalid);
    this._invalid = null;
};

Object.defineProperty(HTMLElement.prototype, "explicitWith", {
    set: function (width) {
        this.style.width = (width - this.getStylePixel("padding-left") - this.getStylePixel("padding-right") - this.getStylePixel("border-left-width") - this.getStylePixel("border-right-width")) + "px";
    }
});

Object.defineProperty(HTMLElement.prototype, "explicitHeight", {
    set: function (height) {
        this.style.height = (height - this.getStylePixel("padding-top") - this.getStylePixel("padding-bottom") - this.getStylePixel("border-top-width") - this.getStylePixel("border-bottom-width")) + "px";
    }
});

Object.defineProperty(HTMLElement.prototype, "tooltipData", (function () {
    function showTooltip(event) {
        var target = event.currentTarget;
        var renderer = F$(target.tooltipRenderer);
            renderer.show(target, target.tooltipData);

        target.on('mouseout', hideTooltip);
    }

    function hideTooltip(event) {
        var target = event.currentTarget;
        var renderer = F$(target.tooltipRenderer);
        renderer.hide();

        target.off('mouseout', hideTooltip);
    }

    return {
        set: function (data) {
            if (data == null) {
                if (this._tooltipData != null) {
                    this.off('mouseover', showTooltip);
                }
            } else if (this._tooltipData == null) {
                this.on('mouseover', showTooltip);
            }

            this._tooltipData = data;
        },
        get: function () {
            return this._tooltipData;
        }
    };
})());

Object.defineProperty(HTMLElement.prototype, "tooltipRenderer", {
    set: function (renderer) {
        this._tooltipRenderer = renderer;
    },
    get: function () {
        return this._tooltipRenderer || "tooltipSimple";
    }
});


Object.defineProperty(HTMLElement.prototype, "disabled", {
    set: function (value) {
        if (this.disabled == value) {
            return;
        }

        if (value) {
            this.addClass('disabled');
        } else {
            this.removeClass('disabled');
        }

        this._disabled = value;
    },
    get: function () {
        if (typeof this._disabled == 'undefined') {
            this._disabled = this.hasClass('disabled');
        }
        return this._disabled;
    }
});


var FunUI = {};

FunUI.CSS_PREFIX = 'F-';

FunUI.utils = {};
FunUI.utils.alert = function (content, onYes) {
    F$('alert').show(F_('alert.title'), content, onYes);
};

FunUI.utils.confirm = function (content, onYes, onNo) {
    F$('confirm').show(F_('confirm.title'), content, onYes, onNo);
};

FunUI.utils.attachSound = function(targetNode) {
    targetNode.addClass("withClickSound");
};

FunUI.utils.Reference = (function () {
    function Reference() {
    }

    Reference.prototype.set = function (v) {
        this._value = v;
    };

    Reference.prototype.get = function () {
        return this._value;
    };

    return Reference;
}());

FunUI.utils.extend = function () {
    var target = {};

    for (var i = 0, length = arguments.length; i < length; i++) {
        var source = arguments[i];
        if (typeof source != 'object') {
            continue;
        }

        for (var key in source) {
            if (!source.hasOwnProperty(key)) {
                continue;
            }

            var propertyDescriptor = Object.getOwnPropertyDescriptor(source, key);
            if (propertyDescriptor.get || propertyDescriptor.set) {
                var originPropertyDescriptor = Object.getOwnPropertyDescriptor(target, key);
                if (!originPropertyDescriptor) {
                    Object.defineProperty(target, key, propertyDescriptor);
                } else {
                    originPropertyDescriptor.set = propertyDescriptor.set;
                    originPropertyDescriptor.get = propertyDescriptor.get;
                }
            } else {
                target[key] = source[key];
            }
        }
    }

    return target;
};

FunUI.utils.relay = document.createElement("div");

(function () {
    FunUI.lang = {
        KEY_PATTERN: /_\(([^)]+)\)/g,
        _embeddedLanguages: null,
        _language: null,
        isEnabled: function () {
            return typeof F_ == "function";
        },
        apply: function (str) {
            if (FunUI.lang.isEnabled()) {
                return str.replace(FunUI.lang.KEY_PATTERN, replaceText);
            }

            return str;
        },
        getEmbeddedText: function (key) {
            if (this._embeddedLanguages == null) {
                this._embeddedLanguages = {};
                var langElements = document.getElementsByClassName('F-Lang');

                for (var i = 0, length = langElements.length; i < length; i++) {
                    var langElement = langElements.item(i);
                    var lang = langElement.getAttribute("id");
                    this._embeddedLanguages[lang] = JSON.parse(langElement.innerText);
                    if (this._language == null || (document.documentElement.lang || navigator.language).indexOf(lang) == 0) {
                        this._language = lang;
                    }
                }
            }

            return this._embeddedLanguages[this._language][key] || "";
        }
    };

    function replaceText() {
        try {
            return F_(arguments[1]);
        } catch (e) {
            return arguments[0];
        }
    }
})();
/**
 *
 * @param {String|HTMLElement} viewId
 */
FunUI.utils.getView = function (viewId) {
    var view = null;
    if (viewId instanceof HTMLElement) {
        view = viewId;
        viewId = view.id;
    }

    if (typeof viewId != "string") {
        throw new Error('invalid arguments');
    }

    if (!!FunUI.views[viewId]) {
        return FunUI.views[viewId];
    }

    view = view || document.getElementById(viewId);

    if (!view) {
        var layout = FunUI.layouts[viewId];
        if (!layout) {
            throw new Error("invalid view id " + viewId);
        }
        layout = FunUI.lang.apply(layout);
        FunUI.utils.relay.innerHTML = layout;
        view = FunUI.utils.relay.firstElementChild;
        if (!view) {
            throw new Error("invalid view, please check if view's Id and filename are identical");
        }

        FunUI.utils.relay.removeChild(view);
        delete FunUI.layouts[viewId];

        view.initFunUI();
    } else if (view.initFunUI() && FunUI.lang.isEnabled()) {
        var node, walk = document.createTreeWalker(view, NodeFilter.SHOW_TEXT, null, false);
        while (node = walk.nextNode()) {
            node.nodeValue = FunUI.lang.apply(node.nodeValue);
        }
    }

    if (viewId) {
        FunUI.views[viewId] = view;
    }

    return view;
};

FunUI.utils.EventTarget = function () {
    var eventDelegate = document.createDocumentFragment();
    this.dispatchEvent = eventDelegate.dispatchEvent.bind(eventDelegate);
    this.addEventListener = eventDelegate.addEventListener.bind(eventDelegate);
    this.removeEventListener = eventDelegate.removeEventListener.bind(eventDelegate);
    this.fire = this.dispatchEvent;
    this.on = this.addEventListener;
    this.off = this.removeEventListener;
};

/**
 * @param {Array} source
 * @param {int} pageSize
 * @param {boolean} pending
 * @param {FunUI.utils.ArrayView} sourceView
 * @param {object} options {source=[Array],pageSize=[int],pending=[boolean], sourceView=[FunUI.utils.ArrayView], filter=[Function],sort=[Function]}
 * @constructor
 */
FunUI.utils.ArrayView = function () {
    FunUI.utils.EventTarget.call(this);

    this._validate = (function () {
        if (!this._invalid) {
            return;
        }

        clearTimeout(this._invalid);
        this._invalid = null;

        this._tidy();
        this.fire(new CustomEvent(FunUI.events.ARRAY_VIEW_UPDATE));
    }).bind(this);

    this._follow = (function () {
        this.invalidate();
    }).bind(this);

    for (var i = 0, length = arguments.length; i < length; i++) {
        var arg = arguments[i];
        if (typeof arg == 'number') {
            this.pageSize = arg;
        } else if (typeof arg == 'boolean') {
            this.pending = arg;
        } else if (Array.isArray(arg)) {
            this.source = arg;
        } else if (arg instanceof FunUI.utils.ArrayView) {
            this.sourceView = arg;
        } else if (arg.constructor == Object) {
            for (var key in arg) {
                if (arg.hasOwnProperty(key) && ['pageSize', 'source', 'pending', 'filter', 'sourceView', 'sort'].indexOf(key) >= 0) {
                    this[key] = arg[key];
                } else {
                    throw new Error("invalid option key " + key);
                }
            }
        } else {
            throw new Error("invalid arguments");
        }
    }

    if (this.source == null && this.sourceView == null) {
        this.source = [];
    }
};

FunUI.utils.ArrayView.prototype.item = function (index) {
    return this.currentView[index];
};

Object.defineProperty(FunUI.utils.ArrayView.prototype, "source", {
    set: function (src) {
        if (Array.isArray(src)) {
            this._source = src;
        } else {
            this._source = [];
        }

        this.invalidate();
    },
    get: function () {
        return this._source;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "sourceView", {
    set: function (srcView) {
        if (this._sourceView == srcView) {
            return;
        }

        if (!srcView instanceof FunUI.utils.ArrayView) {
            srcView = null;
        }

        if (this._sourceView) {
            this._sourceView.off(FunUI.events.ARRAY_VIEW_UPDATE, this._follow);
        }

        if (srcView) {
            srcView.on(FunUI.events.ARRAY_VIEW_UPDATE, this._follow);
            this._source = srcView.currentView;
        } else {
            this._source = [];
        }

        this._sourceView = srcView;
        this.invalidate();
    },
    get: function () {
        return this._sourceView;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "currentView", {
    get: function () {
        this._tidy();
        return this._currentView;
    }
});

/**
 * @type {Function}
 * @see Array.prototype.filter
 */
Object.defineProperty(FunUI.utils.ArrayView.prototype, "filter", {
    set: function (filter) {
        if (filter && typeof filter != 'function') {
            throw new Error('filter must be a function');
        }

        this._filter = filter;
        this.invalidate();
    },
    get: function () {
        return this._filter;
    }
});

/**
 * @type {Function}
 * @see Array.prototype.sort
 */
Object.defineProperty(FunUI.utils.ArrayView.prototype, "sort", {
    set: function (sort) {
        if (sort && typeof sort != 'function') {
            throw new Error('sort must be a function');
        }

        this._sort = sort;
        this.invalidate();
    },
    get: function () {
        return this._sort;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "length", {
    get: function () {
        return this.source.length;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, 'filteredLength', {
    get: function () {
        this._tidy();
        return this._filteredLength;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "pageSize", {
    set: function (size) {
        size = parseInt(size) || 0;
        if (this.pageSize != size) {
            this._pageSize = size;
            this.invalidate();
        }
    },
    get: function () {
        return this._pageSize || 0;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "pageCount", {
    get: function () {
        this._tidy();
        return this._pageCount;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "page", {
    set: function (index) {
        index = parseInt(index) || 0;
        if (index < 0) {
            throw new Error("index cannot be less than 0");
        }
        if (this.page != index) {
            this._page = index;
            this.invalidate();
        }
    },
    get: function () {
        return this._page || 0;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "pending", {
    set: function (pending) {
        if (this.sourceView) {
            console.warn("Invalid operation");
            return;
        }
        pending = !!pending;
        if (this._pending != pending) {
            this._pending = pending;
            this.invalidate();
        }
    },
    get: function () {
        return this.sourceView ? this.sourceView.pending : (this._pending || false);
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, 'pended', {
    set: function (v) {
        if (this.sourceView) {
            this.sourceView.pended = v;
            return;
        }

        if (this._pended == v) {
            return;
        }
        this._pended = v;
        if (v) {
            this.fire(new CustomEvent(FunUI.events.ARRAY_VIEW_PENDED));
        }
    },
    get: function () {
        return this.sourceView ? this.sourceView.pended : this._pended;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "isFirstPage", {
    get: function () {
        return this.page == 0;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "isDirty", {
    get: function () {
        return this._dirty == 0;
    }
});

Object.defineProperty(FunUI.utils.ArrayView.prototype, "isLastPage", {
    get: function () {
        return !this.pending && this.page >= this.pageCount - 1;
    }
});

FunUI.utils.ArrayView.prototype.invalidate = function () {
    this._dirty = true;
    if (!this._invalid) {
        this._invalid = setTimeout(this._validate, 0);
    }
};

/**
 * @param {Array} fragment
 */
FunUI.utils.ArrayView.prototype.append = function (fragment) {
    if (this.sourceView) {
        throw new Error('sourceView must be null');
    }

    if (!this.pending) {
        throw new Error('not a pending ArrayView');
    }

    Array.prototype.push.apply(this.source, fragment);
    this.pended = false;
    this.invalidate();
};

/**
 * @param {*} item
 */
FunUI.utils.ArrayView.prototype.push = function (item) {
    if (this.sourceView) {
        throw new Error('sourceView must be null');
    }

    if (!this.pending) {
        throw new Error('not a pending ArrayView');
    }

    this.source.push(item);
    this.pended = false;
    this.invalidate();
};

FunUI.utils.ArrayView.prototype._tidy = function () {
    if (!this._dirty) {
        return;
    }

    this._dirty = false;

    if (this.sourceView) {
        this._source = this.sourceView.currentView;
    }

    var view = this.source.concat();
    if (this.filter) {
        view = view.filter(this.filter);
    }

    if (this.sort) {
        view = view.sort(this.sort);
    }

    this._filteredLength = view.length;

    if (this.pageSize <= 0) {
        this._pageSize = 0;
        this._currentView = view;
        this._pageCount = this._filteredLength == 0 ? 0 : 1;
        this._page = 0;
        return;
    }

    this._pageCount = Math.ceil(this._filteredLength / this.pageSize);

    this._page = this._page || 0;
    if (this.pending) {
        var pended = false;

        if (this._filteredLength % this.pageSize != 0) {
            if (this._page >= this.pageCount - 1) {
                this._page = this._pageCount - 1;
                pended = true;
            }
        } else if (this._page >= this._pageCount) {
            this._page = this._pageCount;
            pended = true;
        }

        if (!this._pended && pended) {
            this.pended = true;
        }
    } else {
        this._page = Math.min(this._pageCount - 1, this._page);
    }

    this._page = Math.max(this._page, 0);

    var start = this._page * this._pageSize;
    this._currentView = view.slice(start, start + this.pageSize);
};

FunUI.events = {
    INITIALIZED: 'initialized',
    SELECTED_CHANGED: 'selectedChanged',
    ADD_POP_UP: 'addPopUp',
    REMOVE_POP_UP: 'removePopUp',
    ARRAY_VIEW_UPDATE: 'arrayViewUpdate',
    ARRAY_VIEW_PENDED: 'arrayViewPended',
    ALL_SELECTED_CHANGED: 'allSelectedChanged',
    TEXT_CHANGED: 'textChanged',
    INPUT_SUBMIT: 'inputSubmit'
};


FunUI.managers = {};
FunUI.managers.PopUpManager = {
    LAYER_BASIC: "basic",
    LAYER_TOP: "top",
    LAYER_PERIPHERY: "periphery"
};

FunUI.utils.EventTarget.call(FunUI.managers.PopUpManager);
/**
 *
 * @param {string|HTMLElement} view
 * @param {boolean} modal
 * @param {string} layer
 */
FunUI.managers.PopUpManager.addPopUp = function (view, modal, layer) {
    if (!this._layers) {
        this._layers = {};
        this._layers[this.LAYER_BASIC] = this._createPopUpLayer(this.LAYER_BASIC);
        this._layers[this.LAYER_TOP] = this._createPopUpLayer(this.LAYER_TOP);
        this._layers[this.LAYER_PERIPHERY] = this._createPopUpLayer(this.LAYER_PERIPHERY);
    }
    if (!this._modalLayer) {
        this._modalLayer = document.createElement("div");
        this._modalLayer.addClass("modal");
    }

    layer = layer || this.LAYER_BASIC;

    var popUpLayer = this._layers[layer];
    if (!popUpLayer) {
        throw new Error('invalid layer');
    }

    view = F$(view);
    view.setAttribute("data-modal", modal ? 'true' : 'false');
    view.modal = modal || false;

    if (modal) {
        popUpLayer.appendChild(this._modalLayer);
    }

    if (!popUpLayer.parentNode) {
        document.body.appendChild(popUpLayer);
    }

    popUpLayer.appendChild(view);

    var popUpEvent = new CustomEvent(FunUI.events.ADD_POP_UP, {
        view: view
    });

    view.delayCall(function () {
        view.fire(popUpEvent);
        FunUI.managers.PopUpManager.fire(popUpEvent)
    });
};
/**
 *
 * @param {string|HTMLElement} view
 */
FunUI.managers.PopUpManager.removePopUp = function (view) {
    if (!this._layers) {
        return;
    }

    view = F$(view);

    var popUpLayer = view.parentNode;
    if (!popUpLayer) {
        return;
    }

    var validLayer = false;
    for (var layer in this._layers) {
        if (this._layers.hasOwnProperty(layer) && popUpLayer == this._layers[layer]) {
            validLayer = true;
            break;
        }
    }

    if (!validLayer) {
        throw new Error('invalid layer');
    }

    var event = new CustomEvent(FunUI.events.REMOVE_POP_UP, {
        view: view
    });

    if (!this.fire(event) || !view.fire(event)) {
        return;
    }

    popUpLayer.removeChild(view);
    if (popUpLayer.children.length == 0) {
        popUpLayer.parentNode.removeChild(popUpLayer);
    }

    if (!view.modal || this._modalLayer.parentNode == null) {
        return;
    }

    var keepModal = false;
    for (var i = popUpLayer.children.length - 1; i >= 0; i--) {
        var child = popUpLayer.children[i];
        if (child == this._modalLayer) {
            continue;
        }

        if (child.modal) {
            if (child.previousSibling != this._modalLayer) {
                popUpLayer.insertBefore(this._modalLayer, child);
            }

            keepModal = true;
            break;
        }
    }

    if (!keepModal) {
        popUpLayer.removeChild(this._modalLayer);
    }
};

FunUI.managers.PopUpManager._createPopUpLayer = function (layer) {
    var layerElement = document.createElement("div");
    layerElement.addClass(FunUI.CSS_PREFIX + "popUpLayer");
    layerElement.addClass(layer);

    return layerElement;
};

FunUI.components = {};
/**
 * @mixin
 */
FunUI.components.Button = {
    __init__: function () {
        FunUI.utils.attachSound(this);
        this.presentLabelChild();
        this.presentSubComponent("hover");
    }
};

/**
 * @mixin
 */
FunUI.components.Selectable = {
    _selected: false,
    select: function () {
        this.selected  = true;
    },
    deselect: function () {
        this.selected = false;
    },
    set selected(selected) {
        if (this._selected == selected) {
            return;
        }

        if (selected) {
            this.addClass("selected");
        } else {
            this.removeClass("selected");
        }

        this._selected = selected;
        this.fire(new CustomEvent(FunUI.events.SELECTED_CHANGED));
    },
    get selected (){
        return this._selected;
    }
};

/**
 * @mixin
 */
FunUI.components.TextInput = {
    multiline: false,
    password: false,
    placeholder: "",
    _lastText: "",
    _maxLength : -1,
    __init__: function () {
        var node, walk = document.createTreeWalker(this, NodeFilter.SHOW_TEXT, null, false);
        var defaultValue = "";
        if (node = walk.nextNode()) {
            defaultValue = node.nodeValue.trim();
            this.removeChild(node);
        }

        var input = null;
        if (!this.multiline) {
            input = document.createElement("input");
            input.setAttribute("type", this.password ? "password" : "text");
        } else {
            input = document.createElement("textarea");
        }

        input.setAttribute("placeholder", this.placeholder);
        input.on("input", this.fire.bind(this, new CustomEvent(FunUI.events.TEXT_CHANGED)));

        if (this._maxLength >= 0) {
            input.setAttribute("maxlength", this._maxLength);
        }

        input.on('keydown', this.onKeyDown);

        this.appendChild(input);
        this.input = input;
        this.text = defaultValue;
    },
    onKeyDown : function(event) {
        if (event.key == "Enter") {
            this.fire(new CustomEvent(FunUI.events.INPUT_SUBMIT));
        }
    },
    set maxLength(value) {
        value = parseInt(value);
        if (this.input) {
            this.input.setAttribute("maxlength", value);
        } else {
            this._maxLength = value;
        }
    },
    get maxLength() {
        if (this.input) {
            return parseInt(this.input.getAttribute('maxlength'));
        } else {
            return this._maxLength;
        }
    },
    set text(value) {
        if (this.input.tagName.toLowerCase() == "input") {
            if (this.input.value != value) {
                this.input.value = value;
                this.fire(new CustomEvent(FunUI.events.TEXT_CHANGED));
            }
        } else if (this.input.innerHTML != value) {
            this.input.innerHTML = value;
            this.fire(new CustomEvent(FunUI.events.TEXT_CHANGED));
        }
    },
    get text() {
        return this.input.value;
    }
};

/**
 * @mixin
 */
FunUI.components.Window = {
    drawingBg: true,
    modal: false,
    __init__: function () {
        if (this.drawingBg) {
            this.presentSubComponent("bg");
        }

        var titleElement = this.getSubComponent('title');
        if (!!titleElement) {
            titleElement.presentLabelChild();
        }

        var closeButton = this.getSubComponent("close");
        if (closeButton) {
            closeButton.on("click", this.close);
        }
    },
    open: function () {
        FunUI.managers.PopUpManager.addPopUp(this, this.modal);
    },
    close: function () {
        FunUI.managers.PopUpManager.removePopUp(this);
    }
};

/**
 * @mixin
 */
FunUI.components.ViewStack = {
    __init__: function () {
        this._subViews = this.getSubComponents("subView");
        for (var i = 0, length = this._subViews.length; i < length; i++) {
            var subView = this._subViews[i];
            if (subView.hasClass("selected")) {
                this.selectSubView(i);
            }
        }

        if (this._selectedIndex == -1) {
            this.selectSubView(0);
        }
    },
    _subViews: null,
    _selectedIndex: -1,
    get selectedIndex() {
        return this._selectedIndex;
    },
    get currentSubView() {
        if (this._selectedIndex >= 0 && this._selectedIndex < this._subViews.length) {
            return this._subViews[this._selectedIndex];
        }

        return null;
    },
    /**
     *
     * @param {int} index
     */
    selectSubView: function (index) {
        var beforeIndex = this._selectedIndex;
        if (beforeIndex == index) {
            return;
        }
        var currentView = this.currentSubView;
        if (currentView) {
            currentView.removeClass("selected");
        }

        this._subViews[index].addClass("selected");
        this._selectedIndex = index;
        this.fire(new CustomEvent(FunUI.events.SELECTED_CHANGED, {
            beforeIndex: beforeIndex,
            currentIndex: index
        }));
    }
};

/**
 * @mixin
 */
FunUI.components.TabPage = {
    __init__: function () {
        this.initPages();
        this.invalidate();
    },
    initPages : function() {
        this._pages = this.getSubComponents("F-TabSubPage");
        for(var i = 0; i < this._pages.length; i ++) {
            var page = this._pages[i];

            page.on(FunUI.events.SELECTED_CHANGED, this._onPageSelectedChanged)
        }

        this._excludedPages = {};
    },
    excludePage : function(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this._pages.length && !this._excludedPages[pageIndex]) {
            this._excludedPages[pageIndex] = true;
            this.invalidate();
        }
    },
    includePage : function(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this._pages.length && !!this._excludedPages[pageIndex]) {
            delete this._excludedPages[pageIndex];
            this.invalidate();
        }
    },
    commitProperties : function() {
        for(var index in this._excludedPages) {
            this.removeChild(this._pages[index]);
        }

        var pages = this._pages;
        var pageTitles = [];
        var pageContents = [];
        var pageContent;

        var maxHeight = 0, maxWidth = 0, maxContentWidth = 0, maxContentHeight = 0, pageBarWidth = 0;
        for (var i = 0, length = pages.length; i < length; i++) {
            if (!!this._excludedPages[i]) {
                continue;
            }

            var page = pages[i];
            page.pageIndex = i;

            var pageTitle = page.title;
            if (pageTitle) {
                pageTitles.push(pageTitle);
                pageBarWidth = pageBarWidth + pageTitle.offsetWidth;
            }

            pageContent = page.content;

            maxContentHeight = Math.max(pageContent.offsetHeight, maxContentHeight);
            maxContentWidth = Math.max(pageContent.offsetWidth, maxContentWidth);
            maxHeight = Math.max(maxHeight, page.offsetTop + pageContent.offsetTop + maxContentHeight);
            maxWidth = Math.max(maxWidth, page.offsetLeft + pageContent.offsetLeft + maxContentWidth);
            pageContents.push(pageContent);
        }

        this.explicitWith = maxWidth;
        this.explicitHeight = maxHeight;

        for (i = 0, length = pageContents.length; i < length; i++) {
            pageContent = pageContents[i];
            pageContent.explicitWith = maxContentWidth;
            pageContent.explicitHeight = maxContentHeight;
        }

        var pageBarOffsetLeft;
        if (this.barAlign == "left") {
            pageBarOffsetLeft = 0
        } else if (this.barAlign == "right") {
            pageBarOffsetLeft = maxWidth - pageBarWidth;
        } else {
            pageBarOffsetLeft = (maxWidth - pageBarWidth) / 2;
        }

        pageBarOffsetLeft += this.barOffsetLeft;

        for (i = 0, length = pageTitles.length; i < length; i++) {
            pageTitles[i].style.left = pageBarOffsetLeft + "px";
            pageBarOffsetLeft += pageTitles[i].offsetWidth;
        }

        if (this.selectedIndex < 0 || this._excludedPages[this.selectedIndex]) {
            this.selectedIndex = 0;
        }
    },

    /**
     * @type {string} center|left|right
     */
    barAlign: "center",
    /**
     * @type {int}
     */
    barOffsetLeft: 0,
    /**
     * @readonly
     * @type {int}
     */
    pageNum: 0,
    /**
     * @readonly
     * @type {int}
     */
    _selectedIndex: -1,
    set selectedIndex(index) {
        if (this._excludedPages[index]) {
            return;
        }

        var pages = this._pages;
        if (index < 0 || pages.length <= index) {
            index = -1;
        }

        if (this._selectedIndex == index) {
            return;
        }

        if (this._selectedIndex != -1) {
            pages[this._selectedIndex].selected = false;
        }

        if (index >= 0) {
            pages[index].selected = true;
            pages[index].style.zIndex = ++this._zIndexSeq;
        }

        this._selectedIndex = index;
        this.fire(new CustomEvent(FunUI.events.SELECTED_CHANGED));
    },
    get selectedIndex() {
        return this._selectedIndex;
    },
    _onPageSelectedChanged : function(event) {
        var page = event.currentTarget;
        if (!page.selected) {
            return;
        }

        this.selectedIndex = this._pages.indexOf(page);
    },
    _excludedPages : null,
    _pages: null,
    _zIndexSeq: 0
};

FunUI.components.TabSubPage = FunUI.utils.extend(
    FunUI.components.Selectable,
    {
        _title : null,
        _content : null,
        __init__ : function() {
            this._title = this.getSubComponent('title');
            this._content = this.getSubComponent('content');

            FunUI.utils.attachSound(this);
            this._title.presentLabelChild();
            this._title.presentSubComponent("hover");
            this._title.on("click", this.select);

            if (this.hasClass("selected")) {
                this.selected = true;
            }
        },
        get title() {
            return this._title;
        },
        get content() {
            return this._content;
        }
    }
);
/**
 * @mixin
 */
FunUI.components.Tooltip = {
    gap: 10,
    _host: null,
    _data: null,
    show: function (host, data) {
        this._host = host;
        this._data = data;
        this.style.visibility = 'hidden';
        FunUI.managers.PopUpManager.addPopUp(
            this, false, FunUI.managers.PopUpManager.LAYER_PERIPHERY
        );

        this.delayCall(this._show);
    },
    hide: function () {
        FunUI.managers.PopUpManager.removePopUp(this);
    },
    /**
     * @abstract
     * @param {HTMLElement} host
     */
    position: function (host) {
        var hostClientRect = host.getBoundingClientRect();
        var myClientRect = this.getBoundingClientRect();

        var left = Math.max(0, Math.min(hostClientRect.left, this.parentNode.offsetWidth - myClientRect.width));
        var top, candidateTop;
        if (hostClientRect.bottom + myClientRect.height + this.gap <= this.parentNode.offsetHeight || (candidateTop = hostClientRect.top - myClientRect.height - this.gap) < 0) {
            top = hostClientRect.bottom + this.gap;
        } else {
            top = candidateTop;
        }

        this.style.left = left + "px";
        this.style.top = top + "px";
    },
    /**
     * @abstract
     * @param {*} data
     */
    render: function (data) {
        this.innerHTML = data;
    },
    _show: function () {
        this.render(this._data);
        this.position(this._host);

        this.style.visibility = 'visible';
    }
};

/**
 * @mixin
 */
FunUI.components.List = {
    __init__: function () {
        this._itemProto = this.getSubComponent(FunUI.CSS_PREFIX + "ItemRenderer");
        this.removeChild(this._itemProto);
        this._items = [];
        this._selectedIndices = [];
    },
    multiSelect: false,
    itemRenderer: null,
    /**
     *
     * @param {FunUI.utils.ArrayView} dataProvider
     */
    set dataProvider(dataProvider) {
        if (!(dataProvider instanceof FunUI.utils.ArrayView)) {
            throw new Error('F$ArrayView required');
        }

        if (this._arrayView != dataProvider) {
            if (this._arrayView) {
                this._arrayView.off(FunUI.events.ARRAY_VIEW_UPDATE, this.render);
            }

            if (dataProvider) {
                dataProvider.on(FunUI.events.ARRAY_VIEW_UPDATE, this.render);
            }
            this._arrayView = dataProvider;

            if (!this._selectedIndices || this._selectedIndices.length != 0) {
                this._selectedIndices = [];
                this._selectedChanged = true;
                this.invalidate();
            }

            if (!dataProvider.isDirty) {
                this.render();
            }
        }
    },
    /**
     *
     * @return {FunUI.utils.ArrayView|null}
     */
    get dataProvider() {
        return this._arrayView;
    },
    render: function () {
        var data;
        if (!this._arrayView) {
            data = [];
        } else {
            data = this._arrayView.currentView;
        }

        var items = this._items;
        if (!items) {
            items = [];
            this._items = items;
        }
        for (var i = 0, length = data.length; i < length; i++) {
            var datum = data[i];
            var item;
            if (items.length > i) {
                item = items[i];
            } else {
                item = this._itemProto.cloneNode(true);
                item.initFunUI(true, this.itemRenderer);
                item.list = this;
                this.appendChild(item);
                items.push(item);
            }

            if (this.isIndexSelected(i)) {
                item.select();
            } else {
                item.deselect();
            }
            item.index = i;
            item.data = datum;

            if (typeof item.render == 'function') {
                item.render(datum, i);
            }
        }

        for (i = data.length, length = items.length; i < length; i++) {
            item = items.pop();
            if (typeof item.clear == 'function') {
                item.clear();
            }
            item.data = null;
            this.removeChild(item);
        }

        this._items.splice(data.length, items.length - data.length);
    },
    /**
     *
     * @param {int} index
     */
    selectItem: function (index) {
        if (this._selectedIndices.indexOf(index) >= 0) {
            return;
        }

        if (!this.multiSelect) {
            while (this._selectedIndices.length > 0) {
                this.deselectItem(this._selectedIndices[0]);
            }
        }

        this._selectedIndices.push(index);
        if (this._items.length > index) {
            this._items[index].select();
        }

        this._selectedChanged = true;
        this.invalidate();
    },
    /**
     *
     * @param {int} index
     */
    deselectItem: function (index) {
        if (this._selectedIndices.indexOf(index) < 0) {
            return;
        }

        this._selectedIndices.splice(this._selectedIndices.indexOf(index), 1);
        if (this._items.length > index) {
            this._items[index].deselect();
        }

        this._selectedChanged = true;
        this.invalidate();
    },
    selectAll: function () {
        if (!this.multiSelect) {
            throw new Error("this operation is not allowed with multiSelect is true");
        }
        for (var i = 0, length = this._items.length; i < length; i++) {
            this.selectItem(i);
        }
    },
    deselectAll: function () {
        if (!this.multiSelect) {
            throw new Error("this operation is not allowed with multiSelect is true");
        }

        for (var i = 0, length = this._items.length; i < length; i++) {
            this.deselectItem(i);
        }
    },
    /**
     *
     * @return {boolean}
     */
    get allSelected() {
        return this._allSelected;
    },
    /**
     *
     * @return {Array.<int>}
     */
    get selectedIndices() {
        return this._selectedIndices;
    },
    get selectedIndex() {
        return this._selectedIndices && this._selectedIndices.length > 0 ? this._selectedIndices[0] : -1;
    },
    isIndexSelected: function (index) {
        return this._selectedIndices && this._selectedIndices.indexOf(index) >= 0;
    },
    /**
     *
     * @return {Array}
     */
    get selectedData() {
        if (!this._arrayView) {
            return null;
        }

        var ret = [];
        for (var i = 0, length = this._selectedIndices.length; i < length; i++) {
            ret = this._arrayView.item(i);
        }

        return ret;
    },
    get selectedDatum() {
        var index = this.selectedIndex;
        if (index < 0) {
            return null;
        }

        return this._arrayView.item(index);
    },
    commitProperties: function () {
        if (this._selectedChanged) {
            this.fire(new CustomEvent(FunUI.events.SELECTED_CHANGED));

            var allSelected = this._items ? (this._selectedIndices.length == this._items.length) : false;

            if (this._allSelected != allSelected) {
                this._allSelected = allSelected;
                this.fire(new CustomEvent(FunUI.events.ALL_SELECTED_CHANGED));
            }

            this._selectedChanged = false;
        }
    },
    _allSelected: false,
    _selectedIndices: null,
    _items: null,
    _arrayView: null,
    _itemProto: null
};


/**
 * @mixin
 */
FunUI.components.ItemRenderer = FunUI.utils.extend(
    FunUI.components.Selectable,
    {
        list: null,
        index: -1,
        data: null,
        /**
         * @abstract
         * @param {*} data
         * @param {int} index
         */
        render: function (data, index) {
            this.innerHTML = data;
        },
        clear: function () {
        }
    });

/**
 * @mixin
 */
FunUI.components.CheckBox = FunUI.utils.extend(
    FunUI.components.Selectable,
    {
        __init__: function () {
            FunUI.utils.attachSound(this);
            this.presentSubComponent("hover");
            this.selected = this.hasClass("selected");
            this.on("click", this.toggle);
        },
        toggle: function () {
            var stat = !this._selected;
            this.selected = stat;
            return stat;
        }
    });

/**
 * @mixin
 */
FunUI.components.RadioButton = FunUI.utils.extend(
    FunUI.components.Selectable,
    {
        index: -1,
        __init__: function () {
            FunUI.utils.attachSound(this);
            this.presentSubComponent("hover");
            if (this.hasClass("selected")) {
                this.select();
            }
            this.on('click', this.select);
        }
    });

/**
 * @mixin
 */
FunUI.components.RadioGroup = {
    _buttons: null,
    _selectedIndex: -1,
    __init__: function () {
        this._buttons = this.getElementsByClassName('F-RadioButton');

        for (var i = 0, length = this._buttons.length; i < length; i++) {
            var button = this._buttons[i];
            button.index = i;

            button.on(FunUI.events.SELECTED_CHANGED, this.selectIndex.bind(this, i));

            if (button.selected) {
                this.selectIndex(i);
            }
        }
    },
    selectIndex: function (index) {
        if (this._selectedIndex == index) {
            return;
        }

        if (this._selectedIndex != -1) {
            this._buttons[this._selectedIndex].selected = false;
        }

        if (index) {
            this._buttons[index].selected = true;
        }

        this._selectedIndex = index;
        this.fire(new CustomEvent(FunUI.events.SELECTED_CHANGED));
    },
    get selectedIndex() {
        return this._selectedIndex;
    }
};

/**
 * @mixin
 */
FunUI.components.SelectAllCtrl = {
    _list: null,
    __init__: function () {
        FunUI.utils.attachSound(this);
        this.presentLabelChild();
        this.presentSubComponent("hover");
        this.on("click", this.toggle);
    },
    listenTo: function (list) {
        if (list && (typeof list.on != "function" || typeof list.off != "function")) {
            throw new Error("target must be a EventTarget");
        }

        if (this._list == list) {
            return;
        }

        if (this._list) {
            this._list.off(FunUI.events.ALL_SELECTED_CHANGED, this.render);
        }

        if (list) {
            list.on(FunUI.events.ALL_SELECTED_CHANGED, this.render);
        }

        this._list = list;
        this.render();
    },
    get list() {
        return this._list;
    },
    toggle: function () {
        if (!this._list) {
            return false;
        }

        if (this._list.allSelected) {
            this._list.deselectAll();
            return false;
        }

        this._list.selectAll();
        return true;
    },
    render: function () {
        if (this._list.allSelected) {
            this.addClass("selected")
        } else {
            this.removeClass("selected");
        }
    }
};

FunUI.components.PageLabel = {
    set dataProvider(arrayView) {
        if (!(arrayView instanceof FunUI.utils.ArrayView)) {
            throw new Error('F$ArrayView required');
        }

        if (this._arrayView != arrayView) {
            if (this._arrayView) {
                this._arrayView.off(FunUI.events.ARRAY_VIEW_UPDATE, this.render);
            }

            if (arrayView) {
                arrayView.on(FunUI.events.ARRAY_VIEW_UPDATE, this.render);
            }
            this._arrayView = arrayView;
            this.render();
        }
    },
    get dataProvider() {
        return this._arrayView;
    },
    render : function() {
        if (!this._arrayView) {
            this.innerHTML = "";
        } else {
            this.innerHTML = (this._arrayView.page + (this._arrayView.pageCount == 0 ? 0 : 1)) + "/" + this._arrayView.pageCount;
        }
    }
};

/**
 * @mixin
 */
FunUI.components.PageCtrl = {
    _mouseDown : false,
    __init__: function () {
        FunUI.utils.attachSound(this);
        this.presentLabelChild();
        this.presentSubComponent("hover");
        this.on("click", this.perform);
    },
    /**
     *
     * @param {FunUI.utils.ArrayView} arrayView
     */
    set dataProvider(arrayView) {
        if (!(arrayView instanceof FunUI.utils.ArrayView)) {
            throw new Error('F$ArrayView required');
        }

        if (this._arrayView != arrayView) {
            if (this._arrayView) {
                this._arrayView.off(FunUI.events.ARRAY_VIEW_UPDATE, this.render);
            }

            if (arrayView) {
                arrayView.on(FunUI.events.ARRAY_VIEW_UPDATE, this.render);
            }
            this._arrayView = arrayView;
            this.render();
        }
    },
    get dataProvider() {
        return this._arrayView;
    },
    perform: function (event) {
        var arrayView = this.dataProvider;
        if (!arrayView) {
            return;
        }

        if (this.hasClass("prevPage")) {
            arrayView.page--;
        } else if (this.hasClass("nextPage")) {
            arrayView.page++;
        } else if (this.hasClass("firstPage")) {
            arrayView.page = 0;
        } else if (this.hasClass("lastPage")) {
            arrayView.page = arrayView.pageCount - 1;
        }

        if (!!event && event instanceof MouseEvent && event.type == "mousedown") {

        }
    },
    render: function () {
        var arrayView = this.dataProvider;
        if (!arrayView) {
            this.disabled = true;
            return;
        }

        if (this.hasClass("prevPage") || this.hasClass("firstPage")) {
            this.disabled = arrayView.isFirstPage;
        } else if (this.hasClass("nextPage") || this.hasClass("lastPage")) {
            this.disabled = arrayView.isLastPage;
        }
    }
};

FunUI.components.DropDownList = {
    _label: null,
    list: null,
    itemRenderer: {
        _label: null,
        __init__: function () {
            FunUI.utils.attachSound(this);
            this.on('click', function () {
                this.list.selectItem(this.index);
            });
            this._label = this.presentLabelChild(true);
            this.presentSubComponent('hover');
        },
        render: function (data) {
            this._label.innerHTML = data;
        }
    },
    __init__: function () {
        this._label = this.presentLabelChild(true);

        this.list = document.createElement("ul");
        this.list.className = "F-List forDropDownList";
        this.list.presentSubComponent("F-ItemRenderer", "li");
        this.list.initFunUI(true, {
            itemRenderer: this.itemRenderer
        });

        var self = this;
        this.list.on(FunUI.events.SELECTED_CHANGED, function (event) {
            self.renderLabel(self._label, self.selectedItem);
        });

        this.deactivate();
    },
    renderLabel: function (label, data) {
        label.innerHTML = data;
    },
    set dataProvider(arrayView) {
        this.list.dataProvider = arrayView;
    },
    activate: function (event) {
        this.off('click', this.activate);
        this.addClass('active');
        FunUI.managers.PopUpManager.addPopUp(this.list, false, FunUI.managers.PopUpManager.LAYER_PERIPHERY);
        this.positionList(this.list);

        if (event != null) {
            event.stopPropagation();
        }
        document.documentElement.on('click', this.deactivate);
    },
    deactivate: function (event) {
        document.documentElement.off('click', this.deactivate);

        this.removeClass('active');
        FunUI.managers.PopUpManager.removePopUp(this.list);
        this.on('click', this.activate);
    },
    /**
     *
     * @param {int} index
     */
    selectItem: function (index) {
        this.list.selectItem(index);
    },
    get selectedItem() {
        return this.list.selectedDatum;
    },
    positionList: function (list) {
        var clientRect = this.getBoundingClientRect();
        list.style.width = clientRect.width + 'px';
        list.style.left = clientRect.left + "px";
        list.style.top = (clientRect.bottom + this.list.height > document.documentElement.offsetHeight)
            ? (clientRect.top - this.list.height) + "px"
            : clientRect.bottom + "px";
    }
};

FunUI.components.Prompt = {
    _titleElement: null,
    _contentElement: null,
    _queue: null,
    __init__: function () {
        this._titleElement = this.getSubComponent("title");
        this._contentElement = this.getSubComponent("content");

        var yesButton = this.querySelector(".F-Button.yes");
        if (yesButton) {
            yesButton.on("click", this._yesHandler);
        }

        var noButton = this.querySelector(".F-Button.no");
        if (noButton) {
            noButton.on("click", this._noHandler);
        }
    },
    show: function (title, content, onYes, onNo) {
        if (this._queue == null) {
            this._queue = [];
        }

        this._queue.push({
            title: title,
            content: content,
            onYes: onYes,
            onNo: onNo
        });

        if (this._queue.length == 1) {
            this.delayCall(this._renderFirst);
        }

        FunUI.managers.PopUpManager.addPopUp(this, true, FunUI.managers.PopUpManager.LAYER_TOP);
    },
    hide: function () {
        FunUI.managers.PopUpManager.removePopUp(this);
    },
    _renderFirst: function () {
        var obj = this._queue[0];
        this._titleElement.innerHTML = obj.title;
        this._contentElement.innerHTML = obj.content;
    },
    _renderNext: function () {
        this._queue.shift();

        if (this._queue.length == 0) {
            this.hide();
        } else {
            this._renderFirst();
        }
    },
    _yesHandler: function () {
        var obj = this._queue[0];
        if (!!obj.onYes) {
            obj.onYes();
        }

        this._renderNext();
    },
    _noHandler: function () {
        var obj = this._queue[0];
        if (!!obj.onNo) {
            obj.onNo();
        }

        this._renderNext();
    }
};


FunUI.layouts = {};
FunUI.traits = {};
FunUI.views = {};

Object.freeze(FunUI.CSS_PREFIX);
Object.freeze(FunUI.utils);
Object.freeze(FunUI.events);
Object.freeze(FunUI.managers);
Object.freeze(FunUI.components);
Object.freeze(FunUI);

var F$ = FunUI.utils.getView;
var F$ArrayView = FunUI.utils.ArrayView;
var F$alert = FunUI.utils.alert;
var F$confirm = FunUI.utils.confirm;
var F_ = FunUI.lang.getEmbeddedText;