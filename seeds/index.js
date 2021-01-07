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
            title: `${rdSample(descriptors)} ${rdSample(places)}`,
            image:'https://images.unsplash.com/photo-1504744373149-59d6d64c86f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxfDB8MXxyYW5kb218fHx8fHx8fA&ixlib=rb-1.2.1&q=80&w=1080',
            price: Math.floor(Math.random() * 40),
            location:`${city.city},${city.state}`,
            description:"This is a description abala"

        })
        await camp.save();

    }


}

//useful function here

const rdSample = array => array[Math.floor(Math.random() * array.length)];

seedDb().then(() => {
    mongoose.connection.close();
});