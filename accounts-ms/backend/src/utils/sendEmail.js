const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
});

const sendEmail = async(options)=>{
    const data = {
        from:"Password Reset <noreply@sandbox732c7b7130f64bc28cf152da9e7117be.mailgun.org>",
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    try{
        const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
        console.log("Email sent Sucessfully!", response);
    }catch(error){
        console.error("Error in sending Email:", error);
        console.log(error);
        throw error; // This re-throws the specific error to be caught by the userController.
    }
};

module.exports = sendEmail;