
const express = require("express");
const { json } = require('body-parser');
const http = require('http');
const path = require('path')
var validator = require("validator")
const cors = require("cors");
var bodyParser = require('body-parser')

const corsOptions ={
    origin:'*', 
    credentials:true,            
    optionSuccessStatus:200,
 }
 

const app = express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors(corsOptions)) 

app.use(express.urlencoded({limit: '10mb',extended: true}));

app.use(express.json());

const PORT = 3001;
const hostname = 'localhost';


const mysql = require('mysql2');

var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "gestion_utilisateus",
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });


app.post(('/login'),(nodeReq,nodeRes)=>{ 

    const   {email, password} = nodeReq.body;
 

    if( validator.default.isEmail(email) && password){
        mysqlConnection.connect((err)=> {
            if(!err)
            {
                console.log("Connected");
                mysqlConnection.query("select id,`password`,`bloquer`,nom,image,prenom,admin from `users` where `email` = ?  ;",[email],function(err,res){
                    console.log(err)
                    if(err){
                        return nodeRes.status(201).json({
                            status : 'LOGIN_ERROR',
                            message : 'error while querying data',
                            doc : []
                        })
                    }
                    else if(res.length !== 0 && res[0].bloquer == 0 ) {
                        if(res[0].password === password){
                            const user = {email,...res[0]}
                            return nodeRes.status(200).json({
                                status : "OK",
                                message : "user authenticated",
                                user : user,
                            })
                        }
                        else if(res[0].password !== password){
                            return nodeRes.status(200).json({
                                status : "LOGIN_ERROR",
                                message : "access denied, password is incorrect",
                                docs : []
                            })
                            
                        }
                    }
                    else {
                        if(res.length != 0 && res[0].bloquer == 1){
                            return nodeRes.status(200).json({
                                status: "LOGIN_ERROR",
                                message : "You're blocked, you can't use this panel",
                                docs : []
                            })
                        }
                        else{
                            return nodeRes.status(200).json({
                                status: "LOGIN_ERROR",
                                message : "no user found with this email",
                                docs : []
                            })
                        }
                    }
            
            
                })
            }
            else
            {
                console.log("Connection Failed");
                return nodeRes.status(501).json({
                    status : 'error',
                    message : 'internal error while connecting to database',
                    doc : []
                })
            }
        })
    }
    else {
        return nodeRes.status(200).json({
            status: "LOGIN_ERROR",
            message : "Data sent was not complete or it is incorrect",
            docs : []
        })
    }
 
    })


app.post('/ajouter_user',(nodeReq, nodeRes)=>{

    const {admin,nom,prenom,dateNaissance,email,password,userIsAdmin,image} = nodeReq.body
    if( admin == 1 &&  nom && prenom && image && dateNaissance && typeof parseInt(userIsAdmin) === 'number' && email && validator.default.isEmail(email)){
            
            mysqlConnection.connect((err)=> {
                if(!err)
                {
                    mysqlConnection.query("select id from users where email = ?",
                    [email],function(err,res){
                        
                        if(err){
                            console.log(err)
                            return nodeRes.status(201).json({
                                status : 'user_ERROR',
                                message : 'Error while querying data',
                            })
                        }
                        else {
                            if(res.length == 0){
                                mysqlConnection.execute("INSERT INTO `users`( `nom`, `prenom`, `email`, `password`, `dateNaissance`,`image`,`admin`) " 
                                +" VALUES (?,?,?,?,?,?,?)",
                                [nom,prenom,email,password,dateNaissance,image,parseInt(userIsAdmin)],function(err,res){
                                    
                                    if(err){
                                        console.log(err)
                                        return nodeRes.status(201).json({
                                            status : 'user_ERROR',
                                            message : 'Error while inserting the new user',
                                            doc : []
                                        })
                                    }
                                    else {
                                        return nodeRes.status(200).json({
                                            status : 'OK',
                                            message : 'Utilisateur '+nom + ' '+ prenom+ ' est ajouter',
                                            
                                        })
                                    }
                            
                            
                                })
                            }
                            else {
                                return nodeRes.status(201).json({
                                    status : 'user_ERROR',
                                    message :'Email deja exist!',
                                    
                                })
                            }
                        }
                
                
                    })
                }
                else
                {
                    console.log("Connection Failed");
                    return nodeRes.status(501).json({
                        status : 'user_ERROR',
                        message : 'internal error while connecting to database',
                        doc : []
                    })
                }
            })
    }
    else {
        return nodeRes.status(400).json({
            status : 'user_ERROR',
            message : "Les données envoyer ne sont pas complete/valider!"
        })
    }
})

