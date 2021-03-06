import React, { Component } from 'react';
import {connect}            from 'react-redux';
import userMG               from '../../js/user.js';

class UserItem extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: ``,
            clFollowing: [], // client following 
            info: '', // Details info of user is openning by client 
        }
    }

    getUserInfo(){
        userMG.findUserByName(this.state.username, (error, result) => {
            if(error) return ;

            this.setState({info: result});
        })
    }

    followOrUnfollow(e){
        userMG.followOrUnfollow(this.state.username, (error, following) => {
            if(error) return ;
            var clInfo = {...this.props.clientInfo};
            var oldFollowings = clInfo.following;
            clInfo.following  = following;

            if(following.length > oldFollowings.length){
                const notification = {
                    sendUser: this.props.clientInfo,
                    receiveUser: this.state.info,
                    type: `FOLLOW`
                }

                this.props.socket.sendNotification(notification);
            }

            this.setState({clFollowing: following});
            this.props.dispatch({type: `CHANGE_CLIENT_INFO`, value: clInfo});
        })
    }

    btnFOF(){
        var bundleProperty  = {};
        var clientUs        = this.props.clientInfo.username;
        var userUS          = this.state.username;
        var clientFollowing = this.state.clFollowing;

        // Return null if not login 
        if(!clientUs) return;
        
        // Return null if client is user being opened
        if(userUS === clientUs) return;
        
        // Return unfollow if client followed user
        if(clientFollowing.indexOf(userUS) >= 0){ 
            bundleProperty.text = 'UnFollow';
        }else{ 
            bundleProperty.text = 'Follow';
        }
        
        return (
            <button 
                className="btn-follow-user" 
                onClick={() => this.followOrUnfollow()}>
                    {bundleProperty.text}
            </button>
        )
    }

    componentWillMount() {
        this.setState({clFollowing: this.props.clientInfo.following});
        this.setState({username: this.props.data.username || this.props.data});
    }

    render() {
        return (
            <div className="user-item-users-list-field row">
                <div className="show-avatar">
                    <img src={this.state.info.avatar} alt="User avatar"/>
                </div>
                <div className="show-username">
                    <a href={`/user/${this.state.info.username}`}>
                        {this.state.info.username}
                    </a>
                </div>
                
                <div className="show-btn-follow">
                    {this.btnFOF()}
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.getUserInfo();        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
}

export default connect(state => {
    return {
        clientInfo: state.clientInfo,
        socket: state.socket
    }
})(UserItem);