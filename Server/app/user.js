const userDM    = require('../model/user.js');
const newFeedMG = require('./new-feed.js');
module.exports = app => {
    app.post(`/get-more/new-feed/:position`, (req, res) => {
    })

    app.post(`/client/info/get`, (req, res) => {
        if(!req.isAuthenticated()) return res.send({err: 'Not login', result: null});
        newFeedMG.get(req, (error, posts) => {
            var info = req.user; 
            info.newfeed = posts;
            
            res.send({err: null, result: info});
        })
    })

    app.post(`/user/isEdit/:userId`, (req, res) => {
        const userId = req.params.userId;
        if(!req.isAuthenticated()) return res.send(false);
        if(userId !== req.user.id) return res.send(false);

        res.send(true);
    })
    
    app.post(`/user/info/get/username/:username`, (req, res) => {
        const userName = req.params.username;

        userDM.findUserByName(userName, (error, result) => {
            if(error) return res.send({err: error, result: null});
            delete result['password'];
            
            console.log(error);
            
            res.send({err: error, result: result});
        })
    })

    app.post(`/user/follow-or-unfollow/:username`, (req, res) => {
        if(!req.isAuthenticated()) {
            return res.send({err: 'Not login', result: null});
        }

        const username = req.params.username;
        const follower = req.user.username;

        userDM.followOrUnfollow(follower, username, (error, result) => {
            req.user.following = result
            res.send({err: error, result: result})
        });
    })

    app.post(`/update-notifications/`, (req, res) => {
        if(!req.isAuthenticated()) return res.send({error: `NOT LOGIN`, result: null});
        
        const username      = req.user.username;
        const notifications = JSON.parse(req.body.notifications);

        userDM.updateNotification(username, notifications, (error, result) => {
            var info = req.user; 
            info.notifications = notifications;

            res.send({error: error, result: result});
        })        
    });

    app.post(`/load-new/new-feed`, (req, res) => {
        if(!req.isAuthenticated) return res.send({error: `Not Login`, result: null});
        
        const position = req.body.position;
        newFeedMG.get(req, (error, posts) => {

        })
    })
}