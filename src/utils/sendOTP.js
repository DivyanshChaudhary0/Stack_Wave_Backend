
const { createTransport } = require("nodemailer");
const config = require("../config/config");


const transporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
})

const sendOTP = async function({to, subject, html}){
    try{
        await transporter.sendMail({
            from: '"Hypr Jaat" <hypr123890@gmail.com>',
            to,
            subject,
            html
        })
    }
    catch(err){
        console.log(err.message);
        throw new Error(err.message)
    }

}

module.exports = sendOTP