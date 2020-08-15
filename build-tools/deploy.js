const ghPages = require("gh-pages");
require("dotenv").config({ path: "./" });

ghPages.publish(
    "demo",
    {
        user: {
            name: process.env.NAME,
            email: process.env.EMAIL,
        },
        repo: "https://" + process.env.ACCESS_TOKEN + "@github.com/" + process.env.USERNAME + "/" + process.env.PROJECT + ".git",
        silent: false,
    },
    (error) => {
        if (error) {
            console.log(error);
        }
    }
);
