const ghPages = require("gh-pages");

ghPages.publish(
    "demo",
    {
        user: {
            name: "Kyle Andrews",
            email: "codingwithkyle@gmail.com",
        },
        repo: "https://" + process.env.ACCESS_TOKEN + "@github.com/codewithkyle/papertrain-templator.git",
        silent: true,
    },
    (error) => {
        if (error) {
            console.log(error);
        }
    }
);
