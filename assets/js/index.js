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
        this.fetchAllPeriods(true)
    },
    fetchAllPeriods: function(isInitial){
        var self = this
        $.hkAjax('get','/periods',{
        },function(res){
            console.log(res)
            self.sortByTimestamp(res)
            self.renderPeriodList(res)
            if(isInitial){
                self.clickStatusEvent()
                self.initBodyEvent()
                self.newPeriodBtnEvent()
            }
        })
    },
    newPeriodBtnEvent: function(){
        var self = this
        $('.new-period-btn').on('click',function(){
            var startDate = $(this).siblings("input[name='" + "new-period-start" + "']").val()
            var endDate = $(this).siblings("input[name='" + "new-period-end" + "']").val()

            if(self.checkDate(startDate,endDate)){

                self.postNewPeriod(startDate,endDate)

            }

        })
    },
    checkDate: function(startDate,endDate){
        if(!startDate || startDate.trim() == '') {
            alert('请输入开始日期')
            return false
        }
        if(!endDate || endDate.trim() == '') {
            alert('请输入结束日期')
            return false
        }
        return true
    },
    initBodyEvent: function(){
        $('.period-wrapper').click(function(){
            // return false;
        })
        document.body.addEventListener('click',function(){
            $('.dropdown-menu').hide();
        },true)
    },
    clickStatusEvent: function(){
        var self = this
        //note click
        $periodWrapper.on('click','.result span',function(){
            var $this = $(this)
            var noteId = $(this).parent().attr('data-noteid')
            //toggle class
            var toggleClass = function(){
                $this.addClass('active').siblings().removeClass('active')
            }

            if($this.hasClass('pending')){
                self.postNoteResultClick(noteId,2,toggleClass)

            }else if($this.hasClass('success')){
                self.postNoteResultClick(noteId,1,toggleClass)

            }else if($this.hasClass('fail')){
                self.postNoteResultClick(noteId,0,toggleClass)

            }else{
                throw new Error('result click exception!')
            }
        }).on('click','.new-todo-btn',function(){
            var periodId = $(this).attr('data-periodid')
            self.addNewTodo(periodId)
        }).on('click','.new-diary-btn',function(){
            var periodId = $(this).attr('data-periodid')
            self.addNewDiary(periodId)
        }).on('click','.icon-config',function(){
            var noteId = $(this).attr('data-noteid')
            $('.dropdown-menu').hide()
            var $dropdownMenu = $(this).siblings('.dropdown-menu').show()

        }).on('click','.todolist .dropdown-menu .del',function(){
            $(this).parent().hide()
            var noteId = $(this).attr('data-noteid')
            self.deleteTodo(noteId)
        }).on('click','.diarylist .dropdown-menu .del',function(){
            $(this).parent().hide()
            var diaryId = $(this).attr('data-diaryid')
            self.deleteDiary(diaryId)
        }).on('click','.todolist .dropdown-menu .rename',function(){

            var noteId = $(this).attr('data-noteid')
            var $crtItem = $(this).parent().parent().parent();
            var $editable = $crtItem.find('.editable');
            var $nonEditable = $crtItem.find('.non-editable');

            setTimeout(function(){
                $editable.find('input').select();
                $editable.find('input').focus();
            },100)

            $nonEditable.hide();
            $editable.show();

            $editable.find('input').off('blur')
            $editable.find('input').on('blur',function(){
                $nonEditable.html($(this).val()).show();
                $editable.hide();
                var name = $(this).val();
                self.renameTodo(noteId,name);
            })
        }).on('click','.period .period-del-btn',function(){
            var periodId = $(this).attr('data-periodid')
            self.deletePeriod(periodId)
        }).on('click','.period .period-update-btn',function(){
            var periodId = $(this).attr('data-periodid')

            var startDate = $(this).siblings("input[name='" + "period-start" + "']").val()

            var endDate = $(this).siblings("input[name='" + "period-end" + "']").val()

            if(self.checkDate(startDate,endDate)){
                self.updatePeriod(periodId,startDate,endDate)
            }

        })
    },
    addNewTodo: function(periodId){
        var self = this
        var $todolist = $(".todolist[data-periodid='" + periodId +"']")
        var data = {
            'title' : 'title',
            'result' : 2
        }
        var todoItemHTML = template('tpl-todo-item',data)
        $todolist.append(todoItemHTML)
        var $lastChild = $todolist.children().last();
        //auto focus
        $lastChild.find('.non-editable').hide().end().find('.editable').show().find('input').select();

        //onblur
        $lastChild.find('input').on('blur',function(){
            $lastChild.find('.non-editable').html($(this).val()).show().end().find('.editable').hide()

            var title = $(this).val()
            var params = {
                title : title,
                periodId : periodId
            }
            self.postNewTodo(params)
        })
    },
    addNewDiary: function(periodId){
        var self = this
        var $diarylist = $(".diarylist[data-periodid='" + periodId +"']")
        var data = {
            'title' : 'title',
        }
        var diaryItemHTML = template('tpl-diary-item',data)
        $diarylist.append(diaryItemHTML)
        var $lastChild = $diarylist.children().last()

        //auto focus
        $lastChild.find('.non-editable').hide().end().find('.editable').show().find('input').select();

        // onblur
        $lastChild.find('input').on('blur',function(){
            $lastChild.find('.non-editable').html($(this).val()).show().end().find('.editable').hide()

            var title = $(this).val()
            var params = {
                title : title,
                periodId : periodId
            }
            self.postNewDiary(params)
        })

    },
    postNewPeriod: function(startDate,endDate){
        var self = this
        $.hkAjax('post','/periods/addperiod',{
            startDate : startDate,
            endDate : endDate
        },function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
        },'text')
    },
    postNewTodo: function(params){
        var self = this
        $.hkAjax('post','/notes/addnote',params,function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
        },'text')
    },
    postNewDiary: function(params){
        var self = this
        $.hkAjax('post','/diaries/adddiary',params,function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
        },'text')
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
    updatePeriod: function(periodId,startDate,endDate){
        var self = this
        $.hkAjax('post','/periods/updateperiod',{
            periodId : periodId,
            startDate : startDate,
            endDate : endDate
        },function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
        },'text')
    },
    deletePeriod: function(periodId){
        var self = this
        $.hkAjax('post','/periods/deleteperiod',{
            periodId : periodId
        },function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
        },'text')
    },
    deleteTodo: function(noteId){
        var self = this
        $.hkAjax('post','/notes/deletenote',{
            noteId : noteId
        },function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
        },'text')
    },
    deleteDiary: function(diaryId){
        var self = this
        $.hkAjax('post','/diaries/deletediary',{
            diaryId : diaryId
        },function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
        },'text')
    },
    renameTodo: function(noteId,name){
        var self = this
        $.hkAjax('post','/notes/renamenote',{
            noteId : noteId,
            title : name
        },function(res){
            $.hkPopupTip(res,2000)
            self.fetchAllPeriods()
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
        this.formatDate(res)
        var periodListHTML = template('tpl-period-list',res)
        $periodWrapper.html(periodListHTML)
    },

    initGloDOMs: function(){
        $main = $('main')
        $periodWrapper = $main.find('.period-wrapper')
    },

    formatDate: function(res){
        if(res && res.periods){
            var len = res.periods.length;
            for(var i = 0;i < len;i++){
                res.periods[i].startedDate =
                    this.getDateByTimeStamp(res.periods[i].startedDate)

                res.periods[i].endedDate =
                    this.getDateByTimeStamp(res.periods[i].endedDate)

                if(res.periods[i].diaries && res.periods[i].diaries.length > 0){
                    var length = res.periods[i].diaries.length
                    for(var k = 0;k < length; k++){
                        res.periods[i].diaries[k].createdDate =
                        this.getDateByTimeStampWithDash(res.periods[i].diaries[k].createdDate)
                    }
                }
            }
        }
    },

    getDateByTimeStamp: function(timestamp){
        var timestamp = parseInt(timestamp);
        timestamp = isNaN(timestamp) ? 0 : timestamp;
        var datetime = new Date(timestamp);
        var year = datetime.getFullYear();
        var month = this.twoDigits(datetime.getMonth() + 1);
        var date = this.twoDigits(datetime.getDate());
        return year + '-' + month + '-' + date;
    },
    getDateByTimeStampWithDash: function(timestamp){
        var timestamp = parseInt(timestamp);
        timestamp = isNaN(timestamp) ? 0 : timestamp;
        var datetime = new Date(timestamp);
        var year = datetime.getFullYear();
        var month = this.twoDigits(datetime.getMonth() + 1);
        var date = this.twoDigits(datetime.getDate());
        var h = this.twoDigits(datetime.getHours());
        var mm = this.twoDigits(datetime.getMinutes());
        var s = this.twoDigits(datetime.getSeconds());
        return year + '-' + month + '-' + date + ' ' + h + ':' + mm + ':' +s;
    },
    twoDigits: function(number){
        return number >= 10 ? number : '0' + number;
    },
};

Object.defineProperty(Index.prototype, 'constructor', {
    enumerable: false,
    value: Index
});

$(function() {
    new Index();
});




