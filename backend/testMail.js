const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mailOptions = {
  from: process.env.EMAIL,
  to: 'tucorreo@gmail.com', // Cambia esto a un correo de prueba
  subject: 'Test de Conexión',
  text: 'Si recibes esto, está todo bien configurado 🚀',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error al enviar:', error);
  } else {
    console.log('Correo enviado:', info.response);
  }
});
