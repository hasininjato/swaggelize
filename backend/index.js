require('dotenv').config();
const fs = require('fs');
const express = require('express');
const sequelize = require('./app/config/db.conf');
const cors = require('cors');
const helmet = require("helmet")

// models
const User = require('./app/models/user.model');
const Transaction = require('./app/models/transaction.model');

const app = express()

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};

const parser = require("../swaggelize/refactoring")

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use(helmet());

const port = 8000

const syncDb = async () => {
    try {
        await sequelize.sync({ force: false }); // set to false if no need to recreate tables and all existing data
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

// syncDb()

app.use('/api/users', require('./app/routes/user.transaction.route'));
app.use('/api/auth', require('./app/routes/auth.route'));
app.use('/api/profiles', require('./app/routes/profile.route'));
app.use('/api/tags', require('./app/routes/tag.route'));
app.use('/api/posts', require('./app/routes/post.route'));

const swaggelizeOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Swaggelize API',
            description: 'API automatic generator using Swagger API and Swaggelize',
            contact: {
                name: 'Hasininjato Rojovao'
            },
            version: '1.0.0'
        },
        servers: [
            {
                url: "http://localhost:8000/api"
            }
        ],
    },
    servicesPath: './app/docs/services',
    modelsPath: './app/models',
    defaultSecurity: 'jwt',
    routesVariable: app,
    middlewareAuth: 'verifyToken',
    routePrefix: "/api"
}

parser(swaggelizeOptions);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})