app.get('/users',(nodeReq, nodeRes)=>{
    
    mysqlConnection.connect((err)=> {
        if(!err)
        {
            mysqlConnection.query("SELECT * FROM `users` ;",function(err,res){
                
                if(err){
                    console.log(err)
                    return nodeRes.status(201).json({
                        status : 'USERS_ERROR',
                        message : 'error while querying data',
                        doc : []
                    })
                }
                else {
                    return nodeRes.status(200).json({
                        status : 'OK',
                        message : 'Data returned',
                        doc : res
                        
                    })
                }
        
        
            })
        }
        else
        {
            console.log("Connection Failed");
            return nodeRes.status(501).json({
                status : 'USERS_ERROR',
                message : 'internal error while connecting to database',
                doc : []
            })
        }
    })

})

app.get('/users/:id',(nodeReq, nodeRes)=>{
    
    const {id} = nodeReq.params
    var v_id = parseInt(id)
    if(  typeof v_id === 'number' ){
        mysqlConnection.connect((err)=> {
            if(!err)
            {
                mysqlConnection.query("SELECT * FROM `users` where id = ? ;",[v_id],function(err,res){
                    
                    if(err){
                        console.log(err)
                        return nodeRes.status(201).json({
                            status : 'USERS_ERROR',
                            message : 'error while querying data',
                            doc : []
                        })
                    }
                    else {
                        if(res.length != 0){
                            return nodeRes.status(200).json({
                                status : 'OK',
                                message : 'Data returned',
                                doc : res
                                
                            })
                        }
                        else {
                            return nodeRes.status(201).json({
                                status : 'Users_ERROR',
                                message : 'L\'utilisateur n\'éxiste pas ',
                                doc : res
                                
                            })
                        }
                    }        
                })
            }
            else
            {
                console.log("Connection Failed");
                return nodeRes.status(501).json({
                    status : 'USERS_ERROR',
                    message : 'internal error while connecting to database',
                    doc : []
                })
            }
        })
    }
    else {
        return nodeRes.status(400).json({
            status : 'Users_ERROR',
            message : 'Les données evoyer ne sont pas complet ',
            
            
        })
    }

})

app.put('/users/:id',(nodeReq, nodeRes)=>{
    
    const {id} = nodeReq.params
    const {admin,email,nom,prenom,dateNaissance,image,password,bloquer,userIsAdmin,prevEmail} = nodeReq.body
    var v_id = parseInt(id)
    console.log(admin,email,nom,prenom,dateNaissance,password,typeof bloquer,typeof userIsAdmin,prevEmail)
    if( admin == 1 && typeof v_id === 'number' && nom && prenom && dateNaissance && validator.default.isEmail(prevEmail)
    && validator.default.isEmail(email) 
     && image && password && typeof parseInt(bloquer) === 'number' && typeof userIsAdmin === 'number' ){
        
        mysqlConnection.query("select id,email from users where email = ?",
                    [email],function(err,res){
                        
                        if(err){
                            console.log(err)
                            return nodeRes.status(201).json({
                                status : 'user_ERROR',
                                message : 'Error while querying data',
                            })
                        }
                        else  {
                            if(res.length == 0 || prevEmail === email){
                                mysqlConnection.connect((err)=> {
                                    if(!err)
                                    {
                                        mysqlConnection.execute("UPDATE `users` SET `email`= ?,`nom` = ?,`prenom`=?,"+
                                        "`dateNaissance`=?,`image`=?,`password`=?,`bloquer`=?,`admin`=? where id=?" ,
                                        [email,nom,prenom,dateNaissance,image,password,bloquer,userIsAdmin,v_id],function(err,res){
                                            
                                            if(err){
                                                console.log(err)
                                                return nodeRes.status(201).json({
                                                    status : 'USERS_ERROR',
                                                    message : 'error while updating user data',
                                                })
                                            }
                                            else {
                                                if(res.length != 0){
                                                    return nodeRes.status(200).json({
                                                        status : 'OK',
                                                        message : 'Utilisateur est modifier',
                                                        
                                                    })
                                                }
                                                else {
                                                    return nodeRes.status(201).json({
                                                        status : 'Users_ERROR',
                                                        message : 'L\'utilisateur n\'éxiste pas ',
                                                        
                                                    })
                                                }
                                            }        
                                        })
                                    }
                                    else
                                    {
                                        console.log("Connection Failed");
                                        return nodeRes.status(501).json({
                                            status : 'USERS_ERROR',
                                            message : 'internal error while connecting to database',
                                        })
                                    }
                                })                        
                            }
                            else{
                                return nodeRes.status(201).json({
                                    status : 'user_ERROR',
                                    message :'Email deja exist!',
                                    
                                })
                            }
                        }
        })
    }
    else {
        if(admin != 1){
            return nodeRes.status(400).json({
                status : 'Users_ERROR',
                message : 'Vous n\avez pas le droit pour modifier l\'utilisateur',
                
                
            })
        }
        else {
            return nodeRes.status(400).json({
                status : 'Users_ERROR',
                message : 'Les données evoyer ne sont pas complet ',
                
                
            })
        }
    }

})

