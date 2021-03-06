import React, { Component } from 'react';
import {connect}            from 'react-redux';
import $                    from 'jquery';
import UserListField        from '../../Components/Fields/users-list-field.js';
import PostItem             from './post-item.js';
import userMG               from '../../js/user.js';
import postsMG              from '../../js/posts.js';
import './Style/info-style.css';

class UserInfoPage extends Component {
    constructor(props){
        super(props);
        const username =  () => {
            if(window.location.href.indexOf('home') === -1){
                return this.props.match.params.username  
            } 

            return;
        }

        this.state = {
            isExists: false, 
            clFollowing: [],
            userFollower: [],
            posts: [],
            info: {}
        }
    }

    getPostsInfo(postsId){
        var posts   = [];
    
        if(postsId.length <= 0){
            this.setState({posts: []});
        }else{
            postsId.map((id, index) => {
                postsMG.findPostById(id, (error, result) => {
                    if(error) return index += 1;
                    posts.push(result);
                    if(index === postsId.length - 1 && posts.length === this.props.info.posts.length){
                        this.setState({posts: [...posts]});
                    }
                })
            })
        }
    }

    showFollowers(){
        const followers = this.props.info.follower;
        if(followers.length <= 0) return ;
        this.props.dispatch({
            type: `CHANGE_DIALOG`,
            value: {
                type: `user_list`,
                bundle: null,
                component: <UserListField data={followers} />
            }
        })
    }

    showFollowing(){
        const following = this.props.info.following;
        if(following.length <= 0) return ;
        this.props.dispatch({
            type: `CHANGE_DIALOG`,
            value: {
                type: `user_list`,
                bundle: null,
                component: <UserListField data={following} />
            }
        })
    }

    // nextCLF: next client following 
    updateUserFollower(nextCLF){
        var userInfo     = {...this.props.info};
        var clFollowing  = this.state.clFollowing;
        var userFollower = userInfo.follower;

        if(nextCLF.length > clFollowing.length){
            userFollower.push(this.props.clientInfo.username);
        }else{
            userFollower.splice(clFollowing.indexOf(this.props.clientInfo.username, 1));
        }

        userInfo.follower    = userFollower;
        this.setState({userFollower: userFollower});
        this.props.dispatch({type: `CHANGE_USER_SELECTED_INFO`, value: userInfo});
    }

    followOrUnfollow(e){
        userMG.followOrUnfollow(this.props.info.username, (error, following) => {
            if(error) return ;
            var clInfo = {...this.props.clientInfo};
            var oldFollowings = clInfo.following;
            clInfo.following = following;

            if(following.length > oldFollowings.length){
                const notification = {
                    sendUser: this.props.clientInfo,
                    receiveUser: this.props.info,
                    type: `FOLLOW`
                }

                this.props.socket.sendNotification(notification);
            }

            this.props.dispatch({type: `CHANGE_CLIENT_INFO`, value: clInfo});
        })
    }

    btnFOF(){
        var text      = 'follow';
        var clientUS  = this.props.clientInfo.username;
        var userUS    = this.props.info.username;
        var following = this.state.clFollowing;

        if(!clientUS) return ;
        if(clientUS === userUS) return ;
        if(following.indexOf(userUS) >= 0) text = 'UnFollow';
        
        return (
             <span className="btn-follow-user">
                <button onClick={this.followOrUnfollow.bind(this)}> 
                        {text}
                </button>
            </span>
        )
    }

    editBtn(){
        if(!this.props.clientInfo.id || this.props.clientInfo.id !== this.props.info.id) return ;
        return (
            <button id="show-edit-btn">
                <i  className="fa fa-cog" 
                    aria-hidden="true"
                    onClick={() => {
                        var menu = 'drop-menu-tosettings-info-dh';
                        $(`#${menu}`).toggle('hiden');
                        
                    }}>
                    <ul 
                        className="menu-drop-settings"
                        id="drop-menu-tosettings-info-dh">
                        <li> 
                            <a href="/a/settings"> Settings </a> 
                        </li>
                        <li> 
                            <a href="/logout"> Logout </a> 
                        </li>
                        </ul>
                </i>
            </button>
        )
        
        userMG.isEdit(this.props.info.id, isEdit => {
            if(!isEdit){
                document.getElementById('show-edit-btn').innerHTML = ''
            }else{
                document.getElementById('show-edit-btn').innerHTML = '<i class="fa fa-cog" aria-hidden="true"></i>'
            }
        })
    }


