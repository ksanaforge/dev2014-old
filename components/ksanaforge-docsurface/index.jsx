/** @jsx React.DOM */
var token = React.createClass({
  render:function() {
    var opts={ className:this.props.cls,'data-n':this.props.n}
    if (this.props.appendtext) opts['data-to']=this.props.appendtext;
    return React.DOM.span(opts,this.props.ch);
  }
});
var surface = React.createClass({
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
      
      return {start:start+1,len:0};
    }
    var length=end-start+1  ;
    if (length<0) {
            temp=end; end=start; start=end;
    }
    //this.setState({selstart:start,sellength:length});
    //this.props.onSelection(start,length);
    sel.empty();
    this.refs.surface.getDOMNode().focus();
    return {start:start,len:length};
  },
  openinlinemenu:function(n) {
    var n=parseInt(n);
    var m=this.props.page.markupAt(n);
    if (!m.length) return;
    var m=m[0];
    var menu=this.props.menu.inline[m.payload.type];
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
    if (e.target.getAttribute("class")=="link") {
      var M=this.props.page.markupAt(sel.start);
      if (this.props.onLink) this.props.onLink(M[0].payload);
    } else {
      this.props.onSelection(sel.start,sel.len,e.pageX,e.pageY);
    }
  },
  inlinemenuaction:function() {
    console.log("menuaction");
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
    if (!this.props.menu||!this.props.menu.inline)return;
    if (!this.state.markup) return <span></span>;

    var m=this.state.markup;
    var text=this.props.page.inscription.substr(m.start,m.len);
    var menu=this.props.menu.inline[m.payload.type];
    if (menu) {
      return (
      <span ref="inlinemenu" className="inlinemenu">
        {menu({action:this.inlinemenuaction,text:text,markup:m.payload})}
      </span>
      );
    }
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
  tokenize:function(text) {
    var tokenizers=Require("ksana-document").tokenizers;
    var tokenizer= tokenizers[this.props.tokenizer||"simple"];
    return tokenizer(text);
  }, 
  toXML : function(page,opts) {
    if (!page) return [];
    var res=this.tokenize(page.inscription)
    var TK=res.tokens;
    var offsets=res.offsets;
    var skips=res.skips;
    if (!TK || !TK.length) return [] ;
    var xml=[];
    var tagset={};//tags used in the page, comma to seperate overlap tag 
    var selstart=opts.selstart||0,sellength=opts.sellength||0;
    
    for (var i=0;i<TK.length;i++) {
      var tk=TK[i];
      var classes="",extraclass="";
      var markupclasses=[],appendtext="";
      var M=page.markupAt(offsets[i]);
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
        if (M[j].start+M[j].len==offsets[i]+1 && !skips[i]) {
          markupclasses.push(M[j].payload.type+"_e");
        }
        /*
        if (M[j].start+M[j].len==i+1) { //last token
          var text=page.inscription.substr(M[j].start,M[j].len);
          inlinemenu=this.addInlinemenu(M[j],text);
        }
        */

        //append text
        if (M[j].payload.selected && !skips[i]) {
          appendtext=M[j].payload.choices[M[j].payload.selected-1].text;
          var insert=M[j].payload.choices[M[j].payload.selected-1].insert;
          if (!insert) extraclass+=" remove";
          if (M[j].start+M[j].len!=offsets[i]+1) appendtext=""; //only put on last token
        }

        if (typeof M[j].payload.text!='undefined'  && !skips[i]) {
          appendtext=M[j].payload.text;
          var insert=M[j].payload.insert;
          if (!insert) extraclass+=" remove";
          if (M[j].start+M[j].len!=offsets[i]+1) appendtext=""; //only put on last token 
        }
      }  

      markupclasses.sort();
      if (M[j]==this.state.markup && this.state.markup) {
        extraclass+=" menuopened "; 
      }     
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
          <div ref="surface" tabIndex="0" onMouseMove={this.mousemove} onMouseUp={this.mouseup}>{xml}</div>
      </div>
    );
  },
  getInitialState:function() {
    return {uuid:'u'+Math.random().toString().substring(2), markup:null,newMarkupAt:-1};
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
  }
});

module.exports=surface;