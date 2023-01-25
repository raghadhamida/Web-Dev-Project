//Import mongoose module
import { Schema, model} from 'mongoose';
//Define a schema

//Define the Schema for a user
const userSchema = new Schema({
    username: String,
    password: String,
    usertype: Number,
    followedArtists: [String],
    reviews: [Schema.Types.ObjectId],
    likes: [Schema.Types.ObjectId],
    artworks: [String],
    workshops: [String]
});
 
//Export the default so it can be imported
export default model("users", userSchema);