//Import mongoose module
import { Schema, model} from 'mongoose';
//https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
//Define a schema

//Define the Schema for a user
const artsSchema = new Schema({
    name: String,
    artist: String,
    year: String,
    category: String,
    medium: String,
    description: String,
    image: String,
    likes: {type: Number, default: 0},
    reviews: {
        type: Map,
        of: String
    }
});
 
//Export the default so it can be imported
export default model("arts", artsSchema);