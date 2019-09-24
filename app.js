const config = require('./config.json');

const mongoose = require('mongoose');
mongoose.connect(
  `${config.db}/${config.database}`,
  { useNewUrlParser: true });

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const controllers = require('./controllers');
controllers.registerTo(app);

app.listen(config.port, () => { console.log(`Server listening http://localhost:${config.port}`)});
