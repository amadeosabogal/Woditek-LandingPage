const SCRAPER_URL = 'http://localhost:8000';
export const sendEmail = async (toEmail: string, subject: string, body: string, isHtml: boolean = false) => {
  const res = await fetch(`${SCRAPER_URL}/api/emails/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to_email: toEmail, subject, body, is_html: isHtml })
  });
  if (!res.ok) throw new Error('Failed to send email');
  return res.json();
};
