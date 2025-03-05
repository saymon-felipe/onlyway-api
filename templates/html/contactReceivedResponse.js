let template = `
    <table style="max-width: 600px; width: 100%; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td style="text-align: center;">
                <h2 style="color: #ff7b00;">OnlyWay</h2>
                <p style="color: #555; font-size: 16px;">Recebemos sua mensagem e entraremos em contato em breve!</p>
                <hr style="border: none; height: 1px; background: #ddd; margin: 20px 0;">
            </td>
        </tr>
        <tr>
            <td>
                <p><strong>Nome:</strong> {nome}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Motivo:</strong> {motivo}</p>
                <p><strong>Mensagem:</strong></p>
                <p style="background: #f9f9f9; padding: 10px; border-radius: 5px; color: #333;">{mensagem}</p>
            </td>
        </tr>
        <tr>
            <td style="text-align: center; padding-top: 20px;">
                <p style="font-size: 14px; color: #777;">Agradecemos o seu contato! Em breve retornaremos.</p>
                <p style="font-size: 14px; color: #777;">&copy; 2025 OnlyWay - Todos os direitos reservados.</p>
            </td>
        </tr>
    </table>
`;

module.exports = template;