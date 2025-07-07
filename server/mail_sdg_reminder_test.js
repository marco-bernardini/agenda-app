import nodemailer from 'nodemailer';
import pool from './models/db.js';

const TEST_RECIPIENT = "marco.bernardini@sdggroup.com";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marco.bernardini@sdggroup.com',
    pass: 'fdpw msvh ltqn zwwv'
  }
});

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString('it-IT');
}

function formatAppointmentHtml(app, sdgers) {
  // Pick the first SDGer for the greeting, or fallback
  const nome = sdgers[0]?.nominativo?.split(' ')[0] || "SDGer";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;text-align:center;">
      <div style="margin-bottom:2px;">
        <span style="display:inline-block;padding:18px;">
          <img src="cid:vectorbrain" alt="Vector Brain" style="width:150px;display:block;" />
        </span>
      </div>
      <p style="font-size:1.1em;color:#23272f;margin-bottom:18px;">
        Gentile <b>${nome}</b>, ti ricordiamo che nel corso dei prossimi sette giorni hai un appuntamento programmato con un cliente Financial Services.
      </p>
      <h2 style="color:#2A66DD;font-size:1.5em;font-weight:bold;margin-bottom:8px;">Promemoria Appuntamento</h2>
      <table border="0" cellpadding="6" cellspacing="0"
        style="border-collapse:collapse;margin:0 auto 24px auto;width:90%;font-family:sans-serif;text-align:center;
               border-left:1px solid #2A66DD;border-right:1px solid #2A66DD;border-bottom:2px solid #2A66DD;">
        <thead>
          <tr>
            <th style="background:#2A66DD;color:#fff;font-weight:bold;padding:8px 6px;border-top-left-radius:8px;">Cliente</th>
            <th style="background:#2A66DD;color:#fff;font-weight:bold;padding:8px 6px;">Iniziativa</th>
            <th style="background:#2A66DD;color:#fff;font-weight:bold;padding:8px 6px;">Data</th>
            <th style="background:#2A66DD;color:#fff;font-weight:bold;padding:8px 6px;border-top-right-radius:8px;">Format</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:6px 6px;border-bottom:1px solid #e0e7ef;color:#23272f;">${app.denominazione_cliente}</td>
            <td style="padding:6px 6px;border-bottom:1px solid #e0e7ef;color:#23272f;">${app.denominazione}</td>
            <td style="padding:6px 6px;border-bottom:1px solid #e0e7ef;color:#23272f;">${formatDate(app.data)}</td>
            <td style="padding:6px 6px;border-bottom:1px solid #e0e7ef;color:#23272f;">${app.format}</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:1.1em;color:#23272f;margin-top:18px;">
        Per qualsiasi informazione, non esitare a contattare marco.bernardini@sdggroup.com o gabriele.colombo@sdggroup.com.
      </p>
      <div style="margin:16px 0;">
        <strong>SDGers coinvolti nell'appuntamento:</strong>
        <ul style="list-style:none;padding:0;">
          ${sdgers.map(sdg => `<li>${sdg.nominativo} &lt;${sdg.email || 'no email'}&gt;</li>`).join('')}
        </ul>
      </div>
      <p style="color:#888;font-size:0.95em;margin-top:32px;">Email generata automaticamente da Agenda FL<br>Per info scrivere a marco.bernardini@sdggroup.com.</p>
    </div>
  `;
}

async function getUpcomingAppointments() {
  // Appuntamenti nei prossimi 7 giorni
  const res = await pool.query(`
    SELECT 
      a.id,
      c.denominazione_cliente,
      t.denominazione,
      a.data,
      a.format
    FROM appuntamenti a
    JOIN trattative t ON a.id_trattativa = t.id
    JOIN clienti c ON t.id_cliente = c.id
    WHERE a.data <= CURRENT_DATE + INTERVAL '7 days'
        AND a.data >= CURRENT_DATE
  `);
  return res.rows;
}

async function getSdgersForAppointment(appId) {
  // Get SDGers (with email) for this appointment
  const res = await pool.query(`
    SELECT sg.nominativo, sg.email
    FROM appuntamenti_sdg_group asg
    JOIN sdg_group sg ON asg.id_sdg = sg.id
    WHERE asg.id_appuntamento = $1
  `, [appId]);
  return res.rows;
}

async function sendSdgRemindersTest() {
  const appointments = await getUpcomingAppointments();

  for (const app of appointments) {
    const sdgers = await getSdgersForAppointment(app.id);
    const html = formatAppointmentHtml(app, sdgers);
    await transporter.sendMail({
      from: '"Agenda Financial Services" <marco.bernardini@sdggroup.com>',
      to: TEST_RECIPIENT,
      subject: `[TEST] Promemoria appuntamento nei prossimi 7 giorni - ${app.denominazione_cliente}`,
      html,
      attachments: [
        {
          filename: 'logo.png',
          path: '../client/public/Vector Brain.png',
          cid: 'vectorbrain'
        }
      ]
    });
    console.log(`[TEST] Reminder sent to ${TEST_RECIPIENT} for appointment ${app.id}`);
  }
}

sendSdgRemindersTest();