import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transport = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export const sendTicketEmail = async (ticket, user, productDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "jorge_gmartinez@hotmail.com",
        subject: "Detalles de tu compra",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h1 style="color: #333;">Detalles de tu ticket</h1>
                <p style="font-size: 16px;">Hola <strong>${user.first_name}</strong>,</p>
                <p style="font-size: 16px;">Aquí están los detalles de tu ticket:</p>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">Código:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ticket.code}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">Monto:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>$ ${ticket.amount}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">Fecha de compra:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ticket.purchase_datetime.toLocaleString()}</strong></td>
                    </tr>
                </table>
                <h2 style="color: #333;">Productos:</h2>
                <div style="font-size: 16px;">
                    ${productDetails.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}
                </div>
                <p style="font-size: 20px; color: #333;">Gracias por tu compra.</p>
            </div>
        `,
    };
    try {
        await transport.sendMail(mailOptions);
        console.log('Correo enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar el correo', error);
    }
}