    render() {
        if(!this.state.info.id || this.state.info.id === '0'){
            return (
                <div className="show-label-not-exists-user">
                    <h1 style={{textAlign: 'center', lineHeight: '100vh'}}>User not exists</h1>
                </div>
            )
        }
        
        const showFollowing = () => {
            if(this.props.info.id !== this.props.clientInfo.id ){
                return this.props.info.following.length ;
            }else{
                return this.props.clientInfo.following.length
            }
        }
        
        const btnShowInfo = () => {
            if(window.location.href.indexOf('/user/') !== -1) return;
            return (
                <div className="show-showmore-btn">
                    <a 
                        href={`/user/${this.props.info.username}`}
                        className="showmore-info-btn">
                        Show more 
                    </a>
                </div>
            )
        }

        return (
            <div className={`user-info-page mobile`}>
                <div className="layout">
                    <div className="show-info row">
                        <div className="show-user-avatar col-md-3 col-sm-3 col-xs-3">
                            <img src={this.state.info.avatar} alt="User avatar"/>
                        </div>
                        <div className="show-user-info col-md-9 col-sm-9 col-xs-9">
                            <div className="show-user-name show-btn-edit">
                                <div className="row">
                                    <ul className="tools-manager">
                                        <li className="show-username">
                                            <span className="show-name"> 
                                                {this.props.info.username} 
                                            </span>
                                            {this.btnFOF()}
                                            {this.editBtn()}
                                        </li>
                                    </ul>        
                                </div>
                            </div>
                            <div className="show-about-env">
                                <div className="row">
                                    <ul className="tools-manager">
                                        <li>
                                            <button>
                                                <strong>
                                                    {this.state.info.posts.length}
                                                </strong> Posts
                                            </button>
                                        </li>
                                        <li onClick={this.showFollowers.bind(this)}>
                                            <button>
                                                <strong>
                                                    {this.state.userFollower.length}
                                                </strong> Follower
                                            </button>
                                        </li>
                                        <li onClick={this.showFollowing.bind(this)}>
                                            <button>
                                                <strong>
                                                    {showFollowing()}
                                                </strong> Following
                                            </button>
                                        </li>
                                    </ul>        
                                </div>
                            </div>
                            <div className="show-status">
                                <h4>{this.state.info.description}</h4>
                            </div>
                        </div>
                    </div>
                    <div 
                        className="show-posts row">
                        {   
                            this.state.posts.map((post, index) => {
                                if(index >= 6) return;
                                
                                index = this.state.posts.length - index - 1;
                                post  = this.state.posts[index];
                                return <PostItem post={post} key={index} />
                            })
                        }
                    </div>
                    {btnShowInfo()}
                </div>
            </div>
        )
    }

    componentDidMount() {
        if(window.location.href.indexOf('/user/') !== -1){
            const userName = this.props.match.params.username;
            userMG.findUserByName(userName, (err, result) => {
                if(err) {
                    this.setState({info: {}});
                    return console.log(`
                    Error when get user 
                    info by userName: ${JSON.stringify(err)}`);
                }

                this.setState({userFollower: result.follower});
                this.setState({info: result});
                this.props.dispatch({type: `CHANGE_USER_SELECTED_INFO`, value: result});
            })
        }else{
            this.setState({info: this.props.clientInfo});
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        // Do other something        
        // Do something with client info 
        // if(!nextProps.clientInfo.id) return false;
        if(nextProps.info.id !== this.props.info.id){
            this.getPostsInfo(nextProps.info.posts);
            this.setState({info: nextProps.info});
            this.setState({userFollower: nextProps.info.follower});
        }
        
        if(nextProps.clientInfo.id !== this.props.clientInfo.id){
            this.setState({clFollowing: nextProps.clientInfo.following});
        }

        if(nextProps.clientInfo.following.length !== this.props.clientInfo.following.length){
            this.setState({clFollowing: nextProps.clientInfo.following});
            if(nextProps.clientInfo.id !== nextProps.info.id) {
                this.updateUserFollower(nextProps.clientInfo.following);
            }
        }

        return true;
    }
}

export default connect(state => {
    return {
        screenVersion: state.screenVersion,
        clientInfo: state.clientInfo,
        info: state.userSelectedInfo,
        socket: state.socket
    }
})(UserInfoPage);