export function renderAssistancePage() {
  return `<div class="iframe-container">
    <iframe 
        src="https://swinfinity.forestry.md/" 
        title="Swinfinity" 
        loading="lazy" 
        allowfullscreen>
    </iframe>
</div>

<style>
.iframe-container {
    position: relative;
    width: 100%;
    /* Sets a fluid height. Adjust the min-height for mobile if needed */
    height: 80vh; 
    min-height: 450px;
}

.iframe-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}
</style>

    `;
}