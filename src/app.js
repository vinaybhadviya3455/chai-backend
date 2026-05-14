import express from "express"

import cors from "cors"

import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

//for checking localhost8000 pe gye to pehle cannot get / esa aa raha tha isko banaya to backend is working aa raha hai
//sirf check karne ke liye kiya tha
// app.get("/", (req, res) => {
//     res.send("Backend is working");
// });

export { app }