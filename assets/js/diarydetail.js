/*
 * theme : 首页
 * author: huke
 * date  : 20161003
 *
 */

function Diarydetail() {
    if (!(this instanceof Diarydetail)) {
        return new Diarydetail();
    }
    this.init();
}

Diarydetail.prototype = {
    diaryId : $.getUrlPara('diaryId'),
    diaryObj : {},
    init: function(){
        this.fetchDiary()
        this.initDOMs()
        this.listenEscPress()
        this.editClickEvent()
        this.saveClickEvent()
    },
    initDOMs: function(){
        $title = $('input')
        $content = $('textarea')
        $saveTip = $('.saved-tip')
    },
    fetchDiary: function(){
        var self = this
        $.hkAjax('get','/diaries/getdiary',{
            diaryId : self.diaryId
        },function(res){
            self.diaryObj.diaryId = res.diaryId
            self.diaryObj.title = res.title
            self.diaryObj.content = res.content
            self.renderText(res)
        })
    },
    renderText: function(res){
        console.log(res)
        $title.val(res.title)
        $content.val(res.content)
        this.listenTypeEvent()
        this.setTabEvent()
    },
    listenTypeEvent: function(){
        var self = this
        $title.donetyping(function(){
            self.diaryObj.title = $(this).val()
            if(!$(this)[0].hasAttribute('readonly'))
                self.updateDiary(self.diaryObj)
        },500)

        $content.donetyping(function(){
            self.diaryObj.content = $(this).val()
            if(!$(this)[0].hasAttribute('readonly'))
                self.updateDiary(self.diaryObj)
        },500)
    },
    updateDiary: function(diaryObj){
        var self = this
        $.hkAjax('post','/diaries/updatediary',{
            diaryId : diaryObj.diaryId,
            title : diaryObj.title,
            content : diaryObj.content
        },function(res){
            self.fetchDiary()
            $saveTip.slideDown()
            setTimeout(function(){
                $saveTip.slideUp()
            },800)
        },'text')
    },
    editClickEvent: function(){
        $('.edit').click(function(){
            $title.removeAttr('readonly')
            $content.removeAttr('readonly')
        })
    },
    saveClickEvent: function(){
        var self = this
        $('.save').click(function(){
            $title.attr('readonly',true)
            $content.attr('readonly',true)
            self.updateDiary(self.diaryObj)
        })
    },
    setTabEvent: function(){
        $content.keydown(function(e) {
            if(e.keyCode === 9) { // tab was pressed
                // get caret position/selection
                var start = this.selectionStart;
                var end = this.selectionEnd;
                console.log(start,end)

                var $this = $(this);
                var value = $this.val();

                // set textarea value to: text before caret + tab + text after caret
                $this.val(value.substring(0, start)
                            + "\t"
                            + value.substring(end));

                // put caret at right position again (add one for the tab)
                this.selectionStart = this.selectionEnd = start + 1;

                // prevent the focus lose
                e.preventDefault();
            }
        });
    },
    listenEscPress: function(){
        var self = this
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { // escape key maps to keycode `27`
                window.location.href = '/index.html'
            }
        });
    }
};

Object.defineProperty(Diarydetail.prototype, 'constructor', {
    enumerable: false,
    value: Diarydetail
});

$(function() {
    new Diarydetail();
});




