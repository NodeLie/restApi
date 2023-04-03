require('dotenv').config()

const express = require('express');
const sequelize = require('./db');
const models = require('./models/models');
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const PORT = process.env.PORT || 5000

const app = express();

app.use(express.urlencoded({ extended: true,limit: '50mb', parameterLimit: 1000000 }));
app.use(express.json());

const serviceRouter = require('./routes/serviceRouter');

app.use("/api",serviceRouter);

// app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()