import nodemailer from 'nodemailer';
import Mailgen from "mailgen";

class EmailOtpService {
    private transporter;
    private mailGenerator;

    constructor() {
        const config = {
            service: 'gmail',
            auth: {
                user: "ragamayi2001@gmail.com",
                pass: "anmluwbsbykelffc"
            }
        };

        this.transporter = nodemailer.createTransport(config);

        this.mailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Ride Me",
                link: 'www.rideme.com'
            }
        });
    }

    public async sendOtp(email: string, otp: string): Promise<void> {

        const responsee = {
            body: {
                greeting: "Hi",
                intro: "Your OTP Verification Code",
                table: {
                    data: [
                        {
                            key: "Verification Code",
                            value: `<strong>${otp}</strong>`
                        }
                    ]
                },
                outro: "Use this code to verify your email address."
            }
        };

        const mail = this.mailGenerator.generate(responsee);

        const message = {
            from: "ragamayi2001@gmail.com",
            to: email,
            subject: "Email Verification Code",
            html: mail
        };

        try {
            await this.transporter.sendMail(message);
        } catch (error) {
            throw error;
        }
    }
}

export default new EmailOtpService();