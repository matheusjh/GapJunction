const productClauses = {
    cocoa: "The supplier agrees to deliver cocoa powder meeting industry standards, including minimum cocoa butter content of 20% and proper labeling as per international trade regulations.",
    cotton: "The supplier agrees to provide cotton meeting the requirements of Grade A certification under the International Cotton Association."
};

// Define jurisdiction-specific clauses
const jurisdictionClauses = {
    USA: "This agreement shall be governed by the laws of the United States, including compliance with FDA and USDA regulations.",
    EU: "This agreement shall be governed by the laws of the European Union, including compliance with REACH and EFSA standards."
};


function getContractData(){
  var chainStage = document.getElementById("chainStage").value;
  var companyName = document.getElementById("companyName").value;
  var productName = document.getElementById("productName").value;
  var transactionType = document.getElementById("transactionType").value;
  var date = document.getElementById("date_of_birth").value;
  var productType = document.getElementById('productType').value;
  var jurisdiction = document.getElementById('jurisdiction').value;

  displayLawContent();

  localStorage.clear();

  localStorage.setItem('ChainStage', JSON.stringify(chainStage));
  localStorage.setItem('CompanyName', JSON.stringify(companyName));
  localStorage.setItem('ProductName', JSON.stringify(productName));
  localStorage.setItem('TransactionType', JSON.stringify(transactionType));
  localStorage.setItem('Date', JSON.stringify(date));
  localStorage.setItem('ProductType', JSON.stringify(productType));
  localStorage.setItem('Jurisdiction', JSON.stringify(jurisdiction));

  
}

function displayLawContent(){
    var productType = document.getElementById('productType').value;
        var jurisdiction = document.getElementById('jurisdiction').value;

        // Get the specific clauses
        var productClause = productClauses[productType];
        var jurisdictionClause = jurisdictionClauses[jurisdiction];

        // Combine the clauses into a single text
        var combinedClauses = `<strong>Product Clause:</strong> ${productClause}<br><br><strong>Jurisdiction Clause:</strong> ${jurisdictionClause}`;

        // Display the text in the "getLaw" div
        document.getElementById('content').innerHTML = combinedClauses;
}

function generateAndDisplayPDF() {


var chain = JSON.parse(localStorage.getItem('ChainStage'));
var company = JSON.parse(localStorage.getItem('CompanyName'));
var product = JSON.parse(localStorage.getItem('ProductName'));
var transaction = JSON.parse(localStorage.getItem('TransactionType'));
var date = JSON.parse(localStorage.getItem('Date'));
var product_type = JSON.parse(localStorage.getItem('ProductType'));
var juristictionType = JSON.parse(localStorage.getItem('Jurisdiction'));


let contracts = []; // Array to store all generated contracts
const invoiceDiv = document.getElementById('invoice');

// Initialize Signature Pad
const signatureCanvas = document.getElementById('signature-pad');
const signaturePad = new SignaturePad(signatureCanvas);

// Clear Signature
document.getElementById('clear-signature').addEventListener('click', () => {
    signaturePad.clear();
});

// Generate Contract
document.getElementById('generate-contract').addEventListener('click', () => {
    const contractId = `contract-${Date.now()}`;
    
    // Generate contract content
    const contractContent = {
        content: [
            { text: 'SUPPLY AGREEMENT', style: 'header', alignment: 'center' },
            { text: `This agreement is entered into by ${company} and GapJunction`, style: 'subheader' },
            { text: `Product Type: ${product_type}`, margin: [0, 10, 0, 10] },
            { text: 'Product-Specific Clause:', bold: true },
            { text: productClauses[product_type], margin: [0, 5, 0, 10] },
            { text: 'Jurisdiction-Specific Clause:', bold: true },
            { text: jurisdictionClauses[juristictionType], margin: [0, 5, 0, 10] },
            { text: 'General Terms:', bold: true },
            { ul: [
                'Both parties agree to act in good faith and comply with all applicable laws.',
                'This agreement is valid until terminated by mutual consent or upon fulfillment of obligations.'
            ] },
            { text: '\nSignatures:', style: 'subheader' }
        ],
        styles: {
            header: { fontSize: 18, bold: true },
            subheader: { fontSize: 14, margin: [0, 10, 0, 10] }
        }
    };
    // Generate the PDF and render it as a data URL for preview
    pdfMake.createPdf(contractContent).getDataUrl((dataUrl) => {
      // Update the #invoice div to display the PDF
      const invoiceDiv = document.getElementById('invoice');
      invoiceDiv.innerHTML = `
          <iframe src="${dataUrl}" width="100%" height="400px" style="border: none;"></iframe>
      `;
  });

    contracts.push({ id: contractId, content: contractContent }); // Store contract details

    // Display the contract preview (optional)
    const contractDiv = document.createElement('div');
    contractDiv.className = 'contract-container';
    contractDiv.innerHTML = `<p>Contract ID: ${contractId}</p>`;
    invoiceDiv.appendChild(contractDiv);
});

// E-Sign All Contracts
document.getElementById('sign-all-contracts').addEventListener('click', () => {
    if (signaturePad.isEmpty()) {
        alert('Please provide a signature before signing contracts.');
        return;
    }

    const signatureImage = signaturePad.toDataURL(); // Capture signature as image
    

    contracts.forEach((contract) => {
        var company = JSON.parse(localStorage.getItem('CompanyName'));
        // Add the signature to each contract
        contract.content.content.push({
            text: "Signed by " + company + ":",
            margin: [0, 10, 0, 0]
        });
        contract.content.content.push({
            image: signatureImage,
            width: 150,
            margin: [0, 10, 0, 10]
        });

        // Generate and download the signed PDF
        const savedContracts = JSON.parse(localStorage.getItem('SignedContracts')) || [];
            savedContracts.push({ id: contract.id, content: contract.content });
            localStorage.setItem('SignedContracts', JSON.stringify(savedContracts));

            // Generate and download the signed PDF
            pdfMake.createPdf(contract.content).download(`Signed-${contract.id}.pdf`);
    });

});

}

