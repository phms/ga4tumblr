"use strict";

// var ga4tumblr_ua = "UA-XXXXX-X";

/*!
 * ga4tumblr
 * http://code.google.com/p/ga4tumblr/downloads/list
 *
 * Copyright 2011, @fabiophms
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
*/

/*
 * Includes jQuery JavaScript Library
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Includes jQuery.appear v1.1.1
 * http://code.google.com/p/jquery-appear/
 * Copyright (c) 2009 Michael Hixson
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 *
 * Adaptation to 'Debuging Javascript with Google Analytics'
 * http://www.directperformance.com.br/en/javascript-debug-simples-com-google-analytics
 * 2010, Eduardo Cereto
*/

var ga4tumblr = {
	ua : ga4tumblr_ua,
	version : 1.6,
	path : String(document.location.pathname).toLowerCase(),
	host : String(document.location.host).toLowerCase(),
	protocol : String(document.location.protocol).toLowerCase(),
	title : window.escape(String(document.title)),
	owner_cookie : "ga4tumblr_owner",
	a : document.createElement("a"),
	
	str2link : function(url) {
		ga4tumblr.a.href = url;
		return ga4tumblr.a;
	},
	
	set_owner : function () {
		var date = new Date();
		date.setTime(date.getTime() + 31536000000); // one year	
		document.cookie = (ga4tumblr.owner_cookie + "=" + ga4tumblr.title + "; domain=.tumblr.com; path=/; expires="+date.toGMTString());
	},
	
	is_owner : function () { 
		if (
			ga4tumblr.title.indexOf(ga4tumblr.get_cookie(ga4tumblr.owner_cookie)) !== -1 || 
			ga4tumblr.host === "safe.tumblr.com" ||
			ga4tumblr.path.substring(0, 5) === "/new/" ||
			ga4tumblr.path.substring(0, 6) === "/edit/"
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
		window._gaq.push(
			['_setAccount', ga4tumblr.ua],
			['_trackPageview'],
			['_trackPageLoadTime']
		);
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
				var url_prefix = (ga4tumblr.protocol + '//' + ga4tumblr.host + '/post/');

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

				if (ga4tumblr.path.substring(0, 6) !== "/post/") {
					var url, permalinks = [];
					jQuery("a[href^='" + url_prefix + "']:not(a[href*='#'])").each(function(){
						permalinks[jQuery(this).attr('href')] = jQuery(this);
					});
					for (url in permalinks) {
						if (permalinks.hasOwnProperty(url)) {
							permalinks[url].appear(function(event, url) {
								window._gaq.push(['_trackPageview', ga4tumblr.str2link(url).pathname]);
							}, { 
								data: url
							});
						}
					}
				}
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
	},
	
	get_cookie : function(key) {
		var val = document.cookie.match ('(^|;) ?' + key + '=([^;]*)(;|$)');
		if (val) { return val[2]; }
		else { return undefined; }
	},
	
	prepare_selectors : function (){
		if (ga4tumblr.path.substring(0, 6) !== "/post/") {
			// jQuery.appear v1.1.1
			(function($){$.fn.appear=function(f,o){var s=$.extend({one:true},o);return this.each(function(){var t=$(this);t.appeared=false;if(!f){t.trigger('appear',s.data);return;}var w=$(window);var c=function(){if(!t.is(':visible')){t.appeared=false;return;}var a=w.scrollLeft();var b=w.scrollTop();var o=t.offset();var x=o.left;var y=o.top;if(y+t.height()>=b&&y<=b+w.height()&&x+t.width()>=a&&x<=a+w.width()){if(!t.appeared)t.trigger('appear',s.data);}else{t.appeared=false;}};var m=function(){t.appeared=true;if(s.one){w.unbind('scroll',c);var i=$.inArray(c,$.fn.appear.checks);if(i>=0)$.fn.appear.checks.splice(i,1);}f.apply(this,arguments);};if(s.one)t.one('appear',s.data,m);else t.bind('appear',s.data,m);w.scroll(c);$.fn.appear.checks.push(c);(c)();});};$.extend($.fn.appear,{checks:[],timeout:null,checkAll:function(){var l=$.fn.appear.checks.length;if(l>0)while(l--)($.fn.appear.checks[l])();},run:function(){if($.fn.appear.timeout)clearTimeout($.fn.appear.timeout);$.fn.appear.timeout=setTimeout($.fn.appear.checkAll,20);}});$.each(['append','prepend','after','before','attr','removeAttr','addClass','removeClass','toggleClass','remove','css','show','hide'],function(i,n){var u=$.fn[n];if(u){$.fn[n]=function(){var r=u.apply(this,arguments);$.fn.appear.run();return r;}}});})(jQuery);
		}
	
		ga4tumblr.apply_selector();
	}
};

// http://www.directperformance.com.br/en/javascript-debug-simples-com-google-analytics
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
				// jQuery - most recent version in the 1.x.x family
				ga4tumblr.protocol + "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js",
				ga4tumblr.prepare_selectors
			);
		} else {
			ga4tumblr.prepare_selectors();
		}
	}
} catch (e) {
	_track_error_event(e);
}
