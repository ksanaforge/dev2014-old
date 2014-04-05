/** @jsx React.DOM */
var kdoc=Require('ksana-document').document;
var surface=Require("docsurface"); 
var $=Require("jquery");
var bootstrap=Require("bootstrap");
var contextmenu=Require("contextmenu");
//var othercomponent=Require("other"); 
var docview = React.createClass({
  getInitialState: function() {
    var D=kdoc.createDocument();
    return {D:D, selstart:0, sellength:0, page:null};
  },
  contextMenu:function() {
    return this.props.menu();
  },
  render: function() {
    return (
      <div>
       <contextmenu ref="menu"/>
       <surface page={this.state.page}
                selstart={this.state.selstart} 
                sellength={this.state.sellength}
                onSelection={this.onSelection}>
       </surface>
      </div>
    );
  },
  onSelection:function(start,len,x,y) {
    this.setState({selstart:start,sellength:len});

    $( this.refs.menu.getDOMNode() ).css({
      left:x,top:y
    }).addClass("open");
  },
  createPage:function() {
    this.setState({page:this.state.D.createPage(this.props.doc.text)});
  },   
  componentDidMount:function() {
    this.createPage();
  }
});
module.exports=docview;