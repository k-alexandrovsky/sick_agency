const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
const mailer = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

const MAIL_INBOX = 'sickpick@sick.agency';

app.post('/api/submit', (req, res)=>{
    console.log(req.body);
    mailer.sendMail({
        from: 'noreply@sick.agency',
        to: MAIL_INBOX,
        subject: 'New request from '+req.body.email,
        text: JSON.stringify(req.body, null, 4)
    }, (err, info)=>{
        if (err)
            return console.error(err);
        console.log(info.envelope);
        console.log(info.messageId);
    });
    res.sendStatus(200);
});

app.listen(4444);
