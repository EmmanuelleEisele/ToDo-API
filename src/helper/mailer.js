import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(email, resetToken) {
  // Configure le transporteur (exemple avec Gmail, à adapter)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `<p>Pour réinitialiser votre mot de passe, cliquez sur le lien suivant :</p><a href='${resetUrl}'>Réinitialiser le mot de passe</a><p>Ce lien expirera dans 1 heure.</p>`,
    text: `Pour réinitialiser votre mot de passe, cliquez sur le lien suivant : ${resetUrl}
    Ce lien expirera dans 1 heure.`,
  };

  await transporter.sendMail(mailOptions);
}
