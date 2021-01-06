const mongoose = require('mongoose');
const {places, descriptors} = require('./seedHelpers');
const {cities} = require('./cities');
const Campground = require('../models/campground')


//database setup
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const seedDb = async () => {
    await  Campground.deleteMany({});
    for (let i=0; i<50;i++) {
        const city = rdSample(cities);
        const camp = new Campground({
            location:`${city.city},${city.state}`,
            title: `${rdSample(descriptors)} ${rdSample(places)}`
        })
        await camp.save();

    }


}

//useful function here

const rdSample = array => array[Math.floor(Math.random() * array.length)];

seedDb().then(() => {
    mongoose.connection.close();
});