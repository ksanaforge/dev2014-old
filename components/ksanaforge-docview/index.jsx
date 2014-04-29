/** @jsx React.DOM */
/*
  maintain selection state of a surface
  context menu
*/
var surface=require("docsurface"); 
var bootstrap=require("bootstrap");
var cssgen=require("./cssgen");
var docview = React.createClass({
  getInitialState: function() { 
    return {selstart:0, sellength:0};
  },
  contextMenu:function() {
    if (this.props.template.contextmenu) {
      return this.props.template.contextmenu(
        {ref:"menu",user:this.props.user, action:this.onAction}
      );  
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

  inserttext:function(start,len,text) {
    var payload={type:"suggest",
                  author:this.props.user.name,
                  text:text,insert:true
                };

    this.props.page.clearMarkups(start,len,this.props.user.name);
    this.props.page.addMarkup(start,len,payload);

    this.setState({selstart:start+len,sellength:0,newMarkupAt:start});
  },
  onAction:function() {
    var args = [],r,username=this.props.user.name;
    var ss=this.state.selstart, sl=this.state.sellength;
    var newstart=this.state.selstart+this.state.sellength;

    Array.prototype.push.apply( args, arguments );
    var action=args.shift();
    if (action=="strikeout") {
      this.props.page.strikeout(ss,sl,username);
    } else if (action=="inserttext") {
      this.inserttext(args[0],args[1],args[2]);
    } else if (action=="addmarkup") {
      var payload=args[0];
      payload.author=this.props.user.name;
      this.props.page.addMarkup(ss,sl,payload); 
      this.setState({selstart:newstart,sellength:0,newMarkupAt:ss});
    } else if (action=="clearmarkup") {
      this.props.page.clearMarkups(ss,sl,username);
      this.setState({selstart:newstart,sellength:0});
    } else {
      return this.props.action.apply(this,arguments);
    }
  },
  closemenu:function() {
    this.refs.menu.getDOMNode().classList.remove("open");
  }, 
  openmenu:function(x,y) {
    if (this.refs.menu) {
      var menu=this.refs.menu.getDOMNode();
      menu.classList.add("open");
      menu.style.left=x+'px';
      menu.style.top=(y-this.getDOMNode().offsetTop)+'px'; 
    }
  },
  onSelection:function(start,len,x,y,e) {
    this.setState({selstart:start,sellength:len});
    if (this.refs.menu && this.refs.menu.onPopup) {
      if (len && e && e.button==2) {
        var context={
          text:this.props.page.inscription.substr(start,len),
          selstart:start,
          sellength:len
        }
        this.refs.menu.onPopup(context); //set menu context
        setTimeout( this.openmenu.bind(this,x,y),200);
      } else {
        this.closemenu();
      }
    }

    if (this.props.onSelection) {  
      this.props.onSelection(start,len,x,y);
    } 
  },
  render: function() {
    return (
      <div> 
      {this.contextMenu()}
       <surface page={this.props.page}
                user={this.props.user}
                action={this.onAction}
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