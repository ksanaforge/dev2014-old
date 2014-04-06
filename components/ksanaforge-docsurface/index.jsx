/** @jsx React.DOM */
var token = React.createClass({
  render:function() {
    if (this.props.replaceto)
          return <span className={this.props.cls} data-to={this.props.replaceto} data-n={this.props.n}>{this.props.ch}</span>;
    else  return <span className={this.props.cls} data-n={this.props.n}>{this.props.ch}</span>;
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
  mouseup:function(e) {
    var sel=this.getSelection();
    if (e.target.getAttribute("class")=="link") {
      var M=this.props.page.markupAt(sel.start);
      if (this.props.onLink) this.props.onLink(M[0].payload);
    } else {
      this.props.onSelection(sel.start,sel.len,e.pageX,e.pageY);
    }
  },
  toXML : function(page,opts) {
    if (!page) return [];
    var I=page.inscription;
    var xml=[];
    var tagset={};//tags used in the page, comma to seperate overlap tag 
    var selstart=opts.selstart||0,sellength=opts.sellength||0;
    
    for (var i=0;i<I.length;i++) {
      var classes="",extraclass="";
      var markupclasses=[];
      var M=page.markupAt(i);
      var R=page.revisionAt(i),replaceto="";
      if (i>=selstart && i<selstart+sellength) extraclass+=' selected';
      if (R.length) {
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
        if (R[0].start!=i)replaceto="";
      }

      //naive solution, need to create many combination class
      //create dynamic stylesheet,concat multiple background image with ,
      for (var j in M) {
        markupclasses.push(M[j].payload.type);
      }

      markupclasses.sort();
      if (markupclasses.length) tagset[markupclasses.join(",")]=true;
      var ch=I[i]; 
      if (ch==="\n") {ch="\u21a9";extraclass+=' br';}
      classes=(extraclass+" "+markupclasses.join("__")).trim();
      xml.push(<token key={i} cls={classes} n={i} ch={ch} replaceto={replaceto}></token>);
    }
    xml.push(<token key={I.length} n={I.length}/>);

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
          <div ref="surface" tabIndex="0" onMouseUp={this.mouseup}>{xml}</div>
      </div>
    );
  },
  getInitialState:function() {
    return {uuid:'u'+Math.random().toString().substring(2)};
  },
  componentDidMount:function() {
   
  },
  componentDidUpdate:function() {
    if (this.props.scrollto) this.scrollToSelection();
  }
});

module.exports=surface;