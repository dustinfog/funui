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

if (!Math.sign) {
    Math.sign = function(x) {
        x = +x;
        if (x === 0 || isNaN(x)) {
            return Number(x);
        }
        return x > 0 ? 1 : -1;
    };
}

if (typeof Object.values != "function") {
    Object.values = function (obj) {
        if (Array.isArray(obj)) {
            return obj;
        }

        var values = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                values.push(obj[key]);
            }
        }

        return values;
    }
}

/**
 * hack for Object.assign
 */
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }

    });
}


/**
 * hack for Array.from
 */
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}

/**
 * hack for CustomEvent
 */
(function () {

    if ( typeof window.CustomEvent === "function" ) return false;

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

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

(function() {
    // helpers
    var regExp = function(name) {
        return new RegExp('(^| )'+ name +'( |$)');
    };
    var forEach = function(list, fn, scope) {
        for (var i = 0; i < list.length; i++) {
            fn.call(scope, list[i]);
        }
    };

    // class list object with basic methods
    function ClassList(element) {
        this.element = element;
    }

    ClassList.prototype = {
        add: function() {
            forEach(arguments, function(name) {
                if (!this.contains(name)) {
                    this.element.className += this.element.className.length > 0 ? ' ' + name : name;
                }
            }, this);
        },
        remove: function() {
            forEach(arguments, function(name) {
                this.element.className =
                    this.element.className.replace(regExp(name), '');
            }, this);
        },
        toggle: function(name) {
            return this.contains(name)
                ? (this.remove(name), false) : (this.add(name), true);
        },
        contains: function(name) {
            return regExp(name).test(this.element.className);
        },
        // bonus..
        replace: function(oldName, newName) {
            this.remove(oldName), this.add(newName);
        }
    };

    // IE8/9, Safari
    if (!('classList' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function() {
                return new ClassList(this);
            }
        });
    }

    // replace() support for others
    if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
        DOMTokenList.prototype.replace = ClassList.prototype.replace;
    }
})();

/**
 @param {string} type
 @param {EventListener|Function} listener
 @param {boolean} [useCapture = false]
 */
HTMLElement.prototype.on = HTMLElement.prototype.addEventListener;

/**
 @param {string} type
 @param {EventListener|Function} listener
 @param {boolean} [useCapture = false]
 */
HTMLElement.prototype.off = HTMLElement.prototype.removeEventListener;
/**
 @param {Event} event
 @return {boolean}
 */
HTMLElement.prototype.fire = HTMLElement.prototype.dispatchEvent;

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
    var ret = this.getSubComponents(className, 1);
    if (ret.length > 0) {
        return ret[0];
    }

    return null;
};
/**
 *
 * @param {String} className
 * @param {Number} limit
 * @return {Array.<HTMLElement>}
 */
