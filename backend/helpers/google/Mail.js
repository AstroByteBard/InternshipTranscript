const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // อีเมลผู้ส่ง
        pass: process.env.SMTP_PASS, // รหัสผ่าน (หรือ App Password)
    },
});

exports.sendMail = async function (to, subject, text, html) {    
    let mailOptions = {
        from: `"Internship System" <${process.env.SMTP_USER}>`,
        to,          // ผู้รับ
        subject,     // หัวข้อ
        text,        // ข้อความธรรมดา
        html,        // ข้อความแบบ HTML
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Mail sent: %s", info.messageId);
        return {success: true, messageId: info.messageId};
    } catch (error) {
        console.error("Error sending mail:", error);
        return {success: false, error};
    }
}


