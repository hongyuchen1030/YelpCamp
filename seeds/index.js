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
    for (let i=0; i<10;i++) {
        const city = rdSample(cities);
        const camp = new Campground({
            author: '6000c71e8330bc0a508c8313',
            title: `${rdSample(descriptors)} ${rdSample(places)}`,
            images: [
                {
                    url: `https://source.unsplash.com/collection/429524/${i}`,
                    filename: 'YelpCamp/randomseed1'
                },
                {
                    url: `https://source.unsplash.com/collection/1114848/${i}`,
                    filename: 'YelpCamp/randomseed2'
                }
            ],
            price: Math.floor(Math.random() * 40),
            location:`${city.city},${city.state}`,
            description:"This is a description abala",
            geometry: { type: 'Point', coordinates: [city.longitude,city.latitude] }

        })
        await camp.save();

    }


}

//useful function here

const rdSample = array => array[Math.floor(Math.random() * array.length)];

seedDb().then(() => {
    mongoose.connection.close();
});