HTMLElement.prototype.getSubComponents = function (className, limit) {
    var list = this.getElementsByClassName(className);
    var ret = [];
    for (var i = 0, length = list.length; i < length; i++) {
        var ele = list.item(i);
        if (ele.parentNode == this) {
            ret.push(ele);

            if (limit <= list.length) {
                break;
            }
        }
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

    if (!this._delayedCalls) {
        this._delayedCalls = [];
    }


    if (arguments.length >= 2) {
        callback = Function.prototype.bind.apply(callback, Array.prototype.slice.call(arguments, 1));
    }

    this._delayedCalls.push(callback);
    this.invalidate();
};

HTMLElement.prototype.initFunUI = (function () {
    var mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var addedNodes = mutation.addedNodes;
            for(var i = 0, length = addedNodes.length; i < length; i ++) {
                var addedNode = addedNodes[i];

                if (addedNode.nodeType != Node.ELEMENT_NODE) {
                    continue;
                }

                var node, walk = document.createTreeWalker(addedNode, NodeFilter.SHOW_ELEMENT, null, false);
                while (node = walk.nextNode()) {
                    if (node._invalid === true) {
                        node.invalidate();
                    }
                }
            }
        });
    });

    document.addEventListener("DOMContentLoaded", function() {
        mutationObserver.observe(document.body, {childList: true, subtree: true});
    });

    return function () {
        if (this.funUIInitialized) {
            return false;
        }

        // parse parameter
        var embedded = false;
        var extraTraits = [];
        for (var i = 0, length = arguments.length; i < length; i++) {
            var arg = arguments[i];
            if (typeof arg === "boolean") {
                embedded = arg;
            } else {
                extraTraits.push(arg);
            }
        }

        // init children
        for (i = 0, length = this.childNodes.length; i < length; i++) {
            var child = this.childNodes[i];

            if (child.nodeType === Node.ELEMENT_NODE) {
                child.initFunUI(embedded);
            } else if (embedded && child.nodeType === Node.TEXT_NODE && FunUI.lang.isEnabled()) {
                child.nodeValue = FunUI.lang.apply(child.nodeValue);
            }
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

        if (!!this.id) {
            FunUI.views[this.id] = this;
        }

        mixin(this, componentTrait, extraTraits, customizedTrait, dataSet);
        this.funUIInitialized = true;
        var that = this;
        this.delayCall(function () {
            that.fire(new CustomEvent(FunUI.events.INITIALIZED));
        });
        return true;
    };

    /**
     * @param {HTMLElement} element
     * @param {...} traits
     */
    function mixin() {
        var args = Array.from(arguments);
        var element = args.shift();
        var traits = flattenTraits(args);

        var init = "__init__";
        var initializers = [];

        if (!Array.isArray(element._validators)) {
            element._validators = [];
        }

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

                if (prop == "commitProperties") {
                    element._validators.push(trait[prop]);
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

                    var nameRef = new FunUI.utils.Reference();
                    var annotations = FunUI.utils.parseAnnotations(prop, nameRef);

                    if (annotations) {
                        for (var i = 0; i < annotations.length; i++) {
                            value = annotations[i].apply(element, value) || value;
                        }
                    } else if (typeof value == "function") {
                        value = value.bind(element);
                    }

                    var name = nameRef.get();
                    if (name && name.length > 0) {
                        element[name] = value;
                    }
                }
            }
        }
        for (var i = 0, length = initializers.length; i < length; i++) {
            initializers[i].call(element);
        }

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
    if (typeof this._invalid == "number") {
        return;
    }

    if (!this.hasOwnProperty("validate")) {
        this.validate = this.validate.bind(this);
    }

    if (document.body.contains(this)) {
        this._invalid = setTimeout(this.validate, 0);
    } else {
        this._invalid = true;
    }
};

/**
 * @abstract
 */
