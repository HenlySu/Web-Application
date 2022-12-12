const fs = require("fs");
const Sequelize = require('sequelize');

var sequelize = new Sequelize('d19u7aqjs6j3t4', 'jxnuumyejzazqv', 'a1f30ad4cdb9bddc2515ac1638486b1aa5c435ae12073c9be8b2db6478c37f7b', {
    host: 'ec2-54-163-34-107.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
})

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(data => {
            resolve();
        }).catch(err => {
            reject("Unable to sync the database");
        })
    });
}

module.exports.getAllPosts = function(){
    return new Promise((resolve,reject)=>{
        Post.findAll().then(data => {
            resolve(data);
        }).catch(err => {
            reject("No results returned");
        })
    });
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                category: category
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("No results returned");
        })
    });    
}

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPostById = function(id){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                id: id
            }
        })
    });
}

module.exports.addPost = function(postData){
    return new Promise((resolve,reject)=>{

        postData.published = (postData.published) ? true : false;

        for (var i in postData){
            (postData[i] === "") ? postData[i] = null : postData[i];
        }

        postData.postDate = new Date();

        Post.create({
            body: postData.body,
            title: postData.title,
            postDate: postData.postDate,
            featureImage: postData.featureImage,
            published: postData.published,
            category: postData.category
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("Unable to create post");
        })
    });
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                published: true
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("No results returned");
        })
    });
}

module.exports.getPublishedPostsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("No results returned");
        })
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        Category.findAll().then(data => {
            resolve(data);
        }) .catch(err => {
            reject("No results returned");
        })
    });
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve, reject) => {

        //Setting any blank values to null
        for (var i in categoryData){
            (categoryData[i] === "") ? categoryData[i] = null : categoryData[i];
        }

        Category.create({
            category: categoryData.category
        }).then(data =>{
            resolve(data);
        }).catch(err => {
            reject("Unable to create category");
        })
    });
}

module.exports.deleteCategoryById = function(id){
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject();
        })
    });
}

module.exports.deletePostById = function(id){
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject();
        })
    });
}