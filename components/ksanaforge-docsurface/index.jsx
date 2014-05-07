/** @jsx React.DOM */
var token = React.createClass({
  render:function() {
    var classname=this.props.cls?this.props.cls.trim():"";
    var opts={ 'data-n':this.props.n}
    if (this.props.appendtext) opts['data-to']=this.props.appendtext;
    if (classname) opts.className=classname;
    return React.DOM.span(opts,this.props.ch);
  } 
});       
var caret=require("./caret");  
var surface = React.createClass({
  componentWillUpdate:function(nextProps,nextState) {
    if (nextProps.selstart!=this.props.selstart
      && nextProps.selstart!=this.props.selstart+this.props.sellength) {
      nextState.markup=null;
      this.inlinemenuopened=null;
    } 
  },
  moveInputBox:function(rect) {
    var inputbox=this.refs.inputbox.getDOMNode();
    var surfacerect=this.refs.surface.getDOMNode().getBoundingClientRect();
    inputbox.focus();
  },        
  showinlinemenu:function() {
    if (!this.refs.inlinemenu) return;
    var mm=this.state.markup;
    var domnode=this.getDOMNode().querySelector('span[data-n="'+mm.start+'"]');
    if (!domnode) return;

    var menu=this.refs.inlinemenu.getDOMNode();
    menu.style.left=domnode.offsetLeft - this.getDOMNode().offsetLeft ;
    menu.style.top=domnode.offsetTop - this.getDOMNode().offsetTop + domnode.offsetHeight +5 ;
    menu.style.display='inline';
    this.inlinemenuopened=menu;
  },
  getRange:function() {
    var sel = getSelection();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    var s=range.startContainer.parentElement;
    var e=range.endContainer.parentElement;
    if (s.nodeName!='SPAN' || e.nodeName!='SPAN') return;
    var start=parseInt(s.getAttribute('data-n'),10);
    var end=parseInt(e.getAttribute('data-n'),10);
    return [start,end];
  },
  getSelection:function() {
    R=this.getRange();
    if (!R) return;
    var start=R[0];
    var end=R[1];
    var length=0;
    var sel = getSelection();
    if (!sel.rangeCount) return;
    var range = sel.getRangeAt(0);    
    var s=range.startContainer.parentElement;
    var e=range.startContainer.parentElement;
    var n=e.nextSibling,nextstart=0;
    if (n.nodeName=="SPAN") {
      nextstart=parseInt(n.getAttribute('data-n'),10);  
    }
    var selectionlength=sel.extentOffset-sel.anchorOffset;
    if (start==end && start+selectionlength==nextstart) {//select a token
      length=1;
    } else {
      length=end-start;
      if (length) length++;
      //if (range.endOffset>range.startOffset &&!length) length=1;
      if (length<0) {
          temp=end; end=start; start=end;
      }
    }

    sel.empty();
    this.refs.surface.getDOMNode().focus();
    return {start:start,len:length};
  },
  openinlinemenu:function(n) {
    var n=parseInt(n);
    var m=this.getMarkupsAt(n);
    if (!m.length || !this.props.template.inlinemenu) return;
    var mm=m[0];
    for (var i=1;i<m.length;i++) {
      if (m[i].start==n) mm=m[i];
    }
    
    var menu=this.props.template.inlinemenu[mm.payload.type];
    if (menu) {
      this.setState({markup:mm});
    }
  },
  hasMarkupAt:function(n) {
    return this.getMarkupsAt(n).length>0;
  },
  tokenclicked:function(e) {
    if (!e.target.attributes['data-n']) return;
    var n=e.target.attributes['data-n'].value;
    if (n) {
      this.openinlinemenu(n);
      return true;
    } else return false;
  },
  mouseDown:function(e) {
    if(e.button === 0) this.leftMButtonDown = true;
  },
  mouseMove:function(e) {
    if (!this.leftMButtonDown) return;
    var sel=this.getRange();
    if (!sel) return;
    if (sel[0]!=this.laststart || this.lastend!=sel[1]) {
      this.props.action("makingselection",sel[0],sel[1]);
    }
    this.laststart=sel[0];
    this.lastend=sel[1];
  },
  mouseUp:function(e) {
    this.leftMButtonDown=false;
    if (this.inlinemenuopened) return;

    //if (this.inInlineMenu(e.target))return;
    var sel=this.getSelection();
    if (!sel) return;
    if (sel.len==0 && e.button==0 ) { //use e.target
      var n=e.target.attributes['data-n'];
      if (n) {
        //this.setState({selstart:parseInt(n.value),sellength:0});
        this.props.onSelection(parseInt(n.value),0,e.pageX,e.pageY,e);
        return;
      }
    }
    if (!sel) return;
    if (e.button==2) {
      if (this.props.sellength>0) {
        if (sel.start>=this.props.selstart && sel.start<=this.props.selstart+this.props.sellength) {
          sel.start=this.props.selstart;
          sel.len=this.props.sellength;
        }
      } else if (sel.start>0) {
        sel.len=1;
      }
      //reuse , don't change
    } else {
      //this.setState({selstart:sel.start,sellength:sel.len});
    }

    if (e.target.getAttribute("class")=="link") {
      var M=this.props.page.markupAt(sel.start);
      if (this.props.onLink) this.props.onLink(M[0].payload);
    } else {  
      this.props.onSelection(sel.start,sel.len,e.pageX,e.pageY,e);
    }
  },
  closeinlinemenu:function() {
    if (this.inlinemenuopened) {
      this.inlinemenuopened.style.display='none';
    }
    this.inlinemenuopened=false;
    this.refs.surface.getDOMNode().focus();
    this.setState({markup:false})
  },
  inlinemenuaction:function() {
    this.props.action.apply(this.props,arguments);
    this.closeinlinemenu();
  },
  addInlinemenu:function() {
    if (!this.props.template.inlinemenu) return null;
    if (!this.state.markup) return null;

    var m=this.state.markup;
    var text=this.props.page.inscription.substr(m.start,m.len);
    var menu=this.props.template.inlinemenu[m.payload.type];
    if (menu) return (
      <span ref="inlinemenu" className="inlinemenu">
        {menu({action:this.inlinemenuaction,text:text,markup:m,
          user:this.props.user})}
      </span>
    );
    return null;
  },
  
  renderRevision:function(R,xml) {
    var extraclass="";
    if (R[0].len===0) {
      extraclass+=" insert"; 
//          replaceto=R[0].payload.text;
      xml.push(<span className={extraclass+" inserttext"}>{R[0].payload.text}</span>);
    } else  {
      if (R[0].payload.text) {
        if (i>=R[0].start && i<R[0].start+R[0].len) extraclass+=" replace"; 
        if (i===R[0].start+R[0].len) {
          xml.push(<span className={extraclass+" replacetext"}>{R[0].payload.text}</span>);
        } 
      }
      else if (i>=R[0].start && i<R[0].start+R[0].len) extraclass+=" delete";  
    }
      //if (R[0].start!=i)replaceto="";
    return extraclass;
  },

  getMarkupsAt:function(offset) {
    return this.props.action("getmarkupsat",offset);
  },
  toXML : function(opts) {
    var page=this.props.page;
    if (!page) return [];
    var inscription=page.inscription;

    var res=this.props.template.tokenize(inscription);
    var TK=res.tokens;
    var offsets=res.offsets;
    if (!TK || !TK.length) return [] ;
    var xml=[];
    var tagset={};//tags used in the page, comma to seperate overlap tag 
    var selstart=opts.selstart||0,sellength=opts.sellength||0;
    
    for (var i=0;i<TK.length;i++) {
      var tk=TK[i];
      var classes="",extraclass="";
      var markupclasses=[],appendtext="";
      var M=this.getMarkupsAt(offsets[i]);
      if (offsets[i]>=selstart && offsets[i]<selstart+sellength) extraclass+=' selected';
      //var R=page.revisionAt(i),
      //if (R.length) extraclass+=this.renderRevision(R[0],xml);

      //naive solution, need to create many combination class
      //create dynamic stylesheet,concat multiple background image with ,
      var inlinemenu=null;      
      for (var j in M) {
        markupclasses.push(M[j].payload.type);
        if (M[j].start==offsets[i]) {
          markupclasses.push(M[j].payload.type+"_b");
        }
        if (M[j].start+M[j].len==offsets[i]+1) {
          markupclasses.push(M[j].payload.type+"_e");
        }
        /*
        if (M[j].start+M[j].len==i+1) { //last token
          var text=page.inscription.substr(M[j].start,M[j].len);
          inlinemenu=this.addInlinemenu(M[j],text);
        }
        */

        //append text
        if (M[j].payload.selected) {
          appendtext=M[j].payload.choices[M[j].payload.selected-1].text;
          var insert=M[j].payload.choices[M[j].payload.selected-1].insert;
          if (!insert) extraclass+=" remove";
          if (M[j].start+M[j].len!=offsets[i]+tk.length) appendtext=""; 
        }

        if (typeof M[j].payload.text!='undefined') {
          appendtext=M[j].payload.text;
          var insert=M[j].payload.insert;
          if (!insert) extraclass+=" remove";
          if (M[j].start+M[j].len!=offsets[i]+tk.length) appendtext=""; 
        }
      }  

      markupclasses.sort();

      if (markupclasses.length) tagset[markupclasses.join(",")]=true;
      var ch=tk;  
      if (ch==="\n") {ch="\u21a9";extraclass+=' br';}
      classes=(markupclasses.join("__")).trim()+" "+extraclass;
      xml.push(token({ key:i , cls:classes ,n:offsets[i],ch:ch, appendtext:appendtext}));
      if (inlinemenu) xml.push(inlinemenu);
    }     
    xml.push(<token key={i} n={offsets[i]}/>);

    if (this.props.onTagSet) {
      this.props.onTagSet(Object.keys(tagset).sort(),this.state.uuid);
    }
    if (this.props.preview && this.props.template.typeset) {
      xml=this.props.template.typeset(xml);
    }    
    return xml;
  },  
  render: function() {
    var opts={selstart:this.props.selstart, sellength:this.props.sellength};
    var xml=this.toXML(opts); 
 
    return (
      <div  data-id={this.state.uuid} className="surface">
          {this.addInlinemenu()}
          <div ref="surface" tabIndex="0" 
            onKeyDown={this.caret.keydown} 
            onClick={this.tokenclicked} 
            onMouseDown={this.mouseDown}
            onMouseUp={this.mouseUp}
            onMouseMove={this.mouseMove}
            >{xml} 
          </div>
          <div ref="caretdiv" className="surface-caret-container">
             <div ref="caret" className="surface-caret"></div>
          </div>
      </div>
    );
  },
  getInitialState:function() {
    return {uuid:'u'+Math.random().toString().substring(2), markup:null};
  },
  componentWillMount:function() {
    this.caret=new caret.Create(this);

  },
  componentDidUpdate:function() {
    if (this.props.scrollto) this.scrollToSelection();
    this.caret.show();
    this.showinlinemenu();
  }
});

module.exports=surface;