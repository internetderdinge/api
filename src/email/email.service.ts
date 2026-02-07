import AWS from 'aws-sdk';
import type { SES } from 'aws-sdk';
import config from '../../src/config/config';
import i18n from '../../src/i18n/i18n';

function urlStartsWithHttp(url: string): boolean {
  return url.startsWith('http');
}

const button = ({ link, text, color = '#0076ff' }: { link: string; text: string; color?: string }): string => {
  return `
  <div><!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="15%" stroke="f" fillcolor="${color}">
      <w:anchorlock/>
      <center>
    <![endif]-->
        <a href="${link}"
  style="background-color:${color};border-radius:4px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:15px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;">${text}</a>
    <!--[if mso]>
      </center>
    </v:roundrect>
  <![endif]--></div>
`;
};

const actionButton = ({ link, text, color = '#0076ff' }: { link: string; text: string; color?: string }): string => {
  return `<table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
  <tr>
    <td align="center">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tr>
          <td align="center">
            <a href="${link}" class="f-fallback button" target="_blank">${text}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};

interface SendEmailParams {
  title?: string;
  body?: string;
  url?: string;
  domain?: string;
  image?: string;
  email: string;
  actionButtonText?: string;
  lng?: string;
}

export const sendEmail = async ({
  title = 'Kein Titel',
  body = 'Kein Inhalt',
  url = '',
  domain = 'memo',
  image,
  email,
  actionButtonText,
  lng,
}: SendEmailParams): Promise<void> => {
  const interactive = '#0076ff';
  AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    region: 'eu-central-1',
  });

  const actionButtonTextWithLanguage = i18n.t(actionButtonText || 'Go to Application', { lng });

  const ses: SES = new AWS.SES({ apiVersion: '2010-12-01' });

  const toEmail = 'notifications@wirewire.de';
  const base64ToName = Buffer.from(`Memo ${i18n.t('Notifications', { lng })}`).toString('base64');
  const finalToName = `=?UTF-8?B?${base64ToName}?= <${toEmail}>`;

  const params: SES.SendEmailRequest = {
    Destination: {
      ToAddresses: [email],
    },
    ConfigurationSetName: 'memo-transactional',
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style>
      /* Base ------------------------------ */
    
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap");
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
    }
    
    a {
      color: ${interactive};
    }
    
    a img {
      border: none;
    }
    
    td {
      word-break: break-word;
    }
    
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    /* Type ------------------------------ */
    
    body,
    td,
    th {
      font-family: "Open Sans", Helvetica, Arial, sans-serif;
    }
    
    h1 {
      margin-top: 0;
      color: #333333;
      font-size: 22px;
      font-weight: bold;
    }
    
    h2 {
      margin-top: 0;
      color: #333333;
      font-size: 16px;
      font-weight: bold;
    }
    
    h3 {
      margin-top: 0;
      color: #333333;
      font-size: 14px;
      font-weight: bold;
    }
    
    td,
    th {
      font-size: 16px;
    }
    
    p,
    ul,
    ol,
    blockquote {
      margin: .4em 0 1.1875em;
      font-size: 16px;
      line-height: 1.625;
    }
    
    p.sub {
      font-size: 13px;
    }
    /* Utilities ------------------------------ */
    
    .align-right {
      text-align: right;
    }
    
    .align-left {
      text-align: left;
    }
    
    .align-center {
      text-align: center;
    }
    
    .u-margin-bottom-none {
      margin-bottom: 0;
    }
    /* Buttons ------------------------------ */
    
    .button {
      background-color: ${interactive};
      border-top: 10px solid ${interactive};
      border-right: 18px solid ${interactive};
      border-bottom: 10px solid ${interactive};
      border-left: 18px solid ${interactive};
      display: inline-block;
      color: #FFF !important;
      text-decoration: none;
      font-weight:bold;
      border-radius: 4px;
      /* box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); */
      -webkit-text-size-adjust: none;
      box-sizing: border-box;
    }
    
    .button--green {
      background-color: #22BC66;
      border-top: 10px solid #22BC66;
      border-right: 18px solid #22BC66;
      border-bottom: 10px solid #22BC66;
      border-left: 18px solid #22BC66;
    }
    
    .button--red {
      background-color: #FF6136;
      border-top: 10px solid #FF6136;
      border-right: 18px solid #FF6136;
      border-bottom: 10px solid #FF6136;
      border-left: 18px solid #FF6136;
    }
    
    @media only screen and (max-width: 500px) {
      .button {
        width: 100% !important;
        text-align: center !important;
      }
    }
    /* Attribute list ------------------------------ */
    
    .attributes {
      margin: 0 0 21px;
    }
    
    .attributes_content {
      background-color: #F4F4F7;
      padding: 16px;
    }
    
    .attributes_item {
      padding: 0;
    }
    /* Related Items ------------------------------ */
    
    .related {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .related_item {
      padding: 10px 0;
      color: #CBCCCF;
      font-size: 15px;
      line-height: 18px;
    }
    
    .related_item-title {
      display: block;
      margin: .5em 0 0;
    }
    
    .related_item-thumb {
      display: block;
      padding-bottom: 10px;
    }
    
    .related_heading {
      border-top: 1px solid #CBCCCF;
      text-align: center;
      padding: 25px 0 10px;
    }
    /* Discount Code ------------------------------ */
    
    .discount {
      width: 100%;
      margin: 0;
      padding: 24px;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F4F4F7;
      border: 2px dashed #CBCCCF;
    }
    
    .discount_heading {
      text-align: center;
    }
    
    .discount_body {
      text-align: center;
      font-size: 15px;
    }
    /* Social Icons ------------------------------ */
    
    .social {
      width: auto;
    }
    
    .social td {
      padding: 0;
      width: auto;
    }
    
    .social_icon {
      height: 20px;
      margin: 0 8px 10px 8px;
      padding: 0;
    }
    /* Data table ------------------------------ */
    
    .purchase {
      width: 100%;
      margin: 0;
      padding: 35px 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_content {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_item {
      padding: 10px 0;
      color: #51545E;
      font-size: 15px;
      line-height: 18px;
    }
    
    .purchase_heading {
      padding-bottom: 8px;
      border-bottom: 1px solid #EAEAEC;
    }
    
    .purchase_heading p {
      margin: 0;
      color: #85878E;
      font-size: 12px;
    }
    
    .purchase_footer {
      padding-top: 15px;
      border-top: 1px solid #EAEAEC;
    }
    
    .purchase_total {
      margin: 0;
      text-align: right;
      font-weight: bold;
      color: #333333;
    }
    
    .purchase_total--label {
      padding: 0 15px 0 0;
    }
    
    body {
      background-color: #F2F4F6;
      color: #51545E;
    }
    
    p {
      color: #51545E;
    }
    
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F2F4F6;
    }

    .email-image {
      display: block;
      width: 100px;
      height: auto;
      margin: auto;
      margin-bottom: 20px;
    }
    
    .email-content {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    /* Masthead ----------------------- */
    
    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }
    
    .email-masthead_logo {
      width: 94px;
    }
    
    .email-masthead_name {
      font-size: 16px;
      font-weight: normal;
      color: #A8AAAF;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }
    /* Body ------------------------------ */
    
    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #FFFFFF;
    }
    
    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .email-footer p {
      color: #A8AAAF;
    }
    
    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }

    .callout {
      color: #000;
      background: #F2F4F6;
      padding: 20px;
    }
    
    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #EAEAEC;
    }
    
    .content-cell {
      padding: 30px;
    }
    /*Media Queries ------------------------------ */
    
    @media only screen and (max-width: 600px) {
      .email-body_inner,
      .email-footer {
        width: 100% !important;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      body,
      .email-body,
      .email-body_inner,
      .email-content,
      .email-wrapper,
      .email-masthead,
      .email-footer {
        background-color: #333333 !important;
        color: #FFF !important;
      }
      p,
      ul,
      ol,
      blockquote,
      h1,
      h2,
      h3,
      span,
      .purchase_item {
        color: #FFF !important;
      }
      .attributes_content,
      .discount {
        background-color: #222 !important;
      }
      .email-masthead_name {
        text-shadow: none !important;
      }
    }
    
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    </style>
  </head>
  <body>
    <span class="preheader">${body}</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="email-masthead">
                <a href="https://${domain}.wirewire.de" class="f-fallback email-masthead_name">
                 ${domain === 'memo' ? 'ANABOX smart' : 'paperlesspaper'}
              </a>
              </td>
            </tr>
            <!-- Email Body -->
            <tr>
              <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell align-center">
                      <div class="f-fallback">
                      ${image ? `<img class="email-image" src="${image}" alt="memo image" />` : ''}
                        <h1>${title}</h1>
                        <p>${body}</p>
                        <!-- Action -->
                        ${actionButton({
                          link: urlStartsWithHttp(url) ? url : `http://${domain}.wirewire.de${url}`,
                          text: actionButtonTextWithLanguage,
                        })}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="content-cell" align="center">
                      <p class="f-fallback sub align-center">
                        ${domain === 'web' ? 'The Wire UG' : 'wirewire GmbH'}
                        <a href="http://${domain}.wirewire.de/account">Account</a>

                        ${config.env !== 'production' ? `<br/><br/>Environment: ${config.env}` : ''}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
        },
        Text: {
          Charset: 'UTF-8',
          Data: `${title} ${body}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `${title} - Memo App`,
      },
    },
    Source: finalToName,
  };

  try {
    const data = await ses.sendEmail(params).promise();
    console.log('Email submitted to SES', data);
  } catch (error) {
    console.error(error);
  }
};
