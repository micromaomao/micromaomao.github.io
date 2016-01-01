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
                e.animate({opacity: 1, paddingLeft: tas[n%tas.length] + "rem", marginLeft: 0, borderLeftWidth: "0.2rem"}, 300 + n*150);
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
            pageload();
        }, "text");
        if(location.hash != "")
            setTimeout(function() {
                hl($(location.hash));
            }, 100);
    };
    pageload = function() {
        $('.viewsource').attr({
            href: "https://github.com/micromaomao/micromaomao.github.io/blob/master" + location.pathname,
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