HTMLElement.prototype.validate = function () {
    if (!this._invalid) {
        return;
    }

    if (Array.isArray(this._validators)) {
        var that = this;
        this._validators.forEach(function (callback) {
            callback.call(that);
        });
    }

    while (this._delayedCalls && this._delayedCalls.length) {
        this._delayedCalls.shift().call(null);
    }

    if (typeof this._invalid == "number") {
        clearTimeout(this._invalid);
    }

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


Object.defineProperty(HTMLElement.prototype, "disabled", (function () {
    function stopEvent(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
    }

    return {
        set: function (value) {
            if (this._disabled === value) {
                return;
            }

            if (value) {
                this.addClass('disabled');
                this.on('click', stopEvent, true);
            } else {
                this.removeClass('disabled');
                this.off('click', stopEvent, true);
            }

            this._disabled = value;
        },
        get: function () {
            if (typeof this._disabled == 'undefined') {
                this.disabled = this.hasClass('disabled');
            }
            return this._disabled;
        }
    };
})());

document.documentElement.on('mousemove', function(event) {
    document.mouseX = event.clientX;
    document.mouseY = event.clientY;
}, true);

HTMLElement.prototype.containsMouse = function() {
    var rect = this.getBoundingClientRect();

    return rect.left <= document.mouseX
        && rect.right >= document.mouseX
        && rect.top <= document.mouseY
        && rect.bottom >= document.mouseY;
};

var FunUI = {};

FunUI.CSS_PREFIX = 'F-';

FunUI.utils = {};
FunUI.utils.alert = function (content, onYes, title) {
    F$('alert').show(title || F_('alert.title'), content, onYes);
};

FunUI.utils.confirm = function (content, onYes, onNo, title) {
    F$('confirm').show(title || F_('confirm.title'), content, onYes, onNo);
};

FunUI.utils.attachSound = function (targetNode) {
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

FunUI.utils.getBoundMethod = function(obj, methodName) {
    if (typeof obj[methodName] != 'function') {
        throw new Error('invalid method ' + methodName);
    }

    if (!obj.hasOwnProperty(methodName)) {
        obj[methodName] = obj[methodName].bind(obj);
    }

    return obj[methodName]
};

FunUI.utils.parseAnnotations = function () {
    /**
     * @param {Element} node
     */
    function nodeToAnnotation(node) {
        var name = node.tagName;
        if (name == "parsererror") {
            throw new Error(node.querySelector("div").innerHTML);
        }

        var definition = FunUI.annotations[name];
        if (!definition) {
            throw new Error("Can't find annotation definition FunUI.annotations." + name);
        }

        var annotation = Object.create(definition);

        var attributes = node.attributes;
        for (var i = 0, length = attributes.length; i < length; i++) {
            var attribute = attributes[i];
            annotation[attribute.name] = attribute.value.literal;
        }

        var children = node.childNodes;
        annotation.children = [];
        for (i = 0, length = children.length; i < length; i++) {
            var child = child[i];
            if (child.nodeType == Node.ELEMENT_NODE) {
                annotation.children.push(nodeToAnnotation(child));
            }
        }

        return annotation;
    }

    /**
     *
     * @param {string} key
     * @param {FunUI.utils.Reference} nameRef
     */
    return function (key, nameRef) {
        key = key.trim();
        if (key.indexOf("<") != 0) {
            if (nameRef instanceof FunUI.utils.Reference) {
                nameRef.set(key);
            }
            return null;
        }

        var term = key.lastIndexOf(">");
        if (term < 0) {
            throw new Error("invalidate annotation format");
        }

        if (nameRef instanceof FunUI.utils.Reference) {
            nameRef.set(key.substr(term + 1).trim());
        }

        var text = key.substr(0, term + 1);
        text = "<Annotations>" + text + "</Annotations>";

        var parser = new DOMParser();
        var doc = parser.parseFromString(text, "application/xml");
        var nodes = doc.documentElement.childNodes;
        var annotations = [];
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeType == Node.ELEMENT_NODE) {
                annotations.push(nodeToAnnotation(nodes[i]));
            }
        }

        return annotations;
    };
}();

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
        getEmbeddedText: function (key, params) {
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

            var text = (this._embeddedLanguages && this._embeddedLanguages[this._language][key]) || "";
            if (params) {
                text = text.replace(/\[\[([^\]]+)]]/g, function (pattern, key) {
                    return params[key];
                });
            }
            return text;
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

    if (viewId instanceof String) {
        viewId = viewId.toString();
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
        if (layout) {
            layout = FunUI.lang.apply(layout);
            FunUI.utils.relay.innerHTML = layout;
            view = FunUI.utils.relay.firstElementChild;
            if (!view) {
                throw new Error("invalid view, please check if view's Id and filename are identical");
            }

            FunUI.utils.relay.removeChild(view);
            delete FunUI.layouts[viewId];

            view.initFunUI();
        } else {
            return FunUI.traits[viewId];
        }
    } else {
        view.initFunUI(true);
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
        return this._dirty;
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

FunUI.utils.ajax = function () {
    /**
     * @see https://github.com/knowledgecode/jquery-param/blob/master/jquery-param.js
     * @param a
     * @return {string}
     */
    function param(a) {
        if (typeof a == "string") {
            return a;
        }

        var s = [], rbracket = /\[\]$/,
            isArray = function (obj) {
                return Object.prototype.toString.call(obj) === '[object Array]';
            }, add = function (k, v) {
                v = typeof v === 'function' ? v() : v === null ? '' : v === undefined ? '' : v;
                s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
            }, buildParams = function (prefix, obj) {
                var i, len, key;

                if (prefix) {
                    if (isArray(obj)) {
                        for (i = 0, len = obj.length; i < len; i++) {
                            if (rbracket.test(prefix)) {
                                add(prefix, obj[i]);
                            } else {
                                buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i]);
                            }
                        }
                    } else if (obj && String(obj) === '[object Object]') {
                        for (key in obj) {
                            buildParams(prefix + '[' + key + ']', obj[key]);
                        }
                    } else {
                        add(prefix, obj);
                    }
                } else if (isArray(obj)) {
                    for (i = 0, len = obj.length; i < len; i++) {
                        add(obj[i].name, obj[i].value);
                    }
                } else {
                    for (key in obj) {
                        buildParams(key, obj[key]);
                    }
                }
                return s;
            };

        return buildParams('', a).join('&').replace(/%20/g, '+');
    }

    function createRequest() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }

    function send(method, url, callback, data, headers) {
        var request = createRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4) {
                callback(this);
            }
        };

        request.open(method, url);
        if ((method == 'POST' || method == "PUT") && !headers["Content-type"]) {
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }

        if (headers) {
            for (var k in headers) {
                request.setRequestHeader(k, headers[k]);
            }
        }

        if (data) {
            request.send(param(data));
        } else {
            request.send();
        }
    }

    var methods = [
        'HEAD',
        'OPTIONS',
        'GET',
        'PUT',
        'PATCH',
        'POST',
        'DELETE'
    ];
    var ajax = {};
    for (var i = 0; i < methods.length; i ++) {
        ajax[methods[i].toLocaleLowerCase()] = send.bind(null, methods[i]);
    }

    return ajax;
}();


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

    view.fire(popUpEvent);
    FunUI.managers.PopUpManager.fire(popUpEvent);
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

    if (!keepModal && this._modalLayer.parentNode == popUpLayer) {
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
    _label: null,
    _labelField: null,
    __init__: function () {
        FunUI.utils.attachSound(this);
        this._labelField = this.presentLabelChild(true);
        this._label = this._labelField.innerHTML;
        this.presentSubComponent("hover");
    },
    set label(v) {
        this._label = v;
        this._labelChanged = true;
        this.invalidate();
    },
    get label() {
        return this._label;
    },
    commitProperties: function () {
        if (this._labelChanged) {
            this._labelField.innerHTML = this._label;
            this._labelChanged = false;
        }
    }
};

/**
 * @mixin
 */
FunUI.components.Selectable = {
    _selected: false,
    select: function () {
        this.selected = true;
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
    get selected() {
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
    _maxLength: -1,
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
    onKeyDown: function (event) {
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
    _title: null,
    _titleField: null,
    __init__: function () {
        if (this.drawingBg) {
            this.presentSubComponent("bg");
        }

        this._titleField = this.getSubComponent('title');
        var closeButton = this.getSubComponent("close");
        if (closeButton) {
            closeButton.on("click", this.close);
        }
    },
    set title(v) {
        this._title = v;
        this._titleChanged = true;
        this.invalidate();
    },
    get title() {
        return this._title;
    },
    commitProperties: function () {
        if (this._titleChanged) {
            this._titleField.innerHTML = this._title;
            this._titleChanged = false;
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
    _pagesChanged: false,
    __init__: function () {
        this._pages = this.getSubComponents("F-TabSubPage");
        for (var i = 0; i < this._pages.length; i++) {
            var page = this._pages[i];
            page.pageIndex = i;

            page.on(FunUI.events.SELECTED_CHANGED, this._onPageSelectedChanged)
        }

        this._excludedPages = {};
        this._pagesChanged = true;
        this.invalidate();
    },
    excludePage: function (pageIndex) {
        if (pageIndex >= 0 && pageIndex < this._pages.length && !this._excludedPages[pageIndex]) {
            this._excludedPages[pageIndex] = true;
            this._pagesChanged = true;
            this.invalidate();
        }
    },
    includePage: function (pageIndex) {
        if (pageIndex >= 0 && pageIndex < this._pages.length && !!this._excludedPages[pageIndex]) {
            delete this._excludedPages[pageIndex];
            this._pagesChanged = true;
            this.invalidate();
        }
    },
    commitProperties: function () {
        if (!this._pagesChanged) {
            return;
        }
        var pages = this._pages;
        var pageTitles = [];
        var pageContents = [];
        var pageContent;

        var maxHeight = 0, maxWidth = 0, maxContentWidth = 0, maxContentHeight = 0, pageBarWidth = 0;
        var lastPage = null;
        for (var i = 0, length = pages.length; i < length; i++) {
            var page = pages[i];
            if (!!this._excludedPages[i]) {
                if (page.parentNode == this) {
                    this.removeChild(page);
                }
                continue;
            }

            if (page.parentNode != this) {
                if (lastPage == null) {
                    this.appendChild(page);
                } else {
                    this.insertBefore(page, lastPage)
                }
            }

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

            lastPage = page;
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

        this._pagesChanged = false;
    },

    /**
     * @type {string} center|left|right
     */
    _barAlign: "center",
    /**
     * @type {int}
     */
    _barOffsetLeft: 0,
    set barAlign(align) {
        this._barAlign = align;
        this.invalidate();
    },
    get barAlign() {
        return this._barAlign;
    },
    set barOffsetLeft(value) {
        this._barOffsetLeft = value;
        this.invalidate();
    },
    get barOffsetLeft() {
        return this._barOffsetLeft;
    },
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
    _onPageSelectedChanged: function (event) {
        var page = event.currentTarget;
        if (!page.selected) {
            return;
        }

        this.selectedIndex = this._pages.indexOf(page);
    },
    _excludedPages: null,
    _pages: null,
    _zIndexSeq: 0
};

FunUI.components.TabSubPage = FunUI.utils.extend(
    FunUI.components.Selectable,
    {
        _title: null,
        _content: null,
        __init__: function () {
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

        document.addEventListener('click', this.tryHide, true);
        this.delayCall(this._show);
    },
    hide: function () {
        document.removeEventListener('click', this.tryHide, true);
        FunUI.managers.PopUpManager.removePopUp(this);
    },
    tryHide: function (event) {
        if (event.target != this._host && !this._host.contains(event.target)) {
            this.hide();
        }
    },
    /**
     * @abstract
     * @param {HTMLElement} host
     */
    position: function (host) {
        if (!this.parentNode) {
            return;
        }
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
        if (dataProvider != null && !(dataProvider instanceof FunUI.utils.ArrayView)) {
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

            if (!dataProvider || !dataProvider.isDirty) {
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
                item.initFunUI(this.itemRenderer);
                item.list = this;
                this.appendChild(item);
                items.push(item);
            }

            if (typeof item.render == 'function') {
                item.render(datum, i);
                item.data = datum;
                item.index = i;
            }

            if (this.isIndexSelected(i)) {
                item.select();
            } else {
                item.deselect();
            }
        }

        for (i = data.length, length = items.length; i < length; i++) {
            item = items.pop();
            if (typeof item.clear == 'function') {
                item.clear();
            }
            item.data = null;
            item.index = -1;
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
        __init__ : function() {
            this.on(FunUI.events.SELECTED_CHANGED, this._onSelectChanged);
        },
        _onSelectChanged : function() {
            var list = this.list;
            if (this.selected && list) {
                list.selectItem(this.index);
            }
        },
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
    render: function () {
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
    _mouseDown: false,
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
        this.list.initFunUI({
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

FunUI.components.ProgressBar = {
    _indicators: null,
    _base: null,
    _progresses: null,
    __init__: function () {
        this._indicators = this.querySelectorAll('.indicator');
    },
    setProgresses: function () {
        this._base = arguments[0];
        this._progresses = Array.prototype.slice.call(arguments, 1);
        this.invalidate();
    },
    getProgress: function (index) {
        return Math.floor(this._progresses[index] * 100 / this._base) / 100;
    },
    commitProperties: function () {
        if (!this._progresses) {
            return;
        }
        for (var i = 0; i < this._indicators.length; i++) {
            this._indicators[i].style.width = Math.floor(this._progresses[i] * 100 / this._base) + "%";
        }
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
            this._renderFirst();
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

FunUI.annotations = {};

FunUI.annotations.Observer = {
    selector: null,
    event: null,
    useCapture: false,
    apply: function (obj, value) {
        if (typeof value != "function") {
            throw new Error("invalid listener");
        }

        value = value.bind(obj);
        if (!this.selector) {
            obj.on(this.event, value, this.useCapture);
        } else {
            var elements = obj.querySelectorAll(this.selector);
            for (var i = 0; i < elements.length; i++) {
                elements[i].on(this.event, value, this.useCapture);
            }
        }

        return value;
    }
};

FunUI.annotations.Delay = {
    apply: function (obj, value) {
        if (typeof value != "function") {
            throw new Error("invalid function");
        }

        return obj.delayCall.bind(obj, value, obj);
    }
};

FunUI.layouts = {};
FunUI.traits = {};
FunUI.views = {};

Object.freeze(FunUI.utils);
Object.freeze(FunUI.events);
Object.freeze(FunUI.managers);
Object.freeze(FunUI.components);
Object.freeze(FunUI);

var F$ = FunUI.utils.getView;
var F$ArrayView = FunUI.utils.ArrayView;
var F$ajax = FunUI.utils.ajax;
var F$alert = FunUI.utils.alert;
var F$confirm = FunUI.utils.confirm;
var F_ = FunUI.lang.getEmbeddedText;