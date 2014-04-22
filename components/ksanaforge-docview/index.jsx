/** @jsx React.DOM */
var surface=require("docsurface"); 
var bootstrap=require("bootstrap");
var cssgen=require("./cssgen");
var docview = React.createClass({

  getInitialState: function() { 
    return {selstart:0, sellength:0};
  },
  contextMenu:function() {
    if (this.props.template.contextmenu) {
      return this.props.template.contextmenu({ref:"menu", onPageAction:this.onPageAction});  
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


  onPageAction:function() {
    var args = [],r;
    Array.prototype.push.apply( args, arguments );
    var api=args.shift();
    var func=this.props.page[api];
    if (func) {
      r=func.apply(this.props.page,args);
      var newstart=this.state.selstart+this.state.sellength;
      var newmarkupat= (api=="addMarkup")?this.state.selstart:-1;
      this.setState({selstart:newstart,sellength:0,newMarkupAt:newmarkupat});
    } else {
      console.error("cannot find function ",api);
    }
    return r;
  },
  openmenu:function(x,y) {
    if (this.refs.menu) {
      var menu=this.refs.menu.getDOMNode();
      menu.classList.add("open");
      menu.style.left=x+'px';
      menu.style.top=(y-this.getDOMNode().offsetTop)+'px'; 
    }
  },
  onSelection:function(start,len,x,y) {
    this.setState({selstart:start,sellength:len});
    if (this.refs.menu && this.refs.menu.onPopup) {
      var context={
        text:this.props.page.inscription.substr(start,len),
        selstart:start,
        sellength:len
      }
      this.refs.menu.onPopup(context);
    }
    if (len) setTimeout( this.openmenu.bind(this,x,y),200);

    if (this.props.onSelection) {  
      this.props.onSelection( this.onPageAction,start,len,x,y);
    } 
  },
  render: function() {
    return (
      <div>
      {this.contextMenu()}
       <surface page={this.props.page}
                template={this.props.template}
                newMarkupAt={this.state.newMarkupAt}
                selstart={this.state.selstart} 
                sellength={this.state.sellength}
                onTagSet={this.onTagSet}
                onSelection={this.onSelection}>
       </surface>
      </div>
    );
  }
});
module.exports=docview;