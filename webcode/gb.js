(function() {
    var pageload;
    var init = function ($) {
        var docRoot = (function() {
            var eles = $('head script');
            var scp = eles.eq(eles.length - 1).attr('src');
            var sdr = scp.substr(0, scp.lastIndexOf('/')+1) + "../";
            var loc = location.toString();
            var ldr = loc.substr(0, loc.lastIndexOf('/')+1);
            return ldr + sdr;
        })();
        function hl(ele) {
            ele.addClass('hashhi');
            var elof = ele.offset();
            window.scrollTo(elof.left, elof.top);
            ele.css({transform: "scale(1.5)"});
            setTimeout(function() {
                ele.css({transform: "scale(1)"});
            }, 300);
        }
        function praseHtml(html, returnTitle) {
            var v = $('<div />').append(html);
            v.children('meta,script,link').remove();
            var title = v.children('title');
            var tit;
            if(returnTitle)
                tit = title.text();
            title.remove();
            return (returnTitle?[v, tit]:v);
        }
        if(window.history && window.history.pushState) {
            function ld(url, ondone, error) {
                var hash = null;
                var mt;
                if(mt = url.match(/#.+$/)) {
                    hash = mt[0];
                    url = url.substr(0, url.length - hash.length);
                    if(url == "")
                        url = window.location.toString();
                }
                var jd=$('<div style="z-index: 9999999; background-color: rgb(178, 18, 18); position: fixed;'+
                         'left: 0; top: 0; height: 3px; box-shadow: 0 0 4px rgba(178, 18, 18, 0.6); width: 0%;"></div>');
                $('body').append(jd);
                var ds = $('<div class="keepalive" style="z-index: 50; background-color: #fff; opacity: 0; position: fixed; left: 0;'+
                           'right: 0; top: 0; bottom: 0;"></div>');
                $('body').append(ds);
                ds.animate({opacity: 0.5}, 200);
                jd.animate({width: "75%"}, 1000);
                $.ajax(url, {
                    accepts: 'text/html',
                    cache: true,
                    success: function(html) {
                        jd.stop(true,false,false);
                        ds.stop(true,false,false);
                        ds.animate({opacity: 1}, 300);
                        jd.animate({width: "100%", opacity: 0}, 300, function() {
                            jd.remove();
                            ds.stop(true,false,false);
                            ds.animate({opacity: 0}, 200, function() {
                                ds.remove();
                            });
                            var vt = praseHtml(html, true);
                            var v = vt[0];
                            var nc = $('body').children('*').not('.keepalive');
                            if(nc.length > 0) {
                                nc.eq(nc.length - 1).after(v.children('*'))
                                nc.remove();
                            } else {
                                $('body').append(v.children('*'));
                            }
                            bindAs($('body').children('*').not('.keepalive').find('a'));
                            $('.hashhi').removeClass('hashhi');
                            document.title = vt[1];
                            if(hash) {
                                hl($(hash));
                            }
                            ondone();
                        });
                    },
                    dataType: "text",
                    error: function($XHR, textStatus, errorThrown) {
                        error(textStatus, errorThrown);
                        jd.remove();
                        ds.remove();
                    },
                    method: "get"
                });
            }
            $(window).on('popstate', function(evt) {
                var oEvt = evt.originalEvent;
                ld(location.toString(), function() {
                    pageload();
                }, function() {
                    location.reload();
                });
            });
            function bindAs(as) {
                as.each(function(n, e) {
                    e = $(e);
                    if(e.attr('href') && !e.attr('target')) {
                        var url = e.attr('href');
                        function go(evt) {
                            evt.preventDefault();
                            ld(url, function() {
                                try {
                                    history.pushState(null, "", url);
                                    pageload();
                                } catch (e) {
                                    location = url;
                                }
                            }, function() {
                                location = url;
                            });
                        }
                        e.click(go);
                    }
                });
            }
            bindAs($('body').children('*').not('.keepalive').find('a'));
        }

        var ml = $('<div class="keepalive header"></div>');
        function dtr() {
            if($(window).width() < 900) {
                $('body').addClass('small');
                $('body').removeClass('normal');
            } else {
                $('body').removeClass('small');
                $('body').addClass('normal');
            }
        }
        $(window).on('resize', dtr);
        dtr();
        $('body').prepend(ml);
        $.get(docRoot + 'index.html', function(html) {
            var v = praseHtml(html);
            var dc = v.find('.neg');
            ml.append(dc.children('*'));
            var tas = [0.5, 1.5, 1, 2];
            var brd = ["#e08dac", "#6a7fdb", "#57e2e5", "#45cb85"];
            ml.children('h2,h3,h4').each(function(n, e) {
                e = $(e);
                e.css({opacity: 0, paddingLeft: 0, marginLeft: "5rem", borderLeftWidth: 0, borderLeftColor: brd[n%brd.length]});
                setTimeout(function() {
                    e.animate({opacity: 1, paddingLeft: tas[n%tas.length] + "rem", marginLeft: 0, borderLeftWidth: "0.2rem"}, 300);
                }, n*100);
            });
            ml.find('a').each(function(n, e) {
                e = $(e);
                var hr;
                if(hr = e.attr('href')) {
                    if(!hr.match(/^.+:\/\//)) {
                        hr = docRoot + hr;
                        e.attr('href', hr);
                    }
                }
            });
            bindAs(ml.find('a'));
            $.get(docRoot + 'posts.html', function(html) {
                var ss = $('.searchh');
                ss.html('<input type="text" class="searchbox">');
                var box = ss.find('input');
                box.attr('placeholder', "title:filter && tags:blog");
                var postlist = praseHtml(html).find('.postlist');
                var posts = [];
                postlist.find('li.post').each(function(n,e) {
                    e = $(e);
                    var ptObj = new (function() {
                        var na = e.find('.name');
                        this.name = na.text();
                        this.url = docRoot + na.attr('href');
                        this.date = new Date(e.find('.date').text());
                        this.tags = [];
                        // Nicknames for search
                        this["in"] = this.tags
                        this.title = this.name;
                        var th = this;
                        e.find('.tag').each(function(n, te) {
                            te = $(te);
                            th.tags.push(te.text());
                        });
                    })();
                    posts.push(ptObj);
                });
                function praseQuery(queryStr) {
                    // This function interpret the query and return a function for filter.
                    var TOKEN = {
                        EOF: 0,
                        NAME: 1,
                        STRING: 2,
                        TRUE: 3,
                        FALSE: 4,
                        HAVE: 5,
                        LESSTHAN: 6,
                        GREATERTHAN: 7,
                        EQUAL: 8,
                        LB: 9, // (
                        RB: 10, // )
                        NOT: 11,
                        AND: 12,
                        OR: 13,
                        XOR: 14
                    };
                    var tokens = [];
                    var tokenAttrs = [];
                    var pos = 0;
                    function chars(args) {
                        var a = arguments;
                        var p = pos;
                        for(var i = 0; i < a.length; i ++)
                            p += a[i];
                        return function(l) {
                            return queryStr.substr(p, l);
                        };
                    }
                    function char(args) {
                        return chars.apply(null, arguments)(1);
                    }
                    // Split query into tokens.
                    while (pos < queryStr.length) {
                        if(char().match(/^\s$/)) {
                            pos++;
                            continue;
                        }
                        if(chars()(4) == 'true') {
                            pos += 4;
                            tokens.push(TOKEN.TRUE);
                            continue;
                        }
                        if(chars()(5) == 'false') {
                            pos += 5;
                            tokens.push(TOKEN.FALSE);
                            continue;
                        }
                        if(char() == ':') {
                            pos++;
                            tokens.push(TOKEN.HAVE);
                            continue;
                        }
                        if(char() == '<') {
                            pos++;
                            tokens.push(TOKEN.LESSTHAN);
                            continue;
                        }
                        if(char() == '>') {
                            pos++;
                            tokens.push(TOKEN.GREATERTHAN);
                            continue;
                        }
                        if(char() == '=') {
                            pos++;
                            tokens.push(TOKEN.EQUAL);
                            if(char() == '=')
                                pos++;
                            continue;
                        }
                        if(char() == '(') {
                            pos++;
                            tokens.push(TOKEN.LB);
                            continue;
                        }
                        if(char() == ')') {
                            pos++;
                            tokens.push(TOKEN.RB);
                            continue;
                        }
                        if(char() == '!') {
                            pos++;
                            tokens.push(TOKEN.NOT);
                            continue;
                        }
                        if(chars()(2) == '&&') {
                            pos += 2;
                            tokens.push(TOKEN.AND);
                            continue;
                        }
                        if(chars()(2) == '||') {
                            pos += 2;
                            tokens.push(TOKEN.OR);
                            continue;
                        }
                        if(char() == '^') {
                            pos++;
                            tokens.push(TOKEN.XOR);
                            continue;
                        }
                        if(char() == '\'' || char() == '"') {
                            pos++;
                            var str = "";
                            while (char() != '\'' && char() != '"' && pos < queryStr.length) {
                                if (char() != '\\') {
                                    str += char();
                                    pos++;
                                } else {
                                    if(pos + 1 >= queryStr.length) {
                                        str += '\\';
                                        pos++;
                                    } else {
                                        str += char(1);
                                        pos += 2;
                                    }
                                }
                            }
                            if (pos < queryStr.length)
                                pos++;
                            tokenAttrs[tokens.push(TOKEN.STRING) - 1] = str;
                            continue;
                        }
                        var vaildNameChars = /^[a-zA-Z0-9,\-]$/;
                        if(char().match(vaildNameChars)) {
                            var str = char();
                            pos++;
                            while (char().match(vaildNameChars) && pos < queryStr.length) {
                                str += char();
                                pos++;
                            }
                            tokenAttrs[tokens.push(TOKEN.NAME) - 1] = str;
                            continue;
                        }
                        throw "Syntax error: Unexpected character " + char();
                    }
                    tokens.push(TOKEN.EOF);
                    console.log(tokens, tokenAttrs);
                    pos = 0;
                    function token(args) {
                        var a = arguments;
                        var p = pos;
                        for(var i = 0; i < a.length; i ++)
                            p += a[i];
                        return { token: tokens[p], attr: tokenAttrs[p] };
                    }
                    var TREE = {
                        TRUE: 2,
                        FALSE: 3,
                        HAVE: 5,        //
                        LESSTHAN: 6,    // <---
                        GREATERTHAN: 7, // The
                        EQUAL: 8,       // same
                        NOT: 11,        // as
                        AND: 12,        // in
                        OR: 13,         // TOKEN
                        XOR: 14,        //
                        LESSOREQUAL: 15,
                        GREATEROREQUAL: 16
                    };
                    function ternTree() {
                        // Expect a tern, i.e. title:something or date<2016, false and true also count.
                        if(token().token == TOKEN.TRUE) {
                            pos++;
                            return { type: TREE.TRUE };
                        } else if (token().token == TOKEN.FALSE) {
                            pos++;
                            return { type: TREE.FALSE };
                        } else if (token().token == TOKEN.NAME) {
                            var left = token().attr;
                            pos++;
                            var op = token().token;
                            pos++;
                            if (op == TREE.HAVE || op == TREE.LESSTHAN || op == TREE.GREATERTHAN ||
                                op == TREE.EQUAL) {
                                if ((op == TREE.LESSTHAN || op == TREE.GREATERTHAN) && token().token == TOKEN.EQUAL) {
                                    if(op == TREE.LESSTHAN)
                                        op = TREE.LESSOREQUAL;
                                    else
                                        op == TREE.GREATEROREQUAL;
                                    pos++;
                                }
                                if (token().token == TOKEN.NAME || token().token == TOKEN.STRING) {
                                    var right = token().attr;
                                    pos++;
                                    return { type: op, left: left, right: right };
                                } else {
                                    throw "Syntax error: expected string.";
                                }
                            } else {
                                throw "Syntax error: unexpected operator.";
                            }
                        }
                    }
                    function exprTree() {
                        // Expect a expr, i.e. tern && tern or ( tern ) || tern or ! tern.
                        var left, op, right;
                        function tt(l) {
                            if(token().token == TOKEN.LB) {
                                pos++;
                                if(l)
                                    left = exprTree();
                                else
                                    right = exprTree();
                                if(token().token == TOKEN.RB) {
                                    pos++;
                                } else {
                                    throw "Syntax error: expected ).";
                                }
                            } else if (token().token == TOKEN.NOT) {
                                pos++;
                                var tc = {
                                    type: TREE.NOT,
                                    right: exprTree()
                                };
                                if(l)
                                    left = tc;
                                else
                                    right = tc;
                            } else {
                                if(l)
                                    left = ternTree();
                                else
                                    right = exprTree();
                            }
                        }
                        tt(true);
                        if(token().token == TOKEN.AND || token().token == TOKEN.OR ||
                            token().token == TOKEN.XOR) {
                            op = token().token;
                            pos++;
                            tt(false);
                            return { type: op, left: left, right: right };
                        } else {
                            return left;
                        }
                    }
                    var tree = exprTree();
                    console.log(tree);
                    function evaluate(tree, post) {
                        if (tree.type == TREE.TRUE) {
                            return true;
                        } else if (tree.type == TREE.FALSE) {
                            return false;
                        } else if (tree.type == TREE.HAVE) {
                            var finds = tree.right.split(',');
                            var attr = tree.left;
                            var src = post[attr].toString().toLowerCase();
                            for(var i = 0; i < finds.length; i ++) {
                                if (src.indexOf(finds[i].toLowerCase()) == -1)
                                    return false;
                            }
                            return true;
                        } else if (tree.type == TREE.LESSTHAN || tree.type == TREE.GREATERTHAN ||
                                    tree.type == TREE.LESSOREQUAL || tree.type == TREE.GREATEROREQUAL) {
                            var src = new Number(post[tree.left]);
                            var rig = new Number(tree.right);
                            if(isNaN(rig) || isNaN(src)) {
                                rig = new Date(tree.right);
                                src = new Date(post[tree.left]);
                            }
                            switch (tree.type) {
                                case TREE.LESSTHAN:
                                    return src < rig;
                                case TREE.GREATERTHAN:
                                    return src > rig;
                                case TREE.LESSOREQUAL:
                                    return src <= rig;
                                case TREE.GREATEROREQUAL:
                                    return src >= rig;
                                default:
                                    return false;
                            }
                        } else if (tree.type == TREE.EQUAL) {
                            var src = post[tree.left];
                            var rig = tree.right;
                            if (src instanceof Date) {
                                rig = new Date(rig);
                            }
                            return src == rig;
                        } else if (tree.type == TREE.NOT) {
                            return !evaluate(tree.right, post);
                        } else if (tree.type == TREE.AND) {
                            return evaluate(tree.left, post) && evaluate(tree.right, post);
                        } else if (tree.type == TREE.OR) {
                            return evaluate(tree.left, post) || evaluate(tree.right, post);
                        } else if (tree.type == TREE.XOR) {
                            return evaluate(tree.left, post) ^ evaluate(tree.right, post);
                        }
                    };
                    return function(post) {
                        return evaluate(tree, post);
                    };
                }
                var lastQuery = "";
                box.on('change keyup', function () {
                    var query = box.val();
                    if(lastQuery == query)
                        return;
                    lastQuery = query;
                    ss.find('.searchresult').remove();
                    if(query.length == 0)
                        return;
                    var sr = $('<div class="searchresult"></div>');
                    ss.append(sr);
                    try {
                        var qr = praseQuery(query);
                    } catch (e) {
                        sr.text(e.toString());
                        console.error(e);
                        return;
                    }
                    var numRes = 0;
                    for( var i = 0; i < posts.length; i ++ ) {
                        var po = posts[i];
                        var tq;
                        try {
                            tq = qr(po);
                        } catch (e) {
                            sr.text(e.toString());
                            console.error(e);
                            return;
                        }
                        if (!tq) continue;
                        var ptt = $('<a></a>');
                        ptt.text(po.name);
                        ptt.attr('href', po.url);
                        numRes++;
                        sr.append(ptt);
                        ptt.css({opacity: 0.5}).animate({opacity: 1}, 100);
                    }
                    bindAs(sr.find('a'));
                });
                console.log(posts.length + " posts load. Ready for search now...");
            });
            pageload();
        }, "text");
        if(location.hash != "")
            setTimeout(function() {
                hl($(location.hash));
            }, 100);
    };
    pageload = function() {
        $('.viewsource').attr({
            href: "https://github.com/micromaomao/micromaomao.github.io/blob/master" + (location.pathname === '/' ? '/index.html' : location.pathname),
            target: "_blank"
        });
        $('.metadata').remove();
    };
    if(!window.jQuery) {
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js";
        script.async = true;
        document.head.insertBefore(script, document.head.firstChild);
        var rt = setInterval(function() {
            if(window.jQuery) {
                jQuery(function() {
                    init(jQuery);
                });
                clearInterval(rt);
            }
        }, 100);
    } else {
        jQuery(function() {
            init(jQuery);
        });
    }
})();
