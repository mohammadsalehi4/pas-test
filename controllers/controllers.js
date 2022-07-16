const Users=require('../model/user')
const axios=require('axios')
const jwt=require('jsonwebtoken')
const res = require('express/lib/response')
const Address='http://pasback.iran.liara.run'
const TOKEN='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZGRyZXNzIjoibG9jYWxob3N0OjMwMDIiLCJOdW1iZXIiOiIwOTE2NjM2NjcxNSIsImNvZGUiOiJkeXpzOXg3Nm5tZDZpd2oyZDEyOWZ5bDd5c3ozcmE5OWR1Y3Bldm80OGt3OHg3aHdoa21kcTRkdWQ1NXciLCJpYXQiOjE2NDc3NzE3MDYsImV4cCI6MTY3OTMyOTMwNn0.q6zl1EqYbEWH1DjmDRwx2ZUYxxEif1SR11oTEVhG4xQ'

module.exports.signup=(req,res)=>{
    const username=req.body.username
    const password=req.body.password
        axios.post(Address+'/AddUserToSiteDb',{username:username},
        {headers:{authorization:TOKEN}})
        .then(response2=>{
            if(response2.data.success){
                const user=new Users({
                    username:username,
                    password:password,
                    addPasCode:response2.data.code
                })
                user.save()
                .then(resp=>{
                    return res.status(200).json({
                        msg:'added',
                        code:response2.data.code,
                        success:true
                    })
                })
                .catch(err=>{
                    return res.status(400).json({
                        msg:err,
                        success:false
                    })
                })
            }else{
                return res.status(200).json({
                    msg:'No',
                    code:response2.data.msg,
                    success:false
                })
            }
        })
        .catch(err=>{
            return res.status(400).json({
                msg:err,
                success:false
            })
        })

    .catch(err=>{
        return res.status(400).json({
            msg:err,
            success:false
        })
    })
}

module.exports.login=(req,res)=>{
    const username=req.body.username
    const password=req.body.password

    Users.findOne({username:username})
    .then(user=>{
        if(user.password===password)
        {
            const token = jwt.sign({
                username:user.username,
                mode:'not_Complete'
            },'secret',{expiresIn:'1h'})
            return res.status(200).json({
                msg:'login completed',
                token:token,
                mode:'not_complete',
                success:true
            })
        }else{
            return res.status(200).json({
                msg:'login failed',
                token:null,
                success:false
            })
        }
    })
    .catch(err=>{
        return res.status(200).json({
            msg:'login failed',
            token:null,
            success:false
        })
    })
}

module.exports.PasAutorization=(req,res)=>{
    const firstToken=req.body.firstToken
    const code=req.body.code

    const decoded =jwt.verify(firstToken,'secret')
    const username=decoded.username
    const mode=decoded.mode

    if(mode==='not_Complete'){
        Users.findOne({username:username})
        .then(user=>{
            axios.post(Address+'/confirm',{username:username,code:code},
            {headers:{authorization:TOKEN}})
            .then(response=>{
                if(response.data.success){
                    const token = jwt.sign({
                        username:user.username,
                        mode:'Complete'
                    },'secret',{expiresIn:'1h'})
                    return res.status(200).json({
                        msg:'login complete',
                        token:token,
                        mode:'complete',
                        success:true,
                        username:username
                    })
                }else{
                    return res.status(200).json({
                        msg:'login failed4',
                        token:null,
                        mode:null,
                        success:false
                    })
                }
            })
            .catch(err=>{
                return res.status(200).json({
                    msg:'login failed3',
                    token:null,
                    mode:null,
                    success:false
                })
            })
        })
        .catch(err=>{
            return res.status(200).json({
                msg:'login failed2',
                token:null,
                mode:null,
                success:false
            })
        })
    }else{
        return res.status(200).json({
            msg:'login failed1',
            token:null,
            mode:mode,
            success:false
        })
    }
}

module.exports.pasCode=(req,res)=>{
    const token=(req.headers.authorization)
    const decoded =jwt.verify(token,'secret')
    const username=decoded.username

    Users.findOne({username:username})
    .then(user=>{
        return res.status(200).json({
            success:true,
            code:user.addPasCode
        })
    })
    .catch(err=>{
        return res.status(200).json({
            success:false
        })
    })
}

module.exports.checkPasCode=(req,res)=>{
    const code=req.body.code
    const username=req.body.username

    axios.post(Address+'/checkcode',{
        username:username,
        code:code
    },
    {headers:{authorization:TOKEN}})

    .then(response=>{
        if(response.data.success===true){
            const token = jwt.sign({
                username:username,
                mode:'Complete'
            },'secret',{expiresIn:'1h'})
            return res.status(200).json({
                msg:'login complete',
                token:token,
                mode:'complete',
                success:true,
                username:username
            })
        }else{
            return res.status(200).json({
                success:false
            })
        }
    })
    .catch(err=>{
        return res.status(200).json({
            success:false
        })
    })
}