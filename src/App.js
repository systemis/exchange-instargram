import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {connect} from 'react-redux';
import $         from 'jquery';
import HomePage  from './Pages/Home/home.js';
import Header    from './Components/Header/index.js';
import Footer    from './Components/footer/index.js';
import './Style/app.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {screenWidth: $(window).width()}
  }

  reSizeScreenWidthListener(){
    var screenWidth = $(window).width();
    var old         = this.state.screenWidth;
    if(screenWidth > 768 && old < 768){
      this.setState({screenWidth: screenWidth});
      this.props.dispatch({type: 'CHANGE_SCREEN_VERSION', value: 'desktop'});
    }else if(screenWidth < 768 && old > 768){
      this.setState({screenWidth: screenWidth});
      this.props.dispatch({type: 'CHANGE_SCREEN_VERSION', value: 'modile'});
    }
  }

  render() {
    return (
      <div id="App">
        <Header />
        <Router>
          <div className="main-layout">
            <Route exact path='/' component={HomePage} />
          </div>
        </Router>
        <Footer />
      </div>
    );
  }

  componentDidMount() {
    window.onresize = this.reSizeScreenWidthListener.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
}

export default connect(state => {
  return {
    screenVersion: state.screenVersion
  }
})(App);