app.delete('/users/:id',(nodeReq, nodeRes)=>{
    
    const {id} = nodeReq.params
    var v_id = parseInt(id)
    if(  typeof v_id === 'number' ){
        mysqlConnection.connect((err)=> {
            if(!err)
            {
                mysqlConnection.execute("delete from users where id = ?;",
                [v_id],function(err,res){
                    
                    if(err){
                        console.log(err)
                        return nodeRes.status(201).json({
                            status : 'USERS_ERROR',
                            message : 'error while updating user data',
                        })
                    }
                    else {
                        if(res.length != 0){
                            console.log(res)
                            return nodeRes.status(200).json({
                                status : 'OK',
                                message : 'Utilisateur est supprimer',
                                
                            })
                        }
                        else {
                            return nodeRes.status(201).json({
                                status : 'Users_ERROR',
                                message : 'L\'utilisateur n\'éxiste pas ',
                                
                            })
                        }
                    }        
                })
            }
            else
            {
                console.log("Connection Failed");
                return nodeRes.status(501).json({
                    status : 'USERS_ERROR',
                    message : 'internal error while connecting to database',
                })
            }
        })
    }
    else {
        return nodeRes.status(400).json({
            status : 'Users_ERROR',
            message : 'Les données evoyer ne sont pas complet ',
            
            
        })
    }

})

app.put('/profile',(nodeReq, nodeRes)=>{
    
    const {id,email,prevEmail,nom,prenom,dateNaissance,image,password} = nodeReq.body
    if(typeof id === 'number' && nom && prenom && dateNaissance && image && password
        && validator.default.isEmail(email) && validator.default.isEmail(prevEmail) 
    ){

        mysqlConnection.query("select id from users where  email = ?",
                    [email],function(err,res){
                        
                        if(err){
                            console.log(err)
                            return nodeRes.status(201).json({
                                status : 'user_ERROR',
                                message : 'Error while querying data',
                            })
                        }
                        else if(res.length == 0 || prevEmail === email){
                            mysqlConnection.connect((err)=> {
                                if(!err)
                                {
                                    mysqlConnection.execute("UPDATE `users` SET `email`= ?,`nom` = ?,`prenom`=?,"+
                                    "`dateNaissance`=?,`image`=?,`password`=? where id=?" ,
                                    [email,nom,prenom,dateNaissance,image,password,id],function(err,res){
                                        
                                        if(err){
                                            console.log(err)
                                            return nodeRes.status(201).json({
                                                status : 'USERS_ERROR',
                                                message : 'error while updating user data',
                                            })
                                        }
                                        else {
                                            if(res.length != 0){
                                                return nodeRes.status(200).json({
                                                    status : 'OK',
                                                    message : 'Votre profile à été modfier',
                                                    
                                                })
                                            }
                                            else {
                                                return nodeRes.status(201).json({
                                                    status : 'Users_ERROR',
                                                    message : 'L\'utilisateur n\'éxiste pas ',
                                                    
                                                })
                                            }
                                        }        
                                    })
                                }
                                else
                                {
                                    console.log("Connection Failed");
                                    return nodeRes.status(501).json({
                                        status : 'USERS_ERROR',
                                        message : 'internal error while connecting to database',
                                    })
                                }
                            })
                        }
                        else {
                            return nodeRes.status(201).json({
                                status : 'user_ERROR',
                                message :'Email deja exist!',
                                
                            })
                        }
                    }
        )
    }
    else {
        return nodeRes.status(400).json({
            status : 'Users_ERROR',
            message : 'Les données evoyer ne sont pas complet ',
            
            
        })
    }

})