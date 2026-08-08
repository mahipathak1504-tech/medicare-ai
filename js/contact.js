const contactForm = document.querySelector(".contact-form form");

contactForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = contactForm
        .querySelector('input[placeholder="Full Name"]')
        .value.trim();

    const email = contactForm
        .querySelector('input[placeholder="Email"]')
        .value.trim();

    const subject = contactForm
        .querySelector('input[placeholder="Subject"]')
        .value.trim();

    const message = contactForm
        .querySelector("textarea")
        .value.trim();


    if (!name || !email || !subject || !message) {

        alert("Please fill all the details.");

        return;
    }


    // WhatsApp message
    const whatsappMessage =
`Hello MediCare AI,

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`;


    const whatsappURL =
        "https://wa.me/919227139136?text=" +
        encodeURIComponent(whatsappMessage);


    // Email
    const emailBody =
`Name: ${name}
Email: ${email}

Subject:
${subject}

Message:
${message}`;


    const emailURL =
        "mailto:priyalpatel441@gmail.com" +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(emailBody);


    // Open WhatsApp
    window.open(whatsappURL, "_blank");


    // Open Email
    window.location.href = emailURL;


    // Clear form
    contactForm.reset();

});