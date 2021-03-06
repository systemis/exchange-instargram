const pool = require('../config/database.js');
const tableName = 'UserData';
class userDM{
    constructor(){
        pool.query('CREATE TABLE IF NOT EXISTS`'+tableName+'` ( `id` VARCHAR(200) NOT NULL , `email` TEXT NULL , `username` TEXT NULL , `password` TEXT NULL , `phone` TEXT NULL , `avatar` TEXT NOT NULL, `follower` TEXT NULL, `following` TEXT NULL , `posts` TEXT NULL, `description` TEXT NULL, `notifications` TEXT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_general_ci', (err, result) => {
            console.log(`Error when create table ${tableName}: ${err}`);
        })
    }

    newUser(bundle, fn){
        const existsEmailError = () => fn('Email already exists!', null);
        const existsNamelError = () => fn('Username already exists!', null);
        const newUser = id => {
            bundle.id = id;
            bundle.follower  = `[]`;
            bundle.following = `[]`;
            bundle.posts     = `[]`;
            bundle.notifications = `[]`;
            
            pool.query(`INSERT INTO ${tableName} SET ?`, bundle, (err, result) => {
                console.log('Error when new user with auth local: ' + err);
                fn(err, result);
            });
        }

        this.findUserByEmail(bundle.email, (error, result) => {
            if(!error) return existsEmailError();
            this.findUserByName(bundle.username, (err, rs) => {
                if(!err) return existsNamelError();
                bundle.id = Math.floor((Math.random() * 100000) + 1).toString();
                this.randomId(bundle.id, id => {
                    newUser(id);
                })
            })
        })
    }

    getAll(fn){
        pool.query(`SELECT * FROM ${tableName}`, (error, result) => {
            return fn(error, result);
        })
    }

    findOrCreate(bundle, fn){
        const newUser = id => {
            bundle.id = id;
            bundle.follower  = `[]`;
            bundle.following = `[]`;
            bundle.posts     = `[]`;
            bundle.notifications = `[]`;
            
            pool.query(`INSERT INTO ${tableName} SET ?`, bundle, (err, result) => {
                if(err) {
                    console.log(err);
                    return fn(err, null);
                }

                this.findUserById(id, (error, rs) => {
                    delete rs['password'];
                    fn(error, rs);
                })
            });
        }

        this.findUserByName(bundle.username, (error, result) => {
            if(!error) {
                delete result['password'];
                return fn(null, result);
            }

            this.randomId(bundle.id, id => {
                newUser(id);
            })
        })
    }

    addNewPost(id, postId, fn){
        this.findUserById(id, (error, result) => {
            if(error) return fn(error, null);

            var posts = result.posts;
            posts.push(postId);
            posts = JSON.stringify(posts);
            pool.query(`UPDATE ${tableName} SET posts = ? WHERE id = ?`, [posts, id], (err, rs) => {
                return fn(err, rs);
            })
        })
    }

    addNewNotification(username, notifi, fn){
        this.findUserByName(username, (error, result) => {
            if(error) return fn(error, null);

            var notifications = result.notifications;
            notifications.push(notifi);

            pool.query(`UPDATE ${tableName} SET notifications = ? WHERE username = ?`, [JSON.stringify(notifications), username], (err, rs) => {
                return fn(err, rs);
            })
        })
    }

    removeField(username, namefield, value, fn){
        pool.query(`UPDATE ${tableName} SET ${namefield} = ? WHERE username = ?`, [value, username], (error, result) => {
            fn(error, result);
        })
    }


    // -------------------------> Find signle account 

