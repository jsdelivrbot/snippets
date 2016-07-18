// the list of word(s) to exclude
// this list is overridden when window.avoid is defined earlier
var avoid = avoid ? avoid : "Dark Vador, Pokemon Go";
// to lower to avoid being case sensitive
avoid = avoid.toLowerCase().replace(/\s*,\s*/g, '|');
console.info('will remove rows with one of these words');
console.info(avoid.replace(/\|/g, ' | '));
var escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$]/g, '\\$&');
};
// clean up accents in strings
var accentsTidy = function (inputStr) {
    // to lower to avoid being case sensitive
    var str = inputStr.toLowerCase();
    var notGood = {
        a: '[àáâãäå]',
        ae: 'æ',
        c: 'ç',
        e: '[èéêë]',
        i: '[ìíîï]',
        n: 'ñ',
        o: '[òóôõö]',
        oe: 'œ',
        u: '[ùúûuü]',
        y: '[ýÿ]'
    };
    for (var good in notGood) {
        str = str.replace(new RegExp(notGood[good], 'g'), good);
    }
    return str;
};
var uniqueValues = function (value, index, self) {
    return self.indexOf(value) === index;
};
// a simple forEach function to be cross browser
var forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
        callback.call(scope, i, array[i]);
    }
};
// debounce function from underscore
var now = Date.now || function () {
        return new Date().getTime();
    };
var debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    var later = function () {
        var last = now() - timestamp;
        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };
    return function () {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }
        return result;
    };
};
// the main job of this script
var markExcludedAsRead = function () {
    var feeds = document.querySelectorAll('.entryList .title');
    forEach(feeds, function (index, feed) {
        // to lower to avoid being case sensitive + remove accents
        var str = accentsTidy(feed.text);
        // remove non letter/numeric characters & underscores
        str = str.replace(/[\W_]+/g, ' ').trim();
        var match = str.match(new RegExp(escapeRegExp(avoid), 'g'));
        if (match) {
            match = match.filter(uniqueValues);
            if (match[0]) {
                console.warn(index + ' - detected "' + match.join(', ') + '" in title %c' + str, "color:black;font-style: bold");
                // will click on mark as read & hide button on that feed
                feed.parentElement.parentElement.firstElementChild.lastElementChild.click();
            }
        } else {
            console.log(index + ' - nothing in title %c' + str, "color:darkgrey;font-style: italic");
        }
    });
};
// will filter feeds after a successful ajax request
// pretty useful when changing feeds category
var listenForAjaxRequest = function (callback) {
    _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        var original = this.onreadystatechange;
        this.onreadystatechange = function () {
            if (this.readyState === 4) {
                // delay a bit the callback execution
                setTimeout(callback, 200);
            }
            original.apply(this, arguments);
        };
        _send.apply(this, arguments);
    }
};
// init stack
var work = debounce(markExcludedAsRead, 500); // avoid calling markExcludedAsRead multiple times in 500ms interval
work();
listenForAjaxRequest(work);