/*
 * theme : 首页
 * author: huke
 * date  : 20161003
 *
 */

function Index() {
    if (!(this instanceof Index)) {
        return new Index();
    }
    this.init();
}

Index.prototype = {
    init: function(){
        this.initGloDOMs()
        this.fetchAllPeriods()
    },
    fetchAllPeriods: function(){
        var self = this
        $.hkAjax('get','/periods',{
        },function(res){
            console.log(res)
            self.sortByTimestamp(res)
            self.renderPeriodList(res)
            self.clickEvent()
        })
    },
    clickEvent: function(){
        var self = this
        //note click
        $main.on('click','.result span',function(){
            var $this = $(this)
            var noteId = $(this).parent().attr('data-noteid')
            //toggle class
            var toggleClass = function(){
                $this.addClass('active').siblings().removeClass('active')
            }

            if($this.hasClass('pending')){
                self.postNoteResultClick(noteId,null,toggleClass)

            }else if($this.hasClass('success')){
                self.postNoteResultClick(noteId,true,toggleClass)

            }else if($this.hasClass('fail')){
                self.postNoteResultClick(noteId,false,toggleClass)

            }else{
                throw new Error('result click exception!')
            }
        }).on('click','.new-todo-btn',function(){
            var periodId = $(this).attr('data-periodid')
        }).on('click','.new-diary-btn',function(){
            var periodId = $(this).attr('data-periodid')
        })
    },
    postNoteResultClick: function(noteId,status,callback){
        var self = this
        $.hkAjax('post','/notes/changenotestatus',{
            noteId : noteId,
            status : status
        },function(res){
            $.hkPopupTip(res,2000)
            console.log('post note result click res:',res)
            callback()
        },'text')
    },
    sortByTimestamp: function(res){
        var len = res.periods.length
        for(var i = 0;i < len; i++){
           res.periods[i].notes.sort(function(x, y){
                return y.createdDate - x.createdDate;
            })
        }
    },
    renderPeriodList: function(res){
        var periodListHTML = template('tpl-period-list',res)
        $main.append(periodListHTML)
    },
    initGloDOMs: function(){
        $main = $('main')
    }
};

Object.defineProperty(Index.prototype, 'constructor', {
    enumerable: false,
    value: Index
});

$(function() {
    new Index();
});




