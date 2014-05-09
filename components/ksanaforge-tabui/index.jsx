/** @jsx React.DOM */
var bootstrap=Require('bootstrap');
if (typeof $ =='undefined') $=Require('jquery');
var contentpf="C_";
var Tabui = React.createClass({
  getInitialState:function(){
    return { }
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
    if (T.params) T.params.tab = T;
    return <div ref={contentpf+T.id} key={"C"+T.id} data-id={"C-"+T.id} 
    className={"tab-pane"}>{T.content(T.params)}</div>
  },

  render:function() {
    var tabnav=this.tabnav, tabcontent=this.tabcontent;
    return (
    <div>
      <ul className="nav nav-tabs">
      { this.props.tabs.map(function(T){return tabnav(T) })  }
      </ul>
      <div className="tab-content">
      { this.props.tabs.map(function(T){return tabcontent(T) }) }
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
  goTab:function(id,params) {
    $(this.refs[id].getDOMNode()).find("a").tab('show');
    var activated=this.props.tabs.filter(function(t){return t.id==id});
    if (activated.length && activated[0].params&&
      activated[0].params.tab &&
      activated[0].params.tab.instance&&
      activated[0].params.tab.instance.onShow) {
      activated[0].params.tab.instance.onShow(params);
    }
  },
  goActiveTab:function() {
    var goTab=this.goTab;
    var t=this.props.tabs.some(function(T){ 
      return T.active?goTab(T.id):false;
    })
  },
  closeTab:function(e) {
    var anchor=e.target.parentElement;
    var id=anchor.attributes['data-id'].value;
    var tabs=this.props.tabs;
    for (var i=0;i<tabs.length;i++) {
      if (tabs[i].id==id) {
        tabs.splice(i,1);
        if (i) tabs[i-1].active=true;
        this.setState({"tabs":tabs});
        break;
      }
    }

  }, 
  newTab:function(T,idx) {
    tabs=this.props.tabs;
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
  makeScrollable:function() {
    var h=this.getDOMNode().offsetHeight;
    var w=this.getDOMNode().offsetWidth;
    for (var i in this.refs) {
      if (i.substring(0,contentpf.length)!=contentpf)continue;
      var t=this.refs[i].getDOMNode();
      t.style.height=h;
      t.style.width=w;
      t.style.overflow="auto";
    }
  },
  componentDidMount:function() {
    this.goActiveTab();
  },
  componentDidUpdate:function() {
    this.makeScrollable();
    this.goActiveTab();
  }
});

module.exports=Tabui;