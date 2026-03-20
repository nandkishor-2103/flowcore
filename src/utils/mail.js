import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async function (options) {
    const mailGenatator = new Mailgen({
        theme: "default",
        product: {
            name: "FlowCore",
            link: "https://flowcore.com",
        },
    });

    const emailTextual = mailGenatator.generatePlaintext(
        options.mailgenContent,
    );

    const emailHtml = mailGenatator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
        connectionTimeout: 10000,
    });

    const mail = {
        from: "FlowCore <no-reply@flowcore.com>",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error(
            "Email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file.",
        );
        console.error("Error details:", error);
    }
};

const emailVerificationMailgenContent = function (username, verificationUrl) {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! We're very excited to have you on board.",
            action: {
                instructions:
                    "To verify your email please click the following button:",
                button: {
                    color: "#25c471",
                    text: "Verify Your Email",
                    link: verificationUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

const forgotPasswordMailgenContent = function (username, passwordResetUrl) {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of your account.",
            action: {
                instructions:
                    "To reset your password, please click on the following button or link:",
                button: {
                    color: "#e05835",
                    text: "Reset Password",
                    link: passwordResetUrl,
                },
            },
            outro: "If you did not request this, please ignore this email.",
        },
    };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail,
};
