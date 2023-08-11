import{a as J}from"./chunk-HWIE4MBK.js";import{b as V,c as ee}from"./chunk-X5OQPEMW.js";var N=V((re,O)=>{var te=typeof window<"u"?window:typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?self:{};var s=function(o){var d=/(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,f=0,F={},i={manual:o.Prism&&o.Prism.manual,disableWorkerMessageHandler:o.Prism&&o.Prism.disableWorkerMessageHandler,util:{encode:function t(e){return e instanceof m?new m(e.type,t(e.content),e.alias):Array.isArray(e)?e.map(t):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(t){return Object.prototype.toString.call(t).slice(8,-1)},objId:function(t){return t.__id||Object.defineProperty(t,"__id",{value:++f}),t.__id},clone:function t(e,a){a=a||{};var n,r;switch(i.util.type(e)){case"Object":if(r=i.util.objId(e),a[r])return a[r];n={},a[r]=n;for(var l in e)e.hasOwnProperty(l)&&(n[l]=t(e[l],a));return n;case"Array":return r=i.util.objId(e),a[r]?a[r]:(n=[],a[r]=n,e.forEach(function(g,u){n[u]=t(g,a)}),n);default:return e}},getLanguage:function(t){for(;t;){var e=d.exec(t.className);if(e)return e[1].toLowerCase();t=t.parentElement}return"none"},setLanguage:function(t,e){t.className=t.className.replace(RegExp(d,"gi"),""),t.classList.add("language-"+e)},currentScript:function(){if(typeof document>"u")return null;if("currentScript"in document&&1<2)return document.currentScript;try{throw new Error}catch(n){var t=(/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(n.stack)||[])[1];if(t){var e=document.getElementsByTagName("script");for(var a in e)if(e[a].src==t)return e[a]}return null}},isActive:function(t,e,a){for(var n="no-"+e;t;){var r=t.classList;if(r.contains(e))return!0;if(r.contains(n))return!1;t=t.parentElement}return!!a}},languages:{plain:F,plaintext:F,text:F,txt:F,extend:function(t,e){var a=i.util.clone(i.languages[t]);for(var n in e)a[n]=e[n];return a},insertBefore:function(t,e,a,n){n=n||i.languages;var r=n[t],l={};for(var g in r)if(r.hasOwnProperty(g)){if(g==e)for(var u in a)a.hasOwnProperty(u)&&(l[u]=a[u]);a.hasOwnProperty(g)||(l[g]=r[g])}var p=n[t];return n[t]=l,i.languages.DFS(i.languages,function(y,w){w===p&&y!=t&&(this[y]=l)}),l},DFS:function t(e,a,n,r){r=r||{};var l=i.util.objId;for(var g in e)if(e.hasOwnProperty(g)){a.call(e,g,e[g],n||g);var u=e[g],p=i.util.type(u);p==="Object"&&!r[l(u)]?(r[l(u)]=!0,t(u,a,null,r)):p==="Array"&&!r[l(u)]&&(r[l(u)]=!0,t(u,a,g,r))}}},plugins:{},highlightAll:function(t,e){i.highlightAllUnder(document,t,e)},highlightAllUnder:function(t,e,a){var n={callback:a,container:t,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};i.hooks.run("before-highlightall",n),n.elements=Array.prototype.slice.apply(n.container.querySelectorAll(n.selector)),i.hooks.run("before-all-elements-highlight",n);for(var r=0,l;l=n.elements[r++];)i.highlightElement(l,e===!0,n.callback)},highlightElement:function(t,e,a){var n=i.util.getLanguage(t),r=i.languages[n];i.util.setLanguage(t,n);var l=t.parentElement;l&&l.nodeName.toLowerCase()==="pre"&&i.util.setLanguage(l,n);var g=t.textContent,u={element:t,language:n,grammar:r,code:g};function p(w){u.highlightedCode=w,i.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,i.hooks.run("after-highlight",u),i.hooks.run("complete",u),a&&a.call(u.element)}if(i.hooks.run("before-sanity-check",u),l=u.element.parentElement,l&&l.nodeName.toLowerCase()==="pre"&&!l.hasAttribute("tabindex")&&l.setAttribute("tabindex","0"),!u.code){i.hooks.run("complete",u),a&&a.call(u.element);return}if(i.hooks.run("before-highlight",u),!u.grammar){p(i.util.encode(u.code));return}if(e&&o.Worker){var y=new Worker(i.filename);y.onmessage=function(w){p(w.data)},y.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else p(i.highlight(u.code,u.grammar,u.language))},highlight:function(t,e,a){var n={code:t,grammar:e,language:a};if(i.hooks.run("before-tokenize",n),!n.grammar)throw new Error('The language "'+n.language+'" has no grammar.');return n.tokens=i.tokenize(n.code,n.grammar),i.hooks.run("after-tokenize",n),m.stringify(i.util.encode(n.tokens),n.language)},tokenize:function(t,e){var a=e.rest;if(a){for(var n in a)e[n]=a[n];delete e.rest}var r=new _;return S(r,r.head,t),z(t,r,e,r.head,0),L(r)},hooks:{all:{},add:function(t,e){var a=i.hooks.all;a[t]=a[t]||[],a[t].push(e)},run:function(t,e){var a=i.hooks.all[t];if(!(!a||!a.length))for(var n=0,r;r=a[n++];)r(e)}},Token:m};o.Prism=i;function m(t,e,a,n){this.type=t,this.content=e,this.alias=a,this.length=(n||"").length|0}m.stringify=function t(e,a){if(typeof e=="string")return e;if(Array.isArray(e)){var n="";return e.forEach(function(p){n+=t(p,a)}),n}var r={type:e.type,content:t(e.content,a),tag:"span",classes:["token",e.type],attributes:{},language:a},l=e.alias;l&&(Array.isArray(l)?Array.prototype.push.apply(r.classes,l):r.classes.push(l)),i.hooks.run("wrap",r);var g="";for(var u in r.attributes)g+=" "+u+'="'+(r.attributes[u]||"").replace(/"/g,"&quot;")+'"';return"<"+r.tag+' class="'+r.classes.join(" ")+'"'+g+">"+r.content+"</"+r.tag+">"};function $(t,e,a,n){t.lastIndex=e;var r=t.exec(a);if(r&&n&&r[1]){var l=r[1].length;r.index+=l,r[0]=r[0].slice(l)}return r}function z(t,e,a,n,r,l){for(var g in a)if(!(!a.hasOwnProperty(g)||!a[g])){var u=a[g];u=Array.isArray(u)?u:[u];for(var p=0;p<u.length;++p){if(l&&l.cause==g+","+p)return;var y=u[p],w=y.inside,G=!!y.lookbehind,B=!!y.greedy,X=y.alias;if(B&&!y.pattern.global){var Y=y.pattern.toString().match(/[imsuy]*$/)[0];y.pattern=RegExp(y.pattern.source,Y+"g")}for(var U=y.pattern||y,b=n.next,x=r;b!==e.tail&&!(l&&x>=l.reach);x+=b.value.length,b=b.next){var E=b.value;if(e.length>t.length)return;if(!(E instanceof m)){var j=1,A;if(B){if(A=$(U,x,t,G),!A||A.index>=t.length)break;var M=A.index,K=A.index+A[0].length,k=x;for(k+=b.value.length;M>=k;)b=b.next,k+=b.value.length;if(k-=b.value.length,x=k,b.value instanceof m)continue;for(var C=b;C!==e.tail&&(k<K||typeof C.value=="string");C=C.next)j++,k+=C.value.length;j--,E=t.slice(x,k),A.index-=x}else if(A=$(U,0,E,G),!A)continue;var M=A.index,I=A[0],H=E.slice(0,M),W=E.slice(M+I.length),P=x+E.length;l&&P>l.reach&&(l.reach=P);var D=b.prev;H&&(D=S(e,D,H),x+=H.length),R(e,D,j);var Q=new m(g,w?i.tokenize(I,w):I,X,I);if(b=S(e,D,Q),W&&S(e,b,W),j>1){var Z={cause:g+","+p,reach:P};z(t,e,a,b.prev,x,Z),l&&Z.reach>l.reach&&(l.reach=Z.reach)}}}}}}function _(){var t={value:null,prev:null,next:null},e={value:null,prev:t,next:null};t.next=e,this.head=t,this.tail=e,this.length=0}function S(t,e,a){var n=e.next,r={value:a,prev:e,next:n};return e.next=r,n.prev=r,t.length++,r}function R(t,e,a){for(var n=e.next,r=0;r<a&&n!==t.tail;r++)n=n.next;e.next=n,n.prev=e,t.length-=r}function L(t){for(var e=[],a=t.head.next;a!==t.tail;)e.push(a.value),a=a.next;return e}if(!o.document)return o.addEventListener&&(i.disableWorkerMessageHandler||o.addEventListener("message",function(t){var e=JSON.parse(t.data),a=e.language,n=e.code,r=e.immediateClose;o.postMessage(i.highlight(n,i.languages[a],a)),r&&o.close()},!1)),i;var h=i.util.currentScript();h&&(i.filename=h.src,h.hasAttribute("data-manual")&&(i.manual=!0));function c(){i.manual||i.highlightAll()}if(!i.manual){var v=document.readyState;v==="loading"||v==="interactive"&&h&&h.defer?document.addEventListener("DOMContentLoaded",c):window.requestAnimationFrame?window.requestAnimationFrame(c):window.setTimeout(c,16)}return i}(te);typeof O<"u"&&O.exports&&(O.exports=s);typeof global<"u"&&(global.Prism=s);s.languages.markup={comment:{pattern:/<!--(?:(?!<!--)[\s\S])*?-->/,greedy:!0},prolog:{pattern:/<\?[\s\S]+?\?>/,greedy:!0},doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(^[^\[]*\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/i,name:/[^\s<>'"]+/}},cdata:{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,greedy:!0},tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"special-attr":[],"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},{pattern:/^(\s*)["']|["']$/,lookbehind:!0}]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]};s.languages.markup.tag.inside["attr-value"].inside.entity=s.languages.markup.entity;s.languages.markup.doctype.inside["internal-subset"].inside=s.languages.markup;s.hooks.add("wrap",function(o){o.type==="entity"&&(o.attributes.title=o.content.replace(/&amp;/,"&"))});Object.defineProperty(s.languages.markup.tag,"addInlined",{value:function(d,f){var F={};F["language-"+f]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:s.languages[f]},F.cdata=/^<!\[CDATA\[|\]\]>$/i;var i={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:F}};i["language-"+f]={pattern:/[\s\S]+/,inside:s.languages[f]};var m={};m[d]={pattern:RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,function(){return d}),"i"),lookbehind:!0,greedy:!0,inside:i},s.languages.insertBefore("markup","cdata",m)}});Object.defineProperty(s.languages.markup.tag,"addAttribute",{value:function(o,d){s.languages.markup.tag.inside["special-attr"].push({pattern:RegExp(/(^|["'\s])/.source+"(?:"+o+")"+/\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,"i"),lookbehind:!0,inside:{"attr-name":/^[^\s=]+/,"attr-value":{pattern:/=[\s\S]+/,inside:{value:{pattern:/(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,lookbehind:!0,alias:[d,"language-"+d],inside:s.languages[d]},punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}}}})}});s.languages.html=s.languages.markup;s.languages.mathml=s.languages.markup;s.languages.svg=s.languages.markup;s.languages.xml=s.languages.extend("markup",{});s.languages.ssml=s.languages.xml;s.languages.atom=s.languages.xml;s.languages.rss=s.languages.xml;(function(o){var d=/(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;o.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:RegExp("@[\\w-](?:"+/[^;{\s"']|\s+(?!\s)/.source+"|"+d.source+")*?"+/(?:;|(?=\s*\{))/.source),inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+d.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+d.source+"$"),alias:"url"}}},selector:{pattern:RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|`+d.source+")*(?=\\s*\\{)"),lookbehind:!0},string:{pattern:d,greedy:!0},property:{pattern:/(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,lookbehind:!0},important:/!important\b/i,function:{pattern:/(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,lookbehind:!0},punctuation:/[(){};:,]/},o.languages.css.atrule.inside.rest=o.languages.css;var f=o.languages.markup;f&&(f.tag.addInlined("style","css"),f.tag.addAttribute("style","css"))})(s);s.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0,greedy:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,boolean:/\b(?:false|true)\b/,function:/\b\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/};s.languages.javascript=s.languages.extend("clike",{"class-name":[s.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/});s.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;s.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:s.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:s.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:s.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:s.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:s.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/});s.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:s.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}});s.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}});s.languages.markup&&(s.languages.markup.tag.addInlined("script","javascript"),s.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript"));s.languages.js=s.languages.javascript;(function(){if(typeof s>"u"||typeof document>"u")return;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector);var o="Loading\u2026",d=function(h,c){return"\u2716 Error "+h+" while fetching file: "+c},f="\u2716 Error: File does not exist or is empty",F={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},i="data-src-status",m="loading",$="loaded",z="failed",_="pre[data-src]:not(["+i+'="'+$+'"]):not(['+i+'="'+m+'"])';function S(h,c,v){var t=new XMLHttpRequest;t.open("GET",h,!0),t.onreadystatechange=function(){t.readyState==4&&(t.status<400&&t.responseText?c(t.responseText):t.status>=400?v(d(t.status,t.statusText)):v(f))},t.send(null)}function R(h){var c=/^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(h||"");if(c){var v=Number(c[1]),t=c[2],e=c[3];return t?e?[v,Number(e)]:[v,void 0]:[v,v]}}s.hooks.add("before-highlightall",function(h){h.selector+=", "+_}),s.hooks.add("before-sanity-check",function(h){var c=h.element;if(c.matches(_)){h.code="",c.setAttribute(i,m);var v=c.appendChild(document.createElement("CODE"));v.textContent=o;var t=c.getAttribute("data-src"),e=h.language;if(e==="none"){var a=(/\.(\w+)$/.exec(t)||[,"none"])[1];e=F[a]||a}s.util.setLanguage(v,e),s.util.setLanguage(c,e);var n=s.plugins.autoloader;n&&n.loadLanguages(e),S(t,function(r){c.setAttribute(i,$);var l=R(c.getAttribute("data-range"));if(l){var g=r.split(/\r\n?|\n/g),u=l[0],p=l[1]==null?g.length:l[1];u<0&&(u+=g.length),u=Math.max(0,Math.min(u-1,g.length)),p<0&&(p+=g.length),p=Math.max(0,Math.min(p,g.length)),r=g.slice(u,p).join(`
`),c.hasAttribute("data-start")||c.setAttribute("data-start",String(u+1))}v.textContent=r,s.highlightElement(v)},function(r){c.setAttribute(i,z),v.textContent=r})}}),s.plugins.fileHighlight={highlight:function(c){for(var v=(c||document).querySelectorAll(_),t=0,e;e=v[t++];)s.highlightElement(e)}};var L=!1;s.fileHighlight=function(){L||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),L=!0),s.plugins.fileHighlight.highlight.apply(this,arguments)}})()});var T=ee(N(),1);(function(o){o.languages.typescript=o.languages.extend("javascript",{"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,lookbehind:!0,greedy:!0,inside:null},builtin:/\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/}),o.languages.typescript.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/,/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,/\btype\b(?=\s*(?:[\{*]|$))/),delete o.languages.typescript.parameter,delete o.languages.typescript["literal-property"];var d=o.languages.extend("typescript",{});delete d["class-name"],o.languages.typescript["class-name"].inside=d,o.languages.insertBefore("typescript","function",{decorator:{pattern:/@[$\w\xA0-\uFFFF]+/,inside:{at:{pattern:/^@/,alias:"operator"},function:/^[\s\S]+/}},"generic-function":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,greedy:!0,inside:{function:/^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:d}}}}),o.languages.ts=o.languages.typescript})(Prism);Prism.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}};Prism.languages.webmanifest=Prism.languages.json;T.default.manual=!0;var ae=window.location.origin,ne=window.location.pathname.startsWith("/ts-ast-parser/")?"/ts-ast-parser":"",q=class extends HTMLElement{#e=!1;#t=null;#a=null;static get observedAttributes(){return["src"]}constructor(){super()}connectedCallback(){this.#e||(this.innerHTML=`
                <section class="container">
                    <p class="text-md my-2">
                        Given the following code:
                    </p>

                    <div class="source-code"></div>

                    <p class="text-md my-2">
                        The output information in JSON format will look like:
                    </p>

                    <div class="reflected-output"></div>
                </section>
            `,this.#a=this.querySelector(".source-code"),this.#t=this.querySelector(".reflected-output"),this.#n(),this.#e=!0)}attributeChangedCallback(){this.#e&&this.#n()}#n(){let d=this.getAttribute("src");this.setAttribute("loading",""),fetch(`${ae}${ne}/assets/previews/${d}`).then(f=>f.text()).then(async f=>{let{result:F}=await J(f);return[f,F]}).then(([f,F])=>{let i=JSON.stringify(F.serialize(),null,4),m=T.default.highlight(f,T.default.languages.typescript,"typescript"),$=T.default.highlight(i,T.default.languages.json,"json");this.#a.innerHTML=`<pre class="language-ts"><code class="language-ts">${m}</code></pre>`,this.#t.innerHTML=`<pre class="language-json"><code class="language-json">${$}</code></pre>`,this.removeAttribute("loading")}).catch(f=>{console.error(f)})}};window.customElements.define("preview-component",q);
/*! Bundled license information:

prismjs/prism.js:
  (**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   *)
*/