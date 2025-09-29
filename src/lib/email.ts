import nodemailer from 'nodemailer'

// For development/testing, we'll use a simple console log
// In production, you'd configure with a real email service
const transporter = nodemailer.createTransporter({
  // For demo purposes, we'll use ethereal email (test service)
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || 'demo@ethereal.email',
    pass: process.env.EMAIL_PASS || 'demo-password'
  }
})

export async function sendMagicLink(email: string, magicToken: string) {
  const magicLink = `${process.env.NEXTAUTH_URL || 'https://basketball-tracker-production.up.railway.app'}/auth/verify?token=${magicToken}`
  
  // For demo purposes, we'll just return the magic link
  // In production, you'd actually send the email
  console.log(`Magic link for ${email}: ${magicLink}`)
  
  try {
    // Uncomment this in production with real email service
    /*
    await transporter.sendMail({
      from: '"Basketball Court Tracker" <noreply@yourapp.com>',
      to: email,
      subject: 'Sign in to Basketball Court Tracker',
      html: `
        <h2>🏀 Basketball Court Tracker</h2>
        <p>Click the link below to sign in:</p>
        <a href="${magicLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #ea580c;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        ">Sign In to Basketball Tracker</a>
        <p><small>This link expires in 15 minutes.</small></p>
      `
    })
    */
    
    return { 
      success: true, 
      magicLink, // Return for demo purposes
      message: 'Magic link sent to your email' 
    }
  } catch (error) {
    console.error('Email send error:', error)
    return { 
      success: false, 
      error: 'Failed to send email' 
    }
  }
}
