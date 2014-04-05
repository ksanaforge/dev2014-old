/** @jsx React.DOM */
var kdoc=Require('ksana-document').document;
var surface=Require("docsurface"); 
var $=Require("jquery");
var bootstrap=Require("bootstrap");
//var othercomponent=Require("other"); 
var docview = React.createClass({
  getInitialState: function() { 
    var D=kdoc.createDocument();
    return {D:D, selstart:0, sellength:0, page:null};
  },
  contextMenu:function() {
    return this.props.menu({ref:"menu", onPageAction:this.onPageAction});
  }, 
  render: function() {
    return (
      <div>
      {this.contextMenu()}
       <surface page={this.state.page}
                selstart={this.state.selstart} 
                sellength={this.state.sellength}
                onSelection={this.onSelection}>
       </surface>
      </div>
    );
  },
  onPageAction:function() {
    var args = [];
    Array.prototype.push.apply( args, arguments );

    var api=args.shift();
    this.state.page[api].apply(this.state.page,args);
    var newstart=this.state.selstart+this.state.sellength;
    this.setState({selstart:newstart,sellength:0});
  },
  onSelection:function(start,len,x,y) {
    this.setState({selstart:start,sellength:len});
    if (this.refs.menu.onPopup) {
      var context={
        text:this.state.page.inscription.substr(start,len),
        selstart:start,
        sellength:len
      }
      this.refs.menu.onPopup(context);
    }
    $(this.refs.menu.getDOMNode()).css({left:x,top:y}).addClass("open");
  },
  createPage:function() {
    this.setState({page:this.state.D.createPage(this.props.doc.text)});
  },   
  componentDidMount:function() {
    this.createPage();
  }
});
module.exports=docview;