    findUserById(id, fn){
        pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, result) => {
            if(result.length <= 0) return fn('Not exists', null);
            try{
                result[0].follower  = JSON.parse(result[0].follower);
                result[0].following = JSON.parse(result[0].following);
                result[0].posts     = JSON.parse(result[0].posts);
                result[0].notifications = JSON.parse(result[0].notifications);
                return fn(err, result[0]);
            }catch(e){
                return fn(e, null);
            }
        });
    }
    
    findUserByEmail(email, fn){
        pool.query(`SELECT * FROM ${tableName} WHERE email = ?`, [email], (err, result) => {
            if(result.length <= 0) return fn('Not exists', null);
            try{
                result[0].follower      = JSON.parse(result[0].follower);
                result[0].following     = JSON.parse(result[0].following);
                result[0].posts         = JSON.parse(result[0].posts);
                result[0].notifications = JSON.parse(result[0].notifications);
                return fn(err, result[0]);
            }catch(e){
                return fn(e, null);
            }
        });
    }

    findUserByName(username, fn){
        pool.query(`SELECT * FROM ${tableName} WHERE username = ?`, [username], (err, result) => {
            if(err || result.length <= 0) return fn('Not exists', null);

            try{
                result[0].follower  = JSON.parse(result[0].follower);
                result[0].following = JSON.parse(result[0].following);
                result[0].posts     = JSON.parse(result[0].posts);
                result[0].notifications = JSON.parse(result[0].notifications);
                return fn(err, result[0]);
            
            }catch(e){
                return fn(e, null);
            }
        });
    }

    // ----------------------------> Not signle - for many account 

    findUsersByName(keyWord, fn){
        var data  = [];
        this.getAll((error, result) => {
            if(error || result.length < 0) {
                return fn({error: null, result: []});
            }

            result.map((item, index) => {
                if(item.username.toLowerCase().indexOf(keyWord.toLowerCase()) >= 0){
                    try{
                        // Don not show password in list 
                        delete item['password'];
                        delete item['following'];
                        delete item['follower'];
                        delete item['posts'];
                        delete item['phone'];
                        delete item['notifications'];

                    }catch(e){
                        console.log('Error when delete field of row when search by people', e);
                    }
    
                    data.push(item);
                }
    
                if(index === result.length - 1){
                    console.log(`Get users by keyword ${data.length}`);
                    return fn(null, data);
                }
            })
        })
    }

    followOrUnfollow(usFollower, usBeFollow, fn){
        var setFOF = (fofChoice, fof, forDH, username, cb) => {
            var isAdd = -1;
            for(var i = 0, length = fof.length; i < length; i++) {
                if(fof[i] === forDH){
                    isAdd = i;
                    i = length;
                }
            }

            if(isAdd !== -1){
                fof.splice(isAdd, 1);
            }else{
                fof.push(forDH);
            }

            fof = JSON.stringify(fof);
            pool.query(`UPDATE ${tableName} SET ${fofChoice} = ? WHERE username = ?`, [fof, username], (error, result) => {
                if(error) return fn(error, null);
                
                cb(JSON.parse(fof));
            })
        }
        
        this.findUserByName(usBeFollow, (error, result) => {
            if(error) return fn(error, null);
            setFOF('follower', result.follower, usFollower, usBeFollow, fof1 => {
            })
        })
        
        this.findUserByName(usFollower, (error, result) => {
            setFOF('following', result.following, usBeFollow, usFollower,  fof2 => {
                return fn(null, fof2);
            }); 
        });
    }

    updateNotification(username, notifications, fn){
        try{
            notifications = JSON.stringify(notifications);
        }catch(e) {
            console.log(e);
        }
        
        pool.query(`UPDATE ${tableName} SET notifications = ? WHERE username = ?`, [notifications, username], (error, result) => {
            fn(error, result);
        })
    }

    login(username, password, fn){
        this.findUserByName(username, (err, result) => {
            if(err) return fn('User not already exists', null);
            if(password !== result.password) return fn('Password is not correct!', null);

            delete result['password'];
            fn(null, result);
        })
    }
    
    randomId(defaultId, fn){
        var isAlreadyId = false
        do{
            this.checkAlreadyId(defaultId, bool => {
                isAlreadyId = bool;
                if(!bool){
                    return fn(defaultId);
                }else{
                    defaultId = Math.floor((Math.random() * 100000) + 1).toString();
                }
            })
        }while(isAlreadyId)
    }

    checkAlreadyId(id, fn){
        pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, result) => {
            if(err || result.length <= 0){
                return fn(false);
            }

            return fn(true);
        })
    }

    deleteByName(username, fn){
        pool.query(`DELETE FROM ${tableName} WHERE username = ?`, [username], (error, result) => {
            fn(error, result);
        })
    }

    dropTable(fn){
        pool.query(`DROP TABLE ${tableName}`, (err, result) => {
            fn(err, result);
        })
    }
}

module.exports = new userDM();