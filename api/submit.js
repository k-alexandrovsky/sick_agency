'use strict'; /*jslint node:true, es9:true*/
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData).client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
});

const MAIL_INBOX = process.env.MAIL_INBOX||'sickpick@sick.agency';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN||'sick.agency';

module.exports = async(req, res)=>{
    if (req.method!='POST')
        return res.status(405).send('Method Not Allowed');
    await mailgun.messages.create(MAILGUN_DOMAIN, {
        from: 'sick.agency@'+MAILGUN_DOMAIN,
        to: [MAIL_INBOX],
        subject: 'New request from '+req.body.email,
        text: Object.entries(req.body).map(([k, v])=>`${k}: ${v}`).join('\n'),
    });
    res.status(200).send('{"success":true}');
};