function getChanges(){
    var userChange = document.getElementById("changes").value;
    localStorage.setItem('UserChanges', JSON.stringify(userChange));
    window.location.href = "admin-page.html";
}

function adminChanges(){
    var adminChnage = document.getElementById("admin-changes").value;
    localStorage.setItem('admin', JSON.stringify(adminChnage));
    window.location.href = "contract.html";
}

function viewChanges(){
    document.getElementById("hide").style.display = 'block';
    var changes = JSON.parse(localStorage.getItem('UserChanges'));
    document.getElementById('participantChange').innerHTML = changes; 
}



let signaturePad;

        // Initialize SignaturePad
        window.onload = function() {
            signaturePad = new SignaturePad(document.getElementById('signature-pad'));
            loadContractFromLocalStorage();
        };

        // Load the saved contract from localStorage and display it
        function loadContractFromLocalStorage() {
            const savedContracts = JSON.parse(localStorage.getItem('SignedContracts')) || [];
            
            if (savedContracts.length > 0) {
                const contractToLoad = savedContracts[0]; // Load the first contract
                pdfMake.createPdf(contractToLoad.content).getDataUrl((dataUrl) => {
                    const contractContainer = document.getElementById('contract-container');
                    contractContainer.innerHTML = `
                        <iframe src="${dataUrl}" width="100%" height="500px" style="border: none;"></iframe>
                    `;
                });
            } else {
                alert('No contracts found in localStorage.');
            }
        }


        // Add the second signature to the contract
        function addSecondSignature() {

            if (signaturePad.isEmpty()) {
                alert("Please provide a signature before adding it to the contract.");
                return;
            }

            // Get the signature image as a base64 string
            const signatureImage = signaturePad.toDataURL();

            // Retrieve the saved contract
            const savedContracts = JSON.parse(localStorage.getItem('SignedContracts')) || [];
            if (savedContracts.length > 0) {
                const contractToUpdate = savedContracts[0]; // Get the first contract
                
                // Add the second signature to the contract content
                contractToUpdate.content.content.push({
                    text: "Second Signature:",
                    margin: [0, 10, 0, 5]
                });
                contractToUpdate.content.content.push({
                    image: signatureImage,
                    width: 150,
                    margin: [0, 10, 0, 10]
                });

                // Store the updated contract back into localStorage
                localStorage.setItem('SignedContracts', JSON.stringify(savedContracts));
            } else {
                alert('No contract found to update.');
            
            }
            const statusData = { text: "Confirmed", color: "green" };
            localStorage.setItem('ContractStatus', JSON.stringify(statusData));

            window.location.href = "contract.html"
        }
