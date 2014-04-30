/** @jsx React.DOM */
var token = React.createClass({
  render:function() {
    var opts={ className:this.props.cls,'data-n':this.props.n}
    if (this.props.appendtext) opts['data-to']=this.props.appendtext;
    return React.DOM.span(opts,this.props.ch);
  } 
});  
var caret=require("./caret");  
var surface = React.createClass({
  componentWillUpdate:function(nextProps,nextState) {
    //close inlinemenu if page change
    if (nextProps.page!=this.props.page) {
      nextState.markup=null;
      nextState.newMarkupAt=-1;
    }
  },
  moveInputBox:function(rect) {
    var inputbox=this.refs.inputbox.getDOMNode();
    var surfacerect=this.refs.surface.getDOMNode().getBoundingClientRect();
    inputbox.focus();
  },
  getSelection:function() {
    var sel = getSelection();
    var range = sel.getRangeAt(0);
    var s=range.startContainer.parentElement;
    var e=range.endContainer.parentElement;
    if (s.nodeName!='SPAN' || e.nodeName!='SPAN') return;
    var start=parseInt(s.getAttribute('data-n'),10);
    var end=parseInt(e.getAttribute('data-n'),10);
    if (start==end && sel.anchorOffset==1) {
      //      this.setState({selstart:start+1,sellength:0});
      return {start:start+s.innerText.length,len:0};
    }
    var length=end-start;
    if (range.endOffset>range.startOffset) length++;
    if (length<0) {
            temp=end; end=start; start=end;
    }
    sel.empty();
    this.refs.surface.getDOMNode().focus();
    return {start:start,len:length};
  },
  openinlinemenu:function(n) {
    var n=parseInt(n);
    var m=this.getMarkups(this.props.page,n);
    if (!m.length || !this.props.template.inlinemenu) return;
    var m=m[0];
    var menu=this.props.template.inlinemenu[m.payload.type];
    if (menu) {
      this.setState({markup:m});
    }
  },
  mousemove:function(e) {
    if (this.state.markup) return;
    if (!e.target.attributes['data-n']) return;
    var n=e.target.attributes['data-n'].value;
    if (n) {
      if (this.inlinemenutimer) {
        clearTimeout(this.inlinemenutimer);
        this.inlinemenutimer=null;
      };
      this.inlinemenutimer=setTimeout(this.openinlinemenu.bind(this,[n]),250);
    } else {
      clearTimeout(this.inlinemenutimer);
    }
  },

  mouseup:function(e) {
    if (this.state.markup) return;

    //if (this.inInlineMenu(e.target))return;
    var sel=this.getSelection();
    if (!sel) return;
    if (e.button==2 && this.props.sellength>0 && //if click inside existing selection
        sel.start>=this.props.selstart && sel.start<=this.props.selstart+this.state.sellength) {
      //reuse , don't change
      sel.start=this.props.selstart;
      sel.len=this.props.sellength;
    } else {
      this.setState({selstart:sel.start,sellength:sel.len});
    }

    if (e.target.getAttribute("class")=="link") {
      var M=this.props.page.markupAt(sel.start);
      if (this.props.onLink) this.props.onLink(M[0].payload);
    } else {  
      this.props.onSelection(sel.start,sel.len,e.pageX,e.pageY,e);
    }
  },
  inlinemenuaction:function() {
    this.props.action.apply(this.props,arguments);
    this.setState({markup:null});
  },
  moveInlineMenu:function() {
    if (!this.state.markup) return;
    var m=this.state.markup;
    var domnode=this.getDOMNode().querySelector('span[data-n="'+m.start+'"]');
    if (!domnode) return;
    var menu=this.refs.inlinemenu.getDOMNode();
    menu.style.left=domnode.offsetLeft - this.getDOMNode().offsetLeft ;
    menu.style.top=domnode.offsetTop - this.getDOMNode().offsetTop + domnode.offsetHeight +5 ;
    menu.style.display='inline';
    
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
  orMarkups:function(m1,m2) { // m1 has higher priority
    var out=[],positions={};
    m1.map(function(m){ positions[m.start]=true});
    for (var i=0;i<m2.length;i++) {
      if (!positions[m2[i].start]) m1.push(m2[i]);
    }
    return m1;
  },
  getMarkups:function(page,offset) {
    var user=this.props.user;
    var M=page.markupAt(offset);
    if (!M.length) return [];
    var out=M.filter(function(e){return e.payload.author==user.name});
    if (user.admin) {
      var merged=M.filter(function(e){return e.payload.author!=user.name});
      if (!this.offsets) this.offsets=this.props.template.tokenize(this.props.page.inscription).offsets;
      out=this.orMarkups(out,page.mergeMarkup(merged,this.offsets));
    }
    return out;
  },
  toXML : function(page,opts) {
    if (!page) return [];
    var res=this.props.template.tokenize(page.inscription)
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
      var M=this.getMarkups(page,offsets[i]);
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
    return xml;
  },  
  render: function() {
    var opts={selstart:this.props.selstart, sellength:this.props.sellength};
    var xml=this.toXML(this.props.page,opts); 
 
    return (
      <div  data-id={this.state.uuid} className="surface">
          {this.addInlinemenu()}
          <div ref="surface" tabIndex="0" 
            onKeyDown={this.caret.keydown} 
            onMouseMove={this.mousemove} 
            onMouseUp={this.mouseup}>{xml}
          </div>
          <div ref="caretdiv" className="surface-caret-container">
             <div ref="caret" className="surface-caret"></div>
          </div>
      </div>
    );
  },
  getInitialState:function() {
    return {uuid:'u'+Math.random().toString().substring(2), markup:null,newMarkupAt:-1};
  },
  componentWillMount:function() {
    this.caret=new caret.Create(this);
  },
  componentDidUpdate:function() {
    if (this.props.scrollto) this.scrollToSelection();
    this.moveInlineMenu();
    if (this.props.newMarkupAt!=this.state.newMarkupAt&&this.props.newMarkupAt>-1) {
      setTimeout(
        this.openinlinemenu.bind(this,this.props.newMarkupAt)
        ,300);
      this.setState({newMarkupAt:this.props.newMarkupAt})
    }
    this.caret.show();
  }


});

module.exports=surface;