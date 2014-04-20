/** @jsx React.DOM */
var bootstrap=Require('bootstrap');
if (typeof $ =='undefined') $=Require('jquery');

var Tabui = React.createClass({
  getInitialState:function(){
    return {
      tabs: this.props.tabs||[],
    }
  },
 
  tabnav:function(T) {
    var closebutton=(T.notclosable)?"":
       <button className="close" type="button" onClick={this.closeTab}>
       {String.fromCharCode(0xd7)}
       </button>;
    return (
      <li ref={T.id} key={"N"+T.id}>
        <a data-id={T.id} data-target={"[data-id='C-"+T.id+"']"} 
          onClick={this.clickTab} href="#">{T.caption}{closebutton}
        </a>
      </li>
    )
  },
  tabcontent:function(T) {
    return <div key={"C"+T.id} data-id={"C-"+T.id} className={"tab-pane"}>{T.content(T.params)}</div>
  },

  render:function() {
    var tabnav=this.tabnav, tabcontent=this.tabcontent;
    return (
    <div>
      <ul className="nav nav-tabs">
      { this.state.tabs.map(function(T){return tabnav(T) })  }
      </ul>
      <div className="tab-content">
      { this.state.tabs.map(function(T){return tabcontent(T) }) }
      </div>
    </div> 
  );
  },
  clickTab:function(e) {
    var anchor=e.target;
    if (anchor.nodeName!=='A') anchor=anchor.parentElement;
    e.preventDefault();

    var id=anchor.attributes['data-id'].value;
    this.goTab(id);
  },
  goTab:function(id) {
    $(this.refs[id].getDOMNode()).find("a").tab('show');
  },
  goActiveTab:function() {
    var goTab=this.goTab;
    var t=this.state.tabs.some(function(T){ 
      return T.active?goTab(T.id):false;
    })
  },
  closeTab:function(e) {
    var anchor=e.target.parentElement;
    var id=anchor.attributes['data-id'].value;
    var tabs=this.state.tabs;
    for (var i in tabs) {
      if (tabs[i].id==id) {
        tabs.splice(i,1);
        this.setState({"tabs":tabs});
        break;
      }
    }
  }, 
  newTab:function(T,idx) {
    tabs=this.state.tabs;
    idx=idx||tabs.length;
    var tabexists=false;
    for (var i in tabs) {
      if (tabs[i].id==T.id) {
        T.active=true;
        tabs[i]=T;
        tabexists=true;
      } else {
        tabs[i].active=false;  
      }
    }
    if (!tabexists) tabs.splice(idx,0,T);
    this.setState({"tabs":tabs});
  },
  componentDidMount:function() {
    this.goActiveTab()
  },
  componentDidUpdate:function() {
    this.goActiveTab()
  }
});

module.exports=Tabui;