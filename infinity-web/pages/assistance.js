export const Assistance = {
    render: async () => {
        return `
            <div class="page-container">
                <header class="section-title">
                    <h1>ASSISTANCE</h1>
                    <p>Master the terminal with community-driven wisdom.</p>
                </header>
                <div class="faq-list">
                    <div class="faq-item">
                        <h3>How do I use these scripts?</h3>
                        <p>Most scripts are designed for Termux or Linux environments. Use the 'GET SCRIPT' button to view source or download directly to your ~/bin.</p>
                    </div>
                    <div class="faq-item">
                        <h3>What is the 'IWL' feature?</h3>
                        <p>It stands for 'I Would Like'. It's your direct line to request specific tools or terminal automations that don't exist yet.</p>
                    </div>
                </div>
            </div>
        `;
    }
};
