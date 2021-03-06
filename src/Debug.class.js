// Effect Games Engine v1.0
// Copyright (c) 2005 - 2011 Joseph Huckaby
// Source Code released under the MIT License: 
// http://www.opensource.org/licenses/mit-license.php

/**
 * Effect Debug Tools
 * Only included if debug mode is activated
 **/

Class.create( 'Debug', {
	// 'Debug' static class allows application to log trace statements
	// and view them in a popup window
	
	__static: {
		
		enabled: false,
		categories: { all: 1 }, // which debug categories are enabled
		buffer: [], // array of debug log rows
		max_rows: 5000, // max number of rows in buffer
		win: null, // ref to open window
		ie: !!navigator.userAgent.match(/MSIE/),
		ie6: !!navigator.userAgent.match(/MSIE\D+6/),
		
		init: function() {
			// initialize debug library
			Debug.enabled = true;
			Debug.trace( 'debug', 'Debug log start' );
		},
		
		show: function() {
			// show debug window
			if (!Debug.win || Debug.win.closed) {
				Debug.trace('debug', "Opening debug window");
				Debug.win = window.open( '', 'DebugWindow', 'width=600,height=500,menubar=no,resizable=yes,scrollbars=yes,location=no,status=no,toolbar=no,directories=no' );
				if (!Debug.win) return alert("Failed to open window.  Popup blocker maybe?");
				
				var doc = Debug.win.document;
				doc.open();
				doc.writeln( '<html><head><title>Debug Console</title></head><body onLoad="window.opener.Debug.refresh_console()">' );
				doc.writeln( '<div id="d_debug_log"></div>' );
				doc.writeln( '<hr/>' );
				doc.writeln( '<form action="javascript:void(window.opener.Debug.console_execute())" style="margin:0; padding:0;"><table width="100%"><tr>' );
				doc.writeln( '<td width="*"><input type="text" id="fe_command" style="width:100%;"/></td>' );
				doc.writeln( '<td width="50"><input type=button value="Clear" onClick="document.getElementById(\'d_debug_log\').innerHTML = \'\';"/></td>' );
				doc.writeln( '</tr></table></form>' );
				doc.writeln( '</body></html>' );
				doc.close();
			}
			Debug.win.focus();
		},
		
		console_execute: function() {
			// execute command from console window
			var cmd = Debug.win.document.getElementById('fe_command');
			if (cmd.value.length) {
				Debug.trace( 'console', cmd.value );
				try {
					Debug.trace( 'console', '' + eval(cmd.value) );
				}
				catch (e) {
					Debug.trace( 'error', 'JavaScript Interpreter Exception: ' + e.toString() );
				}
				// cmd.value = '';
			}
		},
		
		get_time_stamp: function(now) {
			// get time stamp given epoch, in the following format: HH:MI:SS.SSS
			var date = new Date( now * 1000 );
			/*var yyyy = date.getFullYear();
			var mm = date.getMonth() + 1; if (mm < 10) mm = "0" + mm;
			var dd = date.getDate(); if (dd < 10) dd = "0" + dd;*/
			var hh = date.getHours(); if (hh < 10) hh = "0" + hh;
			var mi = date.getMinutes(); if (mi < 10) mi = "0" + mi;
			var ss = date.getSeconds(); if (ss < 10) ss = "0" + ss;
			var sss = '' + date.getMilliseconds(); while (sss.length < 3) sss = "0" + sss;
			return '' + hh + ':' + mi + ':' + ss + '.' + sss;
		},
		
		refresh_console: function() {
			// flush buffer to console window
			if (!Debug.win || Debug.win.closed) return;
			
			// var div = Debug.win.document.getElementsByTagName('body')[0];
			var div = Debug.win.document.getElementById('d_debug_log');
			if (div) {
				var row = null;

				while ( row = Debug.buffer.shift() ) {
					var time_stamp = Debug.get_time_stamp(row.time);

					var msg = row.msg;
					msg = msg.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
					// msg = msg.replace(/ /g, "&nbsp;");
					msg = msg.replace(/</g, "&lt;");
					msg = msg.replace(/>/g, "&gt;");
					msg = msg.replace(/\n/g, "<br>\n");

					var html = '';
					var sty = 'float:left; font-family: Consolas, Courier, mono; font-size: 12px; cursor:default; margin-right:10px; margin-bottom:1px; padding:2px;';
					// html += '<nobr>';
					html += '<div style="'+sty+' background-color:#eee;">' + time_stamp + '</div>';
					html += '<div style="'+sty+' background-color:#eee; width:60px; overflow:hidden;">' + row.cat + '</div>';
					html += '<div style="'+sty+' background-color:#fff; word-break:break-all;">' + msg + '</div>';
					// html += '</nobr>';
					html += '<br clear="all"/>';

					var chunk = Debug.win.document.createElement('DIV');
					chunk.style['float'] = 'none';
					chunk.innerHTML = html;
					div.appendChild(chunk);
				}
				
				var cmd = Debug.win.document.getElementById('fe_command');
				cmd.focus();
			} // found div
			
			Debug.dirty = 0;
			Debug.win.scrollTo(0, 99999);
		},
		
		hires_time_now: function() {
			// return the Epoch seconds for like right now
			var now = new Date();
			return ( now.getTime() / 1000 );
		},
		
		trace: function(cat, msg) {
			// log entry to debug console
			if (!Debug.enabled) return;
			
			if (arguments.length == 1) {
				msg = cat;
				cat = 'debug';
			}
			
			if (Debug.categories.all || Debug.categories[cat]) {
				Debug.buffer.push({ cat: cat, msg: msg, time: Debug.hires_time_now() });
				if (Debug.buffer.length > Debug.max_rows) Debug.buffer.shift();

				if (!Debug.dirty) {
					Debug.dirty = 1; // flag for display
					setTimeout( function() { Debug.refresh_console(); }, 1 );
				}
			}
		}
		
	} // static
	
} ); // class Debug

Debug.init();

if (!window.Debug) window.Debug = Debug;

// augment some classes for debugging utilities

SpritePlane.prototype.dump = function() {
	Debug.trace( 'SpritePlane', dumper(this.sprites, 1) );
};

Sprite.prototype.highlight = function() {
	this.style.backgroundColor = 'red';
};

Sprite.prototype.dump = function() {
	Debug.trace( 'Sprite', dumper(this) );
};

