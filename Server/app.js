var superagent = require('superagent');
var charset = require('superagent-charset');
charset(superagent);
var cheerio = require('cheerio');
var express = require('express');
var app = express();

var baseUrl = 'http://www.dbmeinv.com';

function isEmpty(obj){
    for (let i in obj){
        return false;
    }
    return true;
}

app.get('/', function(req, res){
    res.send('<h1>girls now!</h1>');
});

app.get('/tags', function(req, res){
    res.header("Content-Type", "application/json; charset=utf-8");
    superagent.get(baseUrl)
    .charset('utf-8')
    .end(function (err, sres) {
        if (err) {
            console.log('ERR: ' + err);
            return next(err);
        }
        var $ = cheerio.load(sres.text);
        var items = [];
        var t1 = new Date().getTime();
        $('#main .panel-heading ul.nav li a').each(function (idx, element) {
            var $element = $(element);
            var hrefStr = $element.attr('href');
            var cid = hrefStr.match(/cid=(\d)/);
            cid = isEmpty(cid) ? "0" : cid[1];
            items.push({
                title : $element.text(),
                href : hrefStr,
                cid : cid,
            });
        });
        res.send(items);
    });
});

app.get('/girls', function(req, res){
    var cid = req.query.c;
    var page = req.query.p;
    cid = !isEmpty(cid) ? cid : '0';
    page = !isEmpty(page) ? page : '1';
    var route = '/dbgroup/show.htm?cid=' + cid + '&pager_offset=' + page;
    res.header("Content-Type", "application/json; charset=utf-8");
    superagent.get(baseUrl)
    .charset('utf-8')
    .end(function (err, sres) {
        if (err) {
            console.log('ERR: ' + err);
            return next(err);
        }
        var $ = cheerio.load(sres.text);
        var items = [];
        var t1 = new Date().getTime();
        $('#main .panel-body ul.thumbnails li.span3 .img_single a').each(function (idx, element) {
            var $element = $(element);
            var $subElement = $element.find('img.height_min');
            var thumbImgSrc = $subElement.attr('src');
            items.push({
                title : $subElement.attr('title'),
                href : $element.attr('href'),
                largeSrc : isEmpty(thumbImgSrc) ? "" : thumbImgSrc.replace('bmiddle', 'large'),
                thumbSrc : thumbImgSrc,
                smallSrc : isEmpty(thumbImgSrc) ? "" : thumbImgSrc.replace('bmiddle', 'small'),
            });
        });
        res.send(items);
    });
});

//http://www.dbmeinv.com/dbgroup/show.htm?cid=%@&pager_offset=%@
//http://www.dbmeinv.com/?pager_offset=2
//http://ww2.sinaimg.cn/large/0060lm7Tgw1f8kmkawp8zj30dw0dwq4j.jpg
//http://ww2.sinaimg.cn/bmiddle/0060lm7Tgw1f8kmkawp8zj30dw0dwq4j.jpg
//http://ww2.sinaimg.cn/small/0060lm7Tgw1f8kmkawp8zj30dw0dwq4j.jpg

app.listen(3000, function(req, res){
    console.log('server is running on port 3000');
});
