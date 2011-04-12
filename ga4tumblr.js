"use strict";

// Ver: $Revision$
// Data: $Date$

// var ga4tumblr_ua = "UA-XXXXX-X";

var ga4tumblr = {
	ua : ga4tumblr_ua,

	version : 1.3,

	path : String(document.location.pathname).toLowerCase(),

	host : String(document.location.host).toLowerCase(),

	owner_cookie : ("ga4tumblr_owner" + "=" + window.escape(document.title)),

	set_owner : function () {
		document.cookie =  (ga4tumblr.owner_cookie + "; domain=.tumblr.com; path=/");
	},

	is_owner : function () {
		if (
		  String(document.cookie).indexOf(ga4tumblr.owner_cookie) !== -1
		  || ga4tumblr.path.indexOf("/new/") === 0
		  || ga4tumblr.host === "safe.tumblr.com"
		) {
			ga4tumblr.set_owner();
			return true;
		}

		return false;
	},

	load_ga : function () {

		if (!ga4tumblr.ua) {
			throw "GA account not set!";
		}

		if (typeof(window._gaq) === "undefined") {
			window._gaq = [];
		}

		window._gaq.push(['_setAccount', ga4tumblr.ua]);
		window._gaq.push(['_trackPageview']);

		(function () {
			var ga = document.createElement('script');
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';

			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
		})();
	},

	apply_selector : function () {
		jQuery(document).ready(function () {
			try {
				var path = (ga4tumblr.path === "/") ? "/" : (ga4tumblr.path + "/");

				jQuery.expr[':'].external = function (obj) {
					return (obj.hostname && obj.hostname !== ga4tumblr.host);
				};

				jQuery("a:external").mousedown(function () {
					window._gaq.push(['_trackPageview', path + "external/" + this.hostname]);
				});

				jQuery("a[href*='#']").mousedown(function () {
					var hash = this.hash;
					if (hash) { 
						hash = hash.substr(1);
					} else {
						hash = jQuery.trim(jQuery(this).text()).replace(/\s/g, "-");
					}
					
					window._gaq.push(['_trackPageview', path + "hash/" + hash]);
				});

				// experimental
				/* if (jQuery("#tumblr_controls").contents().find("a[href^='http://www.tumblr.com/customize']").size() > 0) {
					ga4tumblr.set_owner();
					// var login = ga4tumblr.host.split(".");
					// window._gaq.push(["_setVar", String(login[0])]);
				} */
			} catch (e) {
				_track_error_event(e);
			}
		});
	},

	script_load : function (url, callback, id) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.async = "true";
		script.src = url;
		if (id) {
			script.id = id;
		}

		if (callback) {
			if (script.readyState) { // for IE
				script.onreadystatechange = function () {
					if (script.readyState === "loaded" || script.readyState === "complete") {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else {
				script.onload = function () {
					callback();
				};
			}
		}

		var script_aux = document.getElementsByTagName('script')[0];
		script_aux.parentNode.insertBefore(script, script_aux);
	}
};

// Source: http://www.directperformance.com.br/javascript-debug-simples-com-google-analytics
function _track_error_event(exception) {
	if (typeof(window._gaq) !== "undefined") {
		window._gaq.push(['_trackEvent', 'Exception ' + (exception.name || 'Error'), //event category
			exception.message || exception, //event action
			document.location.href //event label
		]);
	}
	if (typeof(console) !== "undefined" && typeof(console.error) !== "undefined") {
		console.error((exception.name || 'Error') + ": " + (exception.message || exception));
	}
}

try {
	if (!ga4tumblr.is_owner()) {

		ga4tumblr.load_ga();

		if (typeof(jQuery) === "undefined") {
			ga4tumblr.script_load(
				document.location.protocol + "//ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js",
				ga4tumblr.apply_selector
			);
		} else {
			ga4tumblr.apply_selector();
		}
	}
} catch (e) {
	_track_error_event(e);
}
