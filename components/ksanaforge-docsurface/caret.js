var hasClass=function (el, selector) {
   var className = " " + selector + " ";
   return (" " + el.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1;
};

var Create=function(_surface) {
	var surface=_surface;
	var caretnode,carettimer,shiftkey;

  var moveCaret=function(domnode) {
    if (!domnode) return; 
    caretnode=domnode;
    var rect=domnode.getBoundingClientRect();
    var caretdiv=surface.refs.caretdiv.getDOMNode();
    var caret=surface.refs.caret.getDOMNode();
    var surfacerect=surface.refs.surface.getDOMNode().getBoundingClientRect();
    caretdiv.style.top=rect.top - surfacerect.height -surfacerect.top;
    caretdiv.style.left=rect.left  -surfacerect.left;
    caretdiv.style.height=rect.height;
    surface.refs.surface.getDOMNode().focus();
    //this.moveInputBox(rect);
  };

  var selstartFromCaret=function() {
    if (!caretnode || !caretnode.attributes['data-n']) return ;
    var len=0;
    var sel=parseInt(caretnode.attributes['data-n'].value);
    if (sel!==surface.props.selstart) {
      if (shiftkey) {
        if (sel>surface.props.selstart) {
          len=sel-surface.props.selstart;
          sel=surface.props.selstart;
        }
      }
    }
    return {start:sel,len:len}
  };
  var updateSelStart=function() {
    if (!carettimer) clearTimeout(carettimer);
    carettimer=setTimeout(function(){
      var sel=selstartFromCaret();
      if (!sel) return;//cannot select last token...
      surface.props.onSelection(sel.start,sel.len);
    },100);
  };


  var beginOfLine=function() {
    var n=caretnode.previousSibling;
    while (n&& !hasClass(n,"br")) {
      if (n.previousSibling) n=n.previousSibling;
      else break;
    }
    return (n.previousSibling==null)?n:n.nextSibling;
  }

  var endOfLine=function() {
    var n=caretnode.nextSibling;
    while (n&& !hasClass(n,"br")) {
      if (n.nextSibling) n=n.nextSibling;
      else break;
    }
    return n;
  }  

  var distance=function(x1,y1,x2,y2) {
    return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
  }
  var moveCaretUp=function() {
    var n=beginOfLine(),ox=caretnode.offsetLeft, oy=caretnode.offsetTop;
    var mindis=100000000, closest=null;
    if (n.previousSibling==null) return;//top line
    n=n.previousSibling;
    while (n) {
      var dis=distance(ox,oy,n.offsetLeft,n.offsetTop);
      if (dis<mindis) {mindis=dis;closest=n;}
      n=n.previousSibling;
    }
    moveCaret(closest);
  };

  var moveCaretDown=function(){
    var n=endOfLine(),ox=caretnode.offsetLeft, oy=caretnode.offsetTop;
    var mindis=100000000, closest=null;
    if (n.nextSibling==null) return;//top line
    n=n.nextSibling;
    while (n) {
      var dis=distance(ox,oy,n.offsetLeft,n.offsetTop);
      if (dis<mindis) {mindis=dis;closest=n;}
      n=n.nextSibling;
    }
    moveCaret(closest);
  };


  var strikeout=function() {
    surface.props.action("strikeout");
  };
  var caretPos=function() {
    var caretpos=0;
    if (surface.props.sellength>0) {
      caretpos=surface.props.selstart+surface.props.sellength;
    } else {
      caretpos=surface.props.selstart;
    }
    return caretpos;
  };

  var inserttext=function(text) {
    var prev=caretPos();
    if (prev===0) return 0;  
    
    moveCaret(caretnode.previousSibling);
    var sel=selstartFromCaret();
    var len=prev-sel.start;
    surface.props.action("inserttext",sel.start,len,text);
  };

  var spacebar=function() {
    moveCaret(caretnode.previousSibling);
    var sel=selstartFromCaret();
    moveCaret(caretnode.nextSibling);

    if (surface.hasMarkupAt(sel.start)) {
      surface.openinlinemenu(sel.start);
    } else {
      inserttext();
    }
  }

	this.keydown=function(e) {
    shiftkey=e.shiftKey;
    var kc=e.keyCode;
    if (kc==37) moveCaret(caretnode.previousSibling);
    else if (kc==39) moveCaret(caretnode.nextSibling);
    else if (kc==40) moveCaretDown();
    else if (kc==38) moveCaretUp();
    else if (kc==46) strikeout();
    else if (kc==36) moveCaret(beginOfLine());
    else if (kc==35) moveCaret(endOfLine());
    else if (kc==32) spacebar();

    updateSelStart();
	}	
  this.show=function() {
    //this.refs.surface.getDOMNode().focus();
    var c=surface.refs.surface.getDOMNode().querySelector(
      'span[data-n="'+(surface.props.selstart+surface.props.sellength)+'"]');
    moveCaret(c);
  }

}

module.exports={Create:Create};