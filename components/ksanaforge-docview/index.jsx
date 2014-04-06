/** @jsx React.DOM */
var kdoc=Require('ksana-document').document;
var surface=require("docsurface"); 
var bootstrap=require("bootstrap");
var cssgen=require("./cssgen");
var docview = React.createClass({

  getInitialState: function() { 
    var D=kdoc.createDocument();
    return {D:D, selstart:0, sellength:0, page:null};
  },
  contextMenu:function() {
    if (this.props.menu) {
      return this.props.menu({ref:"menu", onPageAction:this.onPageAction});  
    } else {
      return <span></span>
    }    
  },
  onTagSet:function(tagset,uuid) {
    if (!tagset || !tagset.length)return;
    if (!this.state.page)return;
    if (JSON.stringify(this.tagset)!=JSON.stringify(tagset)) {
      this.tagset=tagset;
      cssgen.applyStyles(this.props.styles,tagset,"div[data-id='"+uuid+"'] ");
    }
  },
  render: function() {
    return (
      <div>
      {this.contextMenu()}
       <surface page={this.state.page}
                selstart={this.state.selstart} 
                sellength={this.state.sellength}
                onTagSet={this.onTagSet}
                onSelection={this.onSelection}>
       </surface>
      </div>
    );
  },
  onPageAction:function() {
    var args = [],r;
    Array.prototype.push.apply( args, arguments );
    var api=args.shift();
    var func=this.state.page[api];
    if (func) {
      r=func.apply(this.state.page,args);
      var newstart=this.state.selstart+this.state.sellength;
      this.setState({selstart:newstart,sellength:0});  
    } else {
      console.error("cannot find function ",api);
    }
    return r;
  },
  onSelection:function(start,len,x,y) {
    this.setState({selstart:start,sellength:len});
    if (this.props.menu && this.refs.menu.onPopup) {
      var context={
        text:this.state.page.inscription.substr(start,len),
        selstart:start,
        sellength:len
      }
      this.refs.menu.onPopup(context);
    }
    if (len) {
      if (this.props.menu) {
        var menu=this.refs.menu.getDOMNode();
        menu.classList.add("open");
        menu.style.left=x+'px';
        menu.style.top=y+'px';
      }
    }
    if (this.props.onSelection) {  
      this.props.onSelection( this.onPageAction,start,len,x,y);
    } 
  },
  createPage:function() {
    this.setState({page:this.state.D.createPage(this.props.doc)});
  },   
  componentDidMount:function() {
    this.createPage();
  }
});
module.exports=docview;