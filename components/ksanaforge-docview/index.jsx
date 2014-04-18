/** @jsx React.DOM */
var surface=require("docsurface"); 
var bootstrap=require("bootstrap");
var cssgen=require("./cssgen");
var docview = React.createClass({

  getInitialState: function() { 
    return {selstart:0, sellength:0};
  },
  contextMenu:function() {
    if (this.props.menu.popup) {
      return this.props.menu.popup({ref:"menu", onPageAction:this.onPageAction});  
    } else {
      return <span></span>
    }    
  },

  onTagSet:function(tagset,uuid) {
    if (!tagset || !tagset.length)return;
    if (JSON.stringify(this.tagset)!=JSON.stringify(tagset)) {
      this.tagset=tagset;
      cssgen.applyStyles(this.props.styles,tagset,"div[data-id='"+uuid+"'] ");
    }
  },
  page:function() {
    return this.props.doc.getPage(this.state.pageid);
  },
  render: function() {
    return (
      <div>
      {this.contextMenu()}
       <surface page={this.props.page}
                menu={this.props.menu}
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
    var func=this.props.page[api];
    if (func) {
      r=func.apply(this.props.page,args);
      var newstart=this.selstart+this.state.sellength;
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
        text:this.props.page.inscription.substr(start,len),
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
        menu.style.top=(y-50)+'px'; //don't know why
      }
    }
    if (this.props.onSelection) {  
      this.props.onSelection( this.onPageAction,start,len,x,y);
    } 
  }
});
module.exports